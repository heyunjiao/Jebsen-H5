/**
 * 基于 Axios 拦截器的 Mock 方案
 * 不依赖 vite-plugin-mock，直接在 axios 层面拦截请求
 */
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { CustomerProfile, TagPool, MobileData, MobileItem, MaintenanceRecord, Appointment, PlatformSource } from '@/types/customer'
import { mockCustomerProfile, mockTagPool, mockRelationTagPool, mockMaintenanceRecords } from './data'

// 模拟网络延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// API 响应格式
interface MockResponse<T> {
  code: number
  message: string
  data: T
}

// 检查是否启用 Mock
const isMockEnabled = () => {
  // 开发环境默认启用，可通过环境变量控制
  const env = import.meta.env.MODE
  const useMock = import.meta.env.VITE_USE_MOCK !== 'false'
  return env === 'development' && useMock
}

/**
 * Mock 请求拦截器
 * 在 axios 请求拦截器中调用，如果匹配到 Mock 规则则返回 Mock 数据
 */
export async function mockRequestInterceptor(
  config: AxiosRequestConfig
): Promise<AxiosResponse | null> {
  // 如果未启用 Mock，直接返回 null，让请求正常发送
  if (!isMockEnabled()) {
    return null
  }

  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()
  const baseURL = config.baseURL || '/api'

  // 构建完整路径
  const fullPath = url.startsWith('http') ? url : `${baseURL}${url}`

  console.log(`[Mock] 拦截请求: ${method.toUpperCase()} ${fullPath}`, {
    originalUrl: url,
    baseURL,
    method,
    fullPath,
  })

  // 根据路径和方法匹配 Mock 规则
  let mockResponse: MockResponse<any> | null = null

  try {
    // GET /api/customer/profile
    if (method === 'get' && fullPath.includes('/customer/profile')) {
      await delay(800)
      mockResponse = {
        code: 200,
        message: 'success',
        data: mockCustomerProfile,
      }
    }
    // GET /api/customer/tags/pool
    else if (method === 'get' && fullPath.includes('/customer/tags/pool') && !fullPath.includes('/relation-pool')) {
      await delay(500)
      mockResponse = {
        code: 200,
        message: 'success',
        data: mockTagPool,
      }
    }
    // GET /api/customer/tags/relation-pool
    else if (method === 'get' && fullPath.includes('/customer/tags/relation-pool')) {
      await delay(500)
      mockResponse = {
        code: 200,
        message: 'success',
        data: mockRelationTagPool,
      }
    }
    // GET /api/customer/maintenance/records
    else if (method === 'get' && fullPath.includes('/customer/maintenance/records')) {
      await delay(800)
      mockResponse = {
        code: 200,
        message: 'success',
        data: mockMaintenanceRecords,
      }
    }
    // PUT /api/customer/maintenance/records/:id/tags
    else if (method === 'put' && fullPath.includes('/customer/maintenance/records/') && fullPath.includes('/tags')) {
      await delay(700)
      const match = fullPath.match(/\/records\/([^/]+)\/tags/)
      const recordId = match ? match[1] : null
      const tags = (config.data as any)?.tags
      
      if (!recordId) {
        mockResponse = {
          code: 400,
          message: '缺少记录ID',
          data: null,
        }
      } else if (!Array.isArray(tags)) {
        mockResponse = {
          code: 400,
          message: '标签格式不正确',
          data: null,
        }
      } else {
        const record = mockMaintenanceRecords.find((r) => r.id === recordId)
        if (!record) {
          mockResponse = {
            code: 404,
            message: '记录不存在',
            data: null,
          }
        } else {
          record.tags = tags
          mockResponse = {
            code: 200,
            message: '更新成功',
            data: { tags },
          }
        }
      }
    }
    // POST /api/customer/mobile
    else if (method === 'post' && fullPath.includes('/customer/mobile') && !fullPath.includes('/items') && !fullPath.includes('/merge')) {
      await delay(600)
      const mobile = (config.data as any)?.mobile
      if (!mobile || !/^1[3-9]\d{9}$/.test(mobile)) {
        mockResponse = {
          code: 400,
          message: '手机号格式不正确',
          data: null,
        }
      } else {
        const mobileData = mockCustomerProfile.mobile
        if ('value' in mobileData) {
          mobileData.value = mobile
        } else if ('items' in mobileData) {
          const primaryItem = mobileData.items.find((i) => i.isPrimary)
          if (primaryItem) {
            primaryItem.mobile = mobile
          }
        }
        mockResponse = {
          code: 200,
          message: '更新成功',
          data: { mobile },
        }
      }
    }
    // POST /api/customer/tags
    else if (method === 'post' && fullPath.includes('/customer/tags') && !fullPath.includes('/pool')) {
      await delay(700)
      const tagId = (config.data as any)?.tagId
      if (!tagId) {
        mockResponse = {
          code: 400,
          message: '缺少标签ID',
          data: null,
        }
      } else {
        const tag = mockTagPool.find((t) => t.id === tagId)
        if (!tag) {
          mockResponse = {
            code: 400,
            message: '标签不存在',
            data: null,
          }
        } else {
          if (!mockCustomerProfile.tags.includes(tag.name)) {
            mockCustomerProfile.tags.push(tag.name)
          }
          mockResponse = {
            code: 200,
            message: '添加成功',
            data: { tags: mockCustomerProfile.tags },
          }
        }
      }
    }
    // DELETE /api/customer/tags
    else if (method === 'delete' && fullPath.includes('/customer/tags') && !fullPath.includes('/pool')) {
      await delay(700)
      const tagName = (config.params as any)?.tagName
      if (!tagName) {
        mockResponse = {
          code: 400,
          message: '缺少标签名称',
          data: null,
        }
      } else {
        const index = mockCustomerProfile.tags.indexOf(tagName)
        if (index > -1) {
          mockCustomerProfile.tags.splice(index, 1)
        }
        mockResponse = {
          code: 200,
          message: '删除成功',
          data: { tags: mockCustomerProfile.tags },
        }
      }
    }
    // POST /api/customer/mobile/items
    else if (method === 'post' && fullPath.includes('/customer/mobile/items')) {
      await delay(600)
      const body = config.data as any
      const { mobile, relationTagId, relationTagName, isPrimary } = body
      if (!mobile || !/^1[3-9]\d{9}$/.test(mobile)) {
        mockResponse = {
          code: 400,
          message: '手机号格式不正确',
          data: null,
        }
      } else {
        const mobileData = mockCustomerProfile.mobile as MobileData
        // 如果设置为主号，先将原来的主号改为副号
        if (isPrimary) {
          const currentPrimary = mobileData.items.find(item => item.isPrimary)
          if (currentPrimary) {
            currentPrimary.isPrimary = false
          }
        }
        const newItem: MobileItem = {
          id: `mobile${Date.now()}`,
          mobile,
          isPrimary: isPrimary || false,
          relationTagId,
          relationTagName,
          updateTime: new Date().toLocaleString('zh-CN'),
        }
        mobileData.items.push(newItem)
        mobileData.isConflict = mobileData.items.length > 1
        mockResponse = {
          code: 200,
          message: '添加成功',
          data: newItem,
        }
      }
    }
    // PUT /api/customer/mobile/items
    else if (method === 'put' && fullPath.includes('/customer/mobile/items')) {
      await delay(600)
      const body = config.data as any
      const { id, mobile, relationTagId, relationTagName, isPrimary } = body
      if (!id) {
        mockResponse = {
          code: 400,
          message: '缺少电话号码ID',
          data: null,
        }
      } else if (!mobile || !/^1[3-9]\d{9}$/.test(mobile)) {
        mockResponse = {
          code: 400,
          message: '手机号格式不正确',
          data: null,
        }
      } else {
        const mobileData = mockCustomerProfile.mobile as MobileData
        const item = mobileData.items.find((i) => i.id === id)
        if (!item) {
          mockResponse = {
            code: 404,
            message: '电话号码不存在',
            data: null,
          }
        } else {
          // 如果设置为主号，先将原来的主号改为副号
          if (isPrimary !== undefined && isPrimary) {
            const currentPrimary = mobileData.items.find(i => i.isPrimary && i.id !== id)
            if (currentPrimary) {
              currentPrimary.isPrimary = false
            }
          }
          item.mobile = mobile
          item.relationTagId = relationTagId
          item.relationTagName = relationTagName
          if (isPrimary !== undefined) {
            item.isPrimary = isPrimary
          }
          item.updateTime = new Date().toLocaleString('zh-CN')
          mockResponse = {
            code: 200,
            message: '更新成功',
            data: item,
          }
        }
      }
    }
    // DELETE /api/customer/mobile/items/:id
    else if (method === 'delete' && fullPath.includes('/customer/mobile/items/')) {
      await delay(600)
      const match = fullPath.match(/\/items\/([^/?]+)/)
      const id = match ? match[1] : null
      if (!id) {
        mockResponse = {
          code: 400,
          message: '缺少电话号码ID',
          data: null,
        }
      } else {
        const mobileData = mockCustomerProfile.mobile as MobileData
        const item = mobileData.items.find((i) => i.id === id)
        if (!item) {
          mockResponse = {
            code: 404,
            message: '电话号码不存在',
            data: null,
          }
        } else if (item.isPrimary) {
          mockResponse = {
            code: 400,
            message: '不能删除主号码',
            data: null,
          }
        } else {
          mobileData.items = mobileData.items.filter((i) => i.id !== id)
          mobileData.isConflict = mobileData.items.length > 1
          mockResponse = {
            code: 200,
            message: '删除成功',
            data: { success: true },
          }
        }
      }
    }
    // POST /api/customer/mobile/merge
    else if (method === 'post' && fullPath.includes('/customer/mobile/merge')) {
      await delay(800)
      const body = config.data as any
      const { ids } = body
      if (!Array.isArray(ids) || ids.length === 0) {
        mockResponse = {
          code: 400,
          message: '请选择要合并的号码',
          data: null,
        }
      } else {
        const mobileData = mockCustomerProfile.mobile as MobileData
        const primaryItem = mobileData.items.find((i) => i.isPrimary)
        if (!primaryItem) {
          mockResponse = {
            code: 400,
            message: '未找到主号码',
            data: null,
          }
        } else {
          const updatedMobileData: MobileData = {
            items: mobileData.items.filter(
              (i) => i.isPrimary || !ids.includes(i.id)
            ),
            isConflict: false,
            editable: mobileData.editable,
          }
          updatedMobileData.isConflict = updatedMobileData.items.length > 1
          mockResponse = {
            code: 200,
            message: '合并成功',
            data: updatedMobileData,
          }
        }
      }
    }
    // PUT /api/customer/preferred-car-model/tags
    else if (method === 'put' && fullPath.includes('/customer/preferred-car-model/tags')) {
      await delay(700)
      const body = config.data as any
      const { tags } = body
      
      if (!Array.isArray(tags)) {
        mockResponse = {
          code: 400,
          message: '标签格式不正确',
          data: null,
        }
      } else {
        // 更新 mock 数据中的用户偏好标签
        if (!mockCustomerProfile.preferredCarModel.tags) {
          mockCustomerProfile.preferredCarModel.tags = []
        }
        mockCustomerProfile.preferredCarModel.tags = tags
        
        mockResponse = {
          code: 200,
          message: '更新成功',
          data: { tags },
        }
      }
    }
    // GET /api/customer/transactions
    else if (method === 'get' && fullPath.includes('/customer/transactions')) {
      await delay(800)
      const transactions = mockCustomerProfile.transactions || []
      mockResponse = {
        code: 200,
        message: 'success',
        data: transactions,
      }
    }
    // GET /api/customer/vehicles
    else if (method === 'get' && fullPath.includes('/customer/vehicles')) {
      await delay(800)
      const vehicles = mockCustomerProfile.vehicles || []
      mockResponse = {
        code: 200,
        message: 'success',
        data: vehicles,
      }
    }
    // GET /api/customer/assets
    else if (method === 'get' && fullPath.includes('/customer/assets')) {
      await delay(800)
      const assets = mockCustomerProfile.assets || []
      mockResponse = {
        code: 200,
        message: 'success',
        data: assets,
      }
    }
    // GET /api/customer/appointments
    else if (method === 'get' && fullPath.includes('/customer/appointments')) {
      console.log('[Mock] 匹配到 appointments 接口')
      await delay(800)
      const mockAppointments: Appointment[] = [
        {
          id: 'A001',
          type: '试驾预约',
          date: '2024-02-15',
          time: '14:00',
          store: '北京朝阳4S店',
          status: '已确认',
          description: '预约试驾BMW 3系 2024款',
          vehicleModel: 'BMW 3系 2024款',
          source: '官网',
        },
        {
          id: 'A002',
          type: '保养预约',
          date: '2024-02-20',
          time: '10:00',
          store: '北京朝阳4S店',
          status: '待确认',
          description: '定期保养服务',
          vehicleModel: 'BMW 3系 2023款',
          source: '官网',
        },
      ]
      mockResponse = {
        code: 200,
        message: 'success',
        data: mockAppointments,
      }
      console.log('[Mock] appointments Mock 数据:', mockResponse)
    }
    // GET /api/customer/platform-sources
    else if (method === 'get' && fullPath.includes('/customer/platform-sources')) {
      await delay(800)
      const mockPlatformSources: PlatformSource[] = [
        {
          id: 'PS001',
          name: 'DMS',
          type: '每日导出 CSV',
          mergeTime: '2023-10-01 10:30:00',
          keyInfo: {
            name: '张三',
            mobile: '13800138000',
            age: 35,
            gender: '男',
            city: '北京',
          },
        },
        {
          id: 'PS002',
          name: 'POAS',
          type: 'POAS系统',
          mergeTime: '2023-09-28 14:20:00',
          keyInfo: {
            name: '张三',
            mobile: '13800138000',
            age: 35,
            gender: '男',
            city: '北京',
          },
        },
        {
          id: 'PS003',
          name: 'WWS',
          type: 'WWS系统',
          mergeTime: '2023-09-25 09:15:00',
          keyInfo: {
            name: '张三',
            mobile: '13800138000',
            age: 35,
            gender: '男',
            city: '北京',
          },
        },
        {
          id: 'PS004',
          name: 'C@P',
          type: 'C@P系统',
          mergeTime: '2023-09-22 16:45:00',
          keyInfo: {
            name: '张三',
            mobile: '13800138000',
            age: 35,
            gender: '男',
            city: '北京',
          },
        },
        {
          id: 'PS005',
          name: 'BDC',
          type: 'BDC系统',
          mergeTime: '2023-09-20 11:30:00',
          keyInfo: {
            name: '张三',
            mobile: '13800138000',
            age: 35,
            gender: '男',
            city: '北京',
          },
        },
        {
          id: 'PS006',
          name: 'Voucher',
          type: 'Voucher系统',
          mergeTime: '2023-09-18 13:20:00',
          keyInfo: {
            name: '张三',
            mobile: '13800138000',
            age: 35,
            gender: '男',
            city: '北京',
          },
        },
        {
          id: 'PS007',
          name: 'CRM',
          type: 'CRM系统',
          mergeTime: '2023-09-15 10:00:00',
          keyInfo: {
            name: '张三',
            mobile: '13800138000',
            age: 35,
            gender: '男',
            city: '北京',
          },
        },
      ]
      mockResponse = {
        code: 200,
        message: 'success',
        data: mockPlatformSources,
      }
    }
    // POST /api/customer/conflicts/name-mobile
    else if (method === 'post' && fullPath.includes('/customer/conflicts/name-mobile')) {
      await delay(800)
      const body = config.data as any
      const { selectedIds, note } = body
      if (!selectedIds || !Array.isArray(selectedIds) || selectedIds.length === 0) {
        mockResponse = {
          code: 400,
          message: '请至少选择一项',
          data: null,
        }
      } else {
        mockResponse = {
          code: 200,
          message: '提交成功，后台管理人员将尽快处理',
          data: { success: true },
        }
      }
    }
    // PUT /api/customer/basic-info
    else if (method === 'put' && fullPath.includes('/customer/basic-info')) {
      await delay(800)
      const body = config.data as any
      
      // 验证更改理由
      if (!body.reason || !body.reason.trim()) {
        mockResponse = {
          code: 400,
          message: '请输入更改理由',
          data: { success: false },
        }
      }
      // 手机号格式验证
      else if (body.mobile && !/^1[3-9]\d{9}$/.test(String(body.mobile))) {
        mockResponse = {
          code: 400,
          message: '手机号格式不正确',
          data: { success: false },
        }
      }
      // 年龄验证
      else if (body.age !== undefined && (isNaN(Number(body.age)) || Number(body.age) < 0 || Number(body.age) > 150)) {
        mockResponse = {
          code: 400,
          message: '年龄格式不正确',
          data: { success: false },
        }
      }
      else {
        mockResponse = {
          code: 200,
          message: '提交成功，等待后台审核',
          data: { success: true },
        }
      }
    }
    // POST /api/customer/fields/correction
    else if (method === 'post' && fullPath.includes('/customer/fields/correction')) {
      await delay(800)
      const body = config.data as any
      
      // 验证必填字段
      if (!body.field || body.currentValue === undefined || body.correctValue === undefined) {
        mockResponse = {
          code: 400,
          message: '字段名、当前值和纠错值不能为空',
          data: { success: false },
        }
      }
      // 验证值是否变化
      else if (String(body.currentValue) === String(body.correctValue)) {
        mockResponse = {
          code: 400,
          message: '纠错值应与当前值不同',
          data: { success: false },
        }
      }
      // 手机号格式验证
      else if (body.field === 'mobile' && !/^1[3-9]\d{9}$/.test(String(body.correctValue))) {
        mockResponse = {
          code: 400,
          message: '手机号格式不正确',
          data: { success: false },
        }
      }
      else {
        mockResponse = {
          code: 200,
          message: '纠错信息已提交，等待审核',
          data: { success: true },
        }
      }
    }

    // 如果匹配到 Mock 规则，返回 Mock 响应
    if (mockResponse) {
      console.log(`[Mock] 返回 Mock 数据:`, {
        url: fullPath,
        method,
        response: mockResponse,
        dataType: typeof mockResponse.data,
        isArray: Array.isArray(mockResponse.data),
        dataLength: Array.isArray(mockResponse.data) ? mockResponse.data.length : 'N/A',
      })
      return {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
      } as AxiosResponse
    } else {
      console.log(`[Mock] 未匹配到 Mock 规则: ${method.toUpperCase()} ${fullPath}`)
    }
  } catch (error) {
    console.error('[Mock] 处理请求时出错:', error)
  }

  // 没有匹配到 Mock 规则，返回 null，让请求正常发送
  return null
}

