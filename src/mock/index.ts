/**
 * 基于 Axios 拦截器的 Mock 方案
 * 不依赖 vite-plugin-mock，直接在 axios 层面拦截请求
 */
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { CustomerProfile, TagPool, MobileData, MobileItem, MaintenanceRecord, Appointment, PlatformSource, Opportunity, OperationLog, InsuranceRecord } from '@/types/customer'
import { mockCustomerProfile, mockTagPool, mockRelationTagPool, mockMaintenanceRecords } from './data'
import { normalizeInsuranceRecords, validateInsuranceRecords } from './rules'

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
      // 确保 latestOperation 字段存在
      const profileWithLatestOperation = {
        ...mockCustomerProfile,
        latestOperation: mockCustomerProfile.latestOperation || {
          operator: 'Rebecca Z.',
          operationType: '人工更新',
          operationTime: '2025-01-15 14:30:00',
        },
      }
      console.log('[Mock] profile latestOperation:', profileWithLatestOperation.latestOperation)
      mockResponse = {
        code: 200,
        message: 'success',
        data: profileWithLatestOperation,
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
    // GET /api/customer/insurance/records
    else if (method === 'get' && fullPath.includes('/customer/insurance/records')) {
      await delay(800)
      
      // 获取分页参数
      const params = config.params || {}
      const page = Number(params.page) || 1
      const pageSize = Number(params.pageSize) || 5
      
      // 定义保险记录原始数据（生成更多数据用于分页测试）
      const allMockInsuranceRecordsRaw: Partial<InsuranceRecord>[] = [
        {
          id: 'I001',
          type: '交强险',
          amount: 950,
          status: '已生效',
          company: '中国人保',
          policyNo: 'PICC202501150012345',
          startDate: '2025-01-15',
          endDate: '2026-01-14',
          purchaseDate: '2024-12-20',
          source: 'DMS',
        },
        {
          id: 'I002',
          type: '商业险',
          amount: 4850,
          status: '已生效',
          company: '中国人保',
          policyNo: 'PICC202501150012346',
          startDate: '2025-01-15',
          endDate: '2026-01-14',
          purchaseDate: '2024-12-20',
          source: 'DMS',
        },
        {
          id: 'I003',
          type: '第三者责任险',
          amount: 1200,
          status: '已生效',
          company: '平安保险',
          policyNo: 'PAIC202501150056789',
          startDate: '2025-01-15',
          endDate: '2026-01-14',
          purchaseDate: '2024-12-25',
          source: 'BDC',
        },
        {
          id: 'I004',
          type: '意外险',
          amount: 680,
          status: '已生效',
          company: '太平洋保险',
          policyNo: 'CPIC202501150090123',
          startDate: '2025-01-15',
          endDate: '2026-01-14',
          purchaseDate: '2024-12-28',
          source: 'CRM',
        },
        {
          id: 'I005',
          type: '交强险',
          amount: 950,
          status: '已过期',
          company: '中国人保',
          policyNo: 'PICC202401150012344',
          startDate: '2024-01-15',
          endDate: '2025-01-14',
          purchaseDate: '2023-12-20',
          source: 'DMS',
        },
        {
          id: 'I006',
          type: '商业险',
          amount: 5200,
          status: '待续保',
          company: '平安保险',
          policyNo: 'PAIC202406150056788',
          startDate: '2024-06-15',
          endDate: '2025-06-14',
          purchaseDate: '2024-05-25',
          source: 'BDC',
        },
        // 生成更多数据用于分页测试
        {
          id: 'I007',
          type: '交强险',
          amount: 980,
          status: '已生效',
          company: '太平洋保险',
          policyNo: 'CPIC202502150090124',
          startDate: '2025-02-15',
          endDate: '2026-02-14',
          purchaseDate: '2025-01-20',
          source: 'CRM',
        },
        {
          id: 'I008',
          type: '商业险',
          amount: 5200,
          status: '已生效',
          company: '中国人寿',
          policyNo: 'CLIC202502150012347',
          startDate: '2025-02-15',
          endDate: '2026-02-14',
          purchaseDate: '2025-01-25',
          source: 'DMS',
        },
        {
          id: 'I009',
          type: '第三者责任险',
          amount: 1500,
          status: '已生效',
          company: '大地保险',
          policyNo: 'CCIC202502150056790',
          startDate: '2025-02-15',
          endDate: '2026-02-14',
          purchaseDate: '2025-01-28',
          source: 'BDC',
        },
        {
          id: 'I010',
          type: '意外险',
          amount: 750,
          status: '已生效',
          company: '阳光保险',
          policyNo: 'SUN202502150090125',
          startDate: '2025-02-15',
          endDate: '2026-02-14',
          purchaseDate: '2025-02-10',
          source: 'CRM',
        },
        {
          id: 'I011',
          type: '交强险',
          amount: 960,
          status: '待续保',
          company: '中国人保',
          policyNo: 'PICC202502150012348',
          startDate: '2025-02-15',
          endDate: '2026-02-14',
          purchaseDate: '2025-01-20',
          source: 'DMS',
        },
        {
          id: 'I012',
          type: '商业险',
          amount: 5500,
          status: '已过期',
          company: '平安保险',
          policyNo: 'PAIC202503150056791',
          startDate: '2024-03-15',
          endDate: '2025-03-14',
          purchaseDate: '2024-02-25',
          source: 'BDC',
        },
      ]
      
      // 使用规则验证和规范化所有数据
      let allRecords: InsuranceRecord[]
      try {
        allRecords = normalizeInsuranceRecords(allMockInsuranceRecordsRaw)
        if (!validateInsuranceRecords(allRecords)) {
          console.error('[Mock] 保险记录数据验证失败，返回空数组')
          allRecords = []
        }
      } catch (error) {
        console.error('[Mock] 保险记录数据规范化失败:', error)
        allRecords = []
      }
      
      // 计算分页
      const total = allRecords.length
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const pageRecords = allRecords.slice(startIndex, endIndex)
      const hasMore = endIndex < total
      
      mockResponse = {
        code: 200,
        message: 'success',
        data: {
          list: pageRecords,
          hasMore,
          total,
        },
      }
      console.log(`[Mock] 保险记录分页返回: 第${page}页, 每页${pageSize}条, 共${total}条, 返回${pageRecords.length}条, 还有更多: ${hasMore}`)
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
    // PUT /api/customer/tags (批量更新标签)
    else if (method === 'put' && fullPath.includes('/customer/tags') && !fullPath.includes('/pool')) {
      await delay(800)
      const body = config.data as any
      const { tags } = body
      
      if (!Array.isArray(tags)) {
        mockResponse = {
          code: 400,
          message: '标签格式不正确',
          data: null,
        }
      } else {
        // 验证标签是否都在标签池中
        const invalidTags = tags.filter((tagName: string) => !mockTagPool.find(t => t.name === tagName))
        if (invalidTags.length > 0) {
          mockResponse = {
            code: 400,
            message: `以下标签不存在: ${invalidTags.join('、')}`,
            data: null,
          }
        } else {
          // 更新标签列表
          mockCustomerProfile.tags = [...tags]
          mockResponse = {
            code: 200,
            message: '更新成功',
            data: { tags: mockCustomerProfile.tags },
          }
        }
      }
    }
    // POST /api/customer/mobile/items
    else if (method === 'post' && fullPath.includes('/customer/mobile/items')) {
      await delay(600)
      const body = config.data as any
      const { mobile, relationTagId, relationTagName, relationTagIds, relationTagNames, businessTags, isPrimary } = body
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
          relationTagId: relationTagId || (relationTagIds && relationTagIds.length > 0 ? relationTagIds[0] : undefined),
          relationTagName: relationTagName || (relationTagNames && relationTagNames.length > 0 ? relationTagNames[0] : undefined),
          businessTags: businessTags || [],
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
      const { id, mobile, relationTagId, relationTagName, relationTagIds, relationTagNames, businessTags, isPrimary } = body
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
          // 关系标签（单选）
          if (relationTagId !== undefined) {
            item.relationTagId = relationTagId
            item.relationTagName = relationTagName
          } else if (relationTagIds !== undefined && relationTagIds.length > 0) {
            // 向后兼容
            item.relationTagId = relationTagIds[0]
            item.relationTagName = relationTagNames && relationTagNames.length > 0 ? relationTagNames[0] : undefined
          }
          // 业务标签（多选）
          if (businessTags !== undefined) {
            item.businessTags = businessTags
          }
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
    // PUT /api/customer/vehicles/:id/status
    else if (method === 'put' && fullPath.includes('/customer/vehicles/') && fullPath.includes('/status')) {
      await delay(800)
      const vehicleId = fullPath.match(/\/customer\/vehicles\/([^/]+)\/status/)?.[1]
      const status = (config.data && typeof config.data === 'string' ? JSON.parse(config.data) : config.data)?.status
      
      if (vehicleId && status) {
        // 查找并更新车辆状态
        const vehicles = mockCustomerProfile.vehicles || []
        const vehicle = vehicles.find((v: any) => v.id === vehicleId)
        if (vehicle) {
          vehicle.status = status
          mockResponse = {
            code: 200,
            message: 'success',
            data: vehicle,
          }
        } else {
          mockResponse = {
            code: 404,
            message: '车辆不存在',
            data: null,
          }
        }
      } else {
        mockResponse = {
          code: 400,
          message: '参数错误',
          data: null,
        }
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
          date: '2025-02-15',
          time: '14:00',
          store: '上海闵行4S店',
          status: '已确认',
          description: '预约试驾911 2025款',
          vehicleModel: '911 2025款',
          source: 'BDC',
        },
        {
          id: 'A002',
          type: '保养预约',
          date: '2025-02-20',
          time: '10:00',
          store: '上海浦东4S店',
          status: '待确认',
          description: '定期保养服务',
          vehicleModel: '911 2025款',
          source: 'BDC',
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
          mergeTime: '2025-10-01 10:30:00',
          keyInfo: {
            name: '陈明',
            mobile: '13800138000',
            age: 35,
            gender: '男',
            city: '上海',
          },
        },
        {
          id: 'PS002',
          name: 'POAS',
          type: 'POAS系统',
          mergeTime: '2025-09-28 14:20:00',
          keyInfo: {
            name: '陈明',
            mobile: '13800138000',
            age: 35,
            gender: '男',
            city: '上海',
          },
        },
        {
          id: 'PS003',
          name: 'WWS',
          type: 'WWS系统',
          mergeTime: '2025-09-25 09:15:00',
          keyInfo: {
            name: '陈明',
            mobile: '13800138000',
            age: 35,
            gender: '男',
            city: '上海',
          },
        },
        {
          id: 'PS004',
          name: 'C@P',
          type: 'C@P系统',
          mergeTime: '2025-09-22 16:45:00',
          keyInfo: {
            name: '陈明',
            mobile: '13800138000',
            age: 35,
            gender: '男',
            city: '上海',
          },
        },
        {
          id: 'PS005',
          name: 'BDC',
          type: 'BDC系统',
          mergeTime: '2025-09-20 11:30:00',
          keyInfo: {
            name: '陈明',
            mobile: '13800138000',
            age: 35,
            gender: '男',
            city: '上海',
          },
        },
        {
          id: 'PS006',
          name: 'Voucher',
          type: 'Voucher系统',
          mergeTime: '2025-09-18 13:20:00',
          keyInfo: {
            name: '陈明',
            mobile: '13800138000',
            age: 35,
            gender: '男',
            city: '上海',
          },
        },
        {
          id: 'PS007',
          name: 'CRM',
          type: 'CRM系统',
          mergeTime: '2025-09-15 10:00:00',
          keyInfo: {
            name: '陈明',
            mobile: '13800138000',
            age: 35,
            gender: '男',
            city: '上海',
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
    // GET /api/customer/opportunities
    else if (method === 'get' && fullPath.includes('/customer/opportunities')) {
      await delay(800)
      const mockOpportunities: Opportunity[] = [
        {
          id: 'OPP001',
          oneId: 'ONE-202501001',
          type: '首保流失15个月',
          triggerRule: '首保流失提醒规则',
          priority: '高',
          status: '待处理',
          pushTarget: 'bdc',
          pushStatus: '待推送',
          createTime: '2025-01-15 10:30:00',
          description: '最近保养公里：0\n交付日期：2025/02/02',
          source: 'CRM',
        },
        {
          id: 'OPP002',
          oneId: 'ONE-202501002',
          type: 'PCN售后',
          triggerRule: 'PCN售后活动规则',
          priority: '高',
          status: '处理中',
          pushTarget: 'bdc',
          pushStatus: '成功',
          createTime: '2025-01-14 09:20:00',
          description: '活动内容：对网关控制单元（蓄电池传感器）重新编程\n活动完成率：30%\n距离目标差值（车）：30\n活动属性：30',
          source: 'CRM',
        },
      ]
      mockResponse = {
        code: 200,
        message: 'success',
        data: mockOpportunities,
      }
    }
    // GET /api/customer/operation-logs
    else if (method === 'get' && fullPath.includes('/customer/operation-logs')) {
      await delay(800)
      // 只包含人为操作的日志，显示操作人员提交的信息
      const mockOperationLogs: OperationLog[] = [
        {
          id: 'LOG001',
          operator: 'Rebecca Z.',
          operationType: '人工更新',
          operationTime: '2025-01-15 14:30:00',
          description: '提交了客户基础信息更新：姓名、手机号',
        },
        {
          id: 'LOG002',
          operator: 'John D.',
          operationType: '数据纠错',
          operationTime: '2025-01-12 16:45:00',
          description: '提交了字段纠错申请：年龄字段',
        },
        {
          id: 'LOG003',
          operator: 'Alice W.',
          operationType: '人工更新',
          operationTime: '2025-01-10 11:20:00',
          description: '提交了客户标签信息更新',
        },
        {
          id: 'LOG004',
          operator: 'Bob M.',
          operationType: '冲突处理',
          operationTime: '2025-01-08 09:30:00',
          description: '提交了姓名和手机号冲突处理申请',
        },
        {
          id: 'LOG005',
          operator: 'Rebecca Z.',
          operationType: '人工更新',
          operationTime: '2025-01-05 15:20:00',
          description: '提交了客户电话号码管理更新',
        },
      ]
      mockResponse = {
        code: 200,
        message: 'success',
        data: mockOperationLogs,
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

