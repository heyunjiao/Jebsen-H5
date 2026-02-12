import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { CustomerProfile, TagPool, SourceDetail, MobileItem, MobileData, MaintenanceRecord, TransactionRecord, VehicleRelation, Asset, ConflictResolution, Appointment, PlatformSource, Opportunity, OperationLog, InsuranceRecord, MarketingCampaign, FinancialLoanRecord } from '@/types/customer'
import { mockRequestInterceptor } from '@/mock'

// API 响应基础类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 导出类型供外部使用
export type { CustomerProfile, TagPool, SourceDetail, MobileItem, MobileData, MaintenanceRecord, TransactionRecord, VehicleRelation, Asset, ConflictResolution, Appointment, PlatformSource, Opportunity, OperationLog, InsuranceRecord, MarketingCampaign, FinancialLoanRecord }

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

// 请求拦截器
request.interceptors.request.use(
  async (config) => {
    // 添加 token 等认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 检查是否需要使用 Mock（在请求发送前）
    const mockResponse = await mockRequestInterceptor(config)
    if (mockResponse) {
      // 如果匹配到 Mock，修改请求配置，使用一个特殊的 adapter
      // 这个 adapter 会直接返回 Mock 响应，而不发送真实请求
      ; (config as any).adapter = async () => {
        return mockResponse
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    const url = response.config.url || ''
    const fullUrl = response.config.url || response.request?.responseURL || url

    console.log(`[API] 响应拦截器处理: ${fullUrl}`, {
      dataType: typeof res,
      isString: typeof res === 'string',
      isArray: Array.isArray(res),
      isObject: typeof res === 'object' && res !== null,
      hasCode: typeof res === 'object' && res !== null && 'code' in res,
      firstChars: typeof res === 'string' ? res.substring(0, 50) : undefined,
    })

    // 检查是否是 HTML 响应（Mock 未生效，返回了 HTML 页面）
    if (typeof res === 'string') {
      if (res.includes('<!DOCTYPE') || res.includes('<html') || res.trim().startsWith('<!')) {
        console.error(`[API] 收到 HTML 响应而非 JSON，Mock 可能未生效: ${fullUrl}`)
        console.error(`[API] HTML 内容预览:`, res.substring(0, 200))
        return Promise.reject(new Error('Mock 未生效，返回了 HTML 页面'))
      }
    }

    // 处理空对象的情况（Mock 未生效时的 fallback）
    if (!res || (typeof res === 'object' && Object.keys(res).length === 0)) {
      console.warn(`[API] 响应数据为空: ${url}`, response)
      // 静默处理，让 store 的 fallback 处理
      if (url.includes('/customer/profile') || url.includes('/customer/tags/pool')) {
        return Promise.reject(new Error('Mock 未生效，使用本地数据'))
      }
      return Promise.reject(new Error('响应数据为空，请检查 Mock 配置'))
    }

    // 如果 res 不是对象，或者没有 code 属性，可能是 Mock 格式问题
    if (typeof res !== 'object' || !('code' in res)) {
      console.warn(`[API] 响应格式异常: ${url}`, res)
      // 如果 res 是字符串但不是 HTML，可能是错误信息
      if (typeof res === 'string') {
        console.error(`[API] 收到字符串响应: ${url}`, res.substring(0, 100))
        return Promise.reject(new Error('响应格式错误：收到字符串而非 JSON'))
      }
      // 如果 Mock 直接返回了数据数组，包装成标准格式
      if (Array.isArray(res)) {
        // 检查数组内容是否异常（比如是字符数组，说明可能是 HTML 被错误解析）
        if (res.length > 0 && typeof res[0] === 'string' && res[0].length === 1) {
          console.error(`[API] 警告：返回的数组看起来像是 HTML 字符数组: ${url}`)
          return Promise.reject(new Error('响应数据格式错误：可能是 HTML 内容'))
        }
        // 对于 appointments 接口，如果返回的数组长度异常，记录警告
        if (url.includes('/appointments') && res.length > 10) {
          console.error(`[API] 警告：appointments 接口返回了异常数量的数据 (${res.length} 条)，可能数据源错误`)
        }
        return {
          code: 200,
          message: 'success',
          data: res,
        }
      }
      // 如果已经是标准格式但缺少 code，添加默认值
      return {
        code: 200,
        message: 'success',
        data: res,
      }
    }

    // 检查 code 是否为 200
    if (res.code !== 200) {
      const errorMessage = res.message || '请求失败'
      console.error(`[API] 请求失败: ${url}`, res)
      return Promise.reject(new Error(errorMessage))
    }

    // 返回标准格式的响应
    return res
  },
  (error: any) => {
    // 改进错误处理，提供更详细的错误信息
    const url = error.config?.url || 'unknown'
    console.error(`[API] 请求错误: ${url}`, error)

    if (error.response) {
      // 服务器返回了错误状态码
      const res = error.response.data
      const message = res?.message || `请求失败: ${error.response.status}`
      return Promise.reject(new Error(message))
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('请求未收到响应:', error.request)
      return Promise.reject(new Error('网络错误，请检查网络连接'))
    } else {
      // 其他错误（包括拦截器 reject 的错误）
      return Promise.reject(error)
    }
  }
)

// API 方法
export const customerApi = {
  // 获取客户画像
  getProfile: (customerId?: string): Promise<ApiResponse<CustomerProfile>> => {
    return request.get('/customer/profile', {
      params: { customerId },
    })
  },

  // 更新手机号
  updateMobile: (mobile: string): Promise<ApiResponse<{ mobile: string }>> => {
    return request.post('/customer/mobile', { mobile })
  },

  // 获取标签池
  getTagPool: (): Promise<ApiResponse<TagPool[]>> => {
    return request.get('/customer/tags/pool')
  },

  // 获取关系标签池
  getRelationTagPool: (): Promise<ApiResponse<TagPool[]>> => {
    return request.get('/customer/tags/relation-pool')
  },

  // 添加标签
  addTag: (tagId: string): Promise<ApiResponse<{ tags: string[] }>> => {
    return request.post('/customer/tags', { tagId })
  },

  // 删除标签
  removeTag: (tagName: string): Promise<ApiResponse<{ tags: string[] }>> => {
    return request.delete('/customer/tags', {
      params: { tagName },
    })
  },

  // 批量更新标签（一次性提交）
  updateTags: (tags: string[]): Promise<ApiResponse<{ tags: string[] }>> => {
    return request.put('/customer/tags', { tags })
  },

  // 新增电话号码
  addMobileItem: (data: {
    mobile: string
    relationTagId?: string
    relationTagName?: string
    relationTagIds?: string[]
    relationTagNames?: string[]
    businessTags?: string[]
    isPrimary?: boolean
  }): Promise<ApiResponse<MobileItem>> => {
    return request.post('/customer/mobile/items', data)
  },

  // 更新电话号码
  updateMobileItem: (data: {
    id: string
    mobile: string
    relationTagId?: string
    relationTagName?: string
    relationTagIds?: string[]
    relationTagNames?: string[]
    businessTags?: string[]
    isPrimary?: boolean
  }): Promise<ApiResponse<MobileItem>> => {
    return request.put('/customer/mobile/items', data)
  },

  // 删除电话号码
  deleteMobileItem: (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return request.delete(`/customer/mobile/items/${id}`)
  },

  // 合并电话号码
  mergeMobileItems: (ids: string[]): Promise<ApiResponse<MobileData>> => {
    return request.post('/customer/mobile/merge', { ids })
  },

  // 获取维保记录
  getMaintenanceRecords: (customerId?: string): Promise<ApiResponse<MaintenanceRecord[]>> => {
    return request.get('/customer/maintenance/records', {
      params: { customerId },
    })
  },

  // 更新维保记录标签
  updateMaintenanceTags: (recordId: string, tags: string[]): Promise<ApiResponse<{ tags: string[] }>> => {
    return request.put(`/customer/maintenance/records/${recordId}/tags`, { tags })
  },

  // 更新用户偏好标签
  updatePreferredCarModelTags: (tags: string[]): Promise<ApiResponse<{ tags: string[] }>> => {
    return request.put('/customer/preferred-car-model/tags', { tags })
  },

  // 获取交易记录
  getTransactions: (customerId?: string): Promise<ApiResponse<TransactionRecord[]>> => {
    return request.get('/customer/transactions', {
      params: { customerId },
    })
  },

  // 获取车辆关联
  getVehicles: (customerId?: string): Promise<ApiResponse<VehicleRelation[]>> => {
    return request.get('/customer/vehicles', {
      params: { customerId },
    })
  },

  // 更新车辆状态
  updateVehicleStatus: (vehicleId: string, status: string): Promise<ApiResponse<VehicleRelation>> => {
    return request.put(`/customer/vehicles/${vehicleId}/status`, { status })
  },

  // 获取资产中心
  getAssets: (customerId?: string): Promise<ApiResponse<Asset[]>> => {
    return request.get('/customer/assets', {
      params: { customerId },
    })
  },

  // 获取服务偏好标签池
  getServicePreferenceTagPool: (): Promise<ApiResponse<TagPool[]>> => {
    return request.get('/customer/service-preferences/tags/pool')
  },

  // 获取服务偏好
  getServicePreferences: (customerId?: string): Promise<ApiResponse<{ tags: string[] }>> => {
    return request.get('/customer/service-preferences', {
      params: { customerId },
    })
  },

  // 更新服务偏好
  updateServicePreferences: (tags: string[]): Promise<ApiResponse<{ tags: string[] }>> => {
    return request.put('/customer/service-preferences', { tags })
  },

  // 提交姓名+手机号冲突处理
  submitNameMobileConflict: (data: ConflictResolution): Promise<ApiResponse<{ success: boolean }>> => {
    return request.post('/customer/conflicts/name-mobile', data)
  },

  // 获取预约信息
  getAppointments: (customerId?: string): Promise<ApiResponse<Appointment[]>> => {
    return request.get('/customer/appointments', {
      params: { customerId },
    })
  },

  // 获取平台溯源信息
  getPlatformSources: (customerId?: string): Promise<ApiResponse<PlatformSource[]>> => {
    return request.get('/customer/platform-sources', {
      params: { customerId },
    })
  },

  // 提交字段纠错信息
  submitFieldCorrection: (data: {
    field: string // 字段名
    currentValue: string | number // 当前值
    correctValue: string | number // 纠错后的值
    note?: string // 备注信息
  }): Promise<ApiResponse<{ success: boolean }>> => {
    return request.post('/customer/fields/correction', data)
  },

  // 更新基础信息（提交审核）
  updateBasicInfo: (data: {
    name?: string
    age?: number
    mobile?: string
    gender?: string
    city?: string
    customerType?: string
    reason: string // 更改理由（必填）
  }): Promise<ApiResponse<{ success: boolean }>> => {
    return request.put('/customer/basic-info', data)
  },

  // 获取商机信息
  getOpportunities: (customerId?: string): Promise<ApiResponse<Opportunity[]>> => {
    return request.get('/customer/opportunities', {
      params: { customerId },
    })
  },

  // 获取操作日志
  getOperationLogs: (customerId?: string): Promise<ApiResponse<OperationLog[]>> => {
    return request.get('/customer/operation-logs', {
      params: { customerId },
    })
  },

  // 获取保险记录（支持分页）
  getInsuranceRecords: (params?: {
    customerId?: string
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{ list: InsuranceRecord[]; hasMore: boolean; total: number }>> => {
    return request.get('/customer/insurance/records', {
      params,
    })
  },

  // 获取线下活动记录（支持分页）
  getMarketingCampaigns: (params?: {
    customerId?: string
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{ list: MarketingCampaign[]; hasMore: boolean; total: number }>> => {
    return request.get('/customer/marketing-campaigns', {
      params,
    })
  },

  // 获取金融贷款记录（支持分页）
  getFinancialLoanRecords: (params?: {
    customerId?: string
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{ list: FinancialLoanRecord[]; hasMore: boolean; total: number }>> => {
    return request.get('/customer/loan/records', {
      params,
    })
  },
}

