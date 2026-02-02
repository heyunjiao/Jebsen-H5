import { MockMethod } from 'vite-plugin-mock'
import type { CustomerProfile, TagPool, MobileData, MobileItem, MaintenanceRecord, TransactionRecord, VehicleRelation, Asset, NameMobileConflict, Appointment, PlatformSource, InsuranceInfo } from '@/types/customer'

// Mock 客户画像数据（包含冲突数据）
const mockCustomerProfile: CustomerProfile = {
  id: 'C001',
  name: {
    value: '张三',
    isConflict: true,
    sources: [
      { origin: '官网注册', value: '张三', time: '2023-10-01 10:30:00' },
      { origin: '线下门店', value: '张三丰', time: '2023-09-15 14:20:00' },
    ],
  },
  age: {
    value: 35,
    isConflict: true,
    sources: [
      { origin: '官网', value: 35, time: '2023-10-01 10:30:00' },
      { origin: '线下门店', value: 38, time: '2023-09-15 14:20:00' },
      { origin: '电话咨询', value: 36, time: '2023-09-20 09:15:00' },
    ],
  },
  mobile: {
    items: [
      {
        id: 'mobile1',
        mobile: '13800138000',
        isPrimary: true,
        relationTagId: 'relation1',
        relationTagName: '本人',
        source: '官网',
        updateTime: '2023-10-01 10:30:00',
      },
      {
        id: 'mobile2',
        mobile: '13900139000',
        isPrimary: false,
        relationTagId: 'relation2',
        relationTagName: '配偶',
        source: '线下门店',
        updateTime: '2023-09-15 14:20:00',
      },
    ],
    isConflict: true,
    editable: true,
  } as MobileData,
  gender: {
    value: '男',
    isConflict: true,
    sources: [
      { origin: '官网注册', value: '男', time: '2023-10-01 10:30:00' },
      { origin: '线下门店', value: '男', time: '2023-09-15 14:20:00' },
      { origin: '电话咨询', value: '男', time: '2023-09-20 09:15:00' },
    ],
  },
  city: {
    value: '北京',
    isConflict: true,
    sources: [
      { origin: '官网注册', value: '北京', time: '2023-10-01 10:30:00' },
      { origin: '线下门店', value: '上海', time: '2023-09-15 14:20:00' },
    ],
  },
  preferredCarModel: {
    value: 'BMW 3系',
    isConflict: true,
    sources: [
      { origin: '官网咨询', value: 'BMW 3系', time: '2023-10-01 10:30:00' },
      { origin: '线下门店', value: 'BMW X3', time: '2023-09-15 14:20:00' },
      { origin: '电话咨询', value: 'BMW 3系', time: '2023-09-20 09:15:00' },
    ],
    tags: ['高意向', '首购客户'],
  },
  maintenanceRecords: {
    value: '8次保养，2次维修',
    isConflict: false,
  },
  tags: ['高意向', '置换需求', 'VIP客户'],
  // 新增字段
  opportunityType: {
    value: '钻石客户',
    isConflict: false,
    sources: [
      { origin: 'CRM系统', value: '钻石客户', time: '2023-10-01 10:30:00' },
      { origin: '在修不再包', value: '高价值商机', time: '2023-10-05 14:20:00' },
      { origin: '在修不再包', value: '置换需求', time: '2023-10-08 09:15:00' },
    ],
  },
  segmentType: {
    value: 'VIP客户群',
    isConflict: false,
    sources: [
      { origin: '数据分析系统', value: 'VIP客户群', time: '2023-10-01 10:30:00' },
      { origin: '营销系统', value: '高价值客户群', time: '2023-10-05 14:20:00' },
      { origin: 'CRM系统', value: '活跃客户群', time: '2023-10-08 09:15:00' },
    ],
  },
  totalConsumption: {
    value: 1456200,
    isConflict: false,
    sources: [
      { origin: '财务系统', value: 1456200, time: '2023-11-15 09:00:00' },
    ],
  },
  customerType: {
    value: '个人',
    isConflict: false,
    sources: [
      { origin: 'CRM系统', value: '个人', time: '2023-10-01 10:30:00' },
    ],
  },
  servicePreferences: {
    tags: ['定期保养', '紧急维修', '质保期内'],
  },
  // 姓名+手机号冲突数据
  nameMobileConflict: [
    {
      id: 'conflict1',
      name: '张三',
      mobile: '13800138000',
      origin: '官网注册',
      updateTime: '2023-10-01 10:30:00',
    },
    {
      id: 'conflict2',
      name: '张三丰',
      mobile: '13800138001',
      origin: '线下门店',
      updateTime: '2023-09-15 14:20:00',
    },
  ] as NameMobileConflict[],
  // 是否是多源平台合并
  isMultiSource: true,
  transactions: [
    {
      id: 'T001',
      orderNo: 'ORD20231001001',
      productName: 'BMW 3系 2023款',
      amount: 320000,
      status: '已完成',
      transactionTime: '2023-10-01 14:30:00',
      source: '官网',
    },
    {
      id: 'T002',
      orderNo: 'ORD20230915002',
      productName: '车辆保养服务套餐',
      amount: 1200,
      status: '已完成',
      transactionTime: '2023-09-15 10:20:00',
      source: '线下门店',
    },
    {
      id: 'T003',
      orderNo: 'ORD20230820003',
      productName: 'BMW X5 2023款',
      amount: 680000,
      status: '已完成',
      transactionTime: '2023-08-20 16:45:00',
      source: '线下门店',
    },
    {
      id: 'T004',
      orderNo: 'ORD20230710004',
      productName: '车辆维修服务',
      amount: 3500,
      status: '已完成',
      transactionTime: '2023-07-10 11:30:00',
      source: '官网',
    },
    {
      id: 'T005',
      orderNo: 'ORD20231115005',
      productName: 'BMW 5系 2024款',
      amount: 450000,
      status: '待支付',
      transactionTime: '2023-11-15 09:00:00',
      source: '官网',
    },
    {
      id: 'T006',
      orderNo: 'ORD20231025006',
      productName: '车辆检测服务',
      amount: 500,
      status: '已完成',
      transactionTime: '2023-10-25 14:20:00',
      source: '线下门店',
    },
  ],
  vehicles: [
    {
      id: 'V001',
      vehicleModel: 'BMW 3系 2023款',
      licensePlate: '京A12345',
      vin: 'LBVNU210X3K123456',
      purchaseDate: '2023-10-01',
      status: '已售',
      source: '官网',
    },
    {
      id: 'V002',
      vehicleModel: 'BMW X5 2023款',
      licensePlate: '京B67890',
      vin: '5UXKR0C50L9A12345',
      purchaseDate: '2022-05-15',
      status: '已售',
      source: '线下门店',
    },
    {
      id: 'V003',
      vehicleModel: 'BMW 5系 2022款',
      licensePlate: '京C11111',
      vin: 'LBVNU210X2K111111',
      purchaseDate: '2022-03-20',
      status: '已售',
      source: '官网',
    },
    {
      id: 'V004',
      vehicleModel: 'BMW X3 2023款',
      licensePlate: '京D22222',
      vin: '5UXKR0C50L9A22222',
      purchaseDate: '2023-06-10',
      status: '在售',
      source: '线下门店',
    },
    {
      id: 'V005',
      vehicleModel: 'BMW 1系 2023款',
      licensePlate: '京E33333',
      vin: 'LBVNU210X3K333333',
      purchaseDate: '2023-04-05',
      status: '维修中',
      source: '官网',
    },
  ],
  assets: [
    {
      id: 'A001',
      type: 'voucher',
      name: '购车代金券',
      amount: 5000,
      status: '未使用',
      validFrom: '2023-10-01',
      validTo: '2024-10-01',
      source: '官网',
    },
    {
      id: 'A002',
      type: 'coupon',
      name: '保养折扣券',
      discount: 0.8,
      status: '未使用',
      validFrom: '2023-09-01',
      validTo: '2024-09-01',
      source: '线下门店',
    },
    {
      id: 'A003',
      type: 'voucher',
      name: '维修代金券',
      amount: 2000,
      status: '未使用',
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      source: '官网',
    },
    {
      id: 'A004',
      type: 'coupon',
      name: '购车优惠券',
      discount: 0.95,
      status: '已使用',
      validFrom: '2023-08-01',
      validTo: '2023-12-31',
      source: '官网',
    },
    {
      id: 'A005',
      type: 'voucher',
      name: '检测代金券',
      amount: 300,
      status: '未使用',
      validFrom: '2023-11-01',
      validTo: '2024-11-01',
      source: '线下门店',
    },
    {
      id: 'A006',
      type: 'coupon',
      name: '维修折扣券',
      discount: 0.85,
      status: '未使用',
      validFrom: '2023-10-15',
      validTo: '2024-10-15',
      source: '官网',
    },
    {
      id: 'A007',
      type: 'voucher',
      name: '保养代金券',
      amount: 1000,
      status: '已过期',
      validFrom: '2022-01-01',
      validTo: '2023-01-01',
      source: '线下门店',
    },
  ],
}

// Mock 标签池数据（扩展更多标签）
const mockTagPool: TagPool[] = [
  { id: 'tag1', name: '战败客户', color: '#ff4d4f' },
  { id: 'tag2', name: '高意向', color: '#52c41a' },
  { id: 'tag3', name: '置换需求', color: '#1890ff' },
  { id: 'tag4', name: '首购客户', color: '#722ed1' },
  { id: 'tag5', name: 'VIP客户', color: '#fa8c16' },
  { id: 'tag6', name: '潜在客户', color: '#13c2c2' },
  { id: 'tag7', name: '已成交', color: '#eb2f96' },
  { id: 'tag8', name: '流失客户', color: '#8c8c8c' },
  { id: 'tag9', name: '保养客户', color: '#2f54eb' },
  { id: 'tag10', name: '维修客户', color: '#fa541c' },
  { id: 'tag11', name: '定期保养', color: '#13c2c2' },
  { id: 'tag12', name: '紧急维修', color: '#f5222d' },
  { id: 'tag13', name: '质保期内', color: '#52c41a' },
  { id: 'tag14', name: '质保期外', color: '#faad14' },
  { id: 'tag15', name: '高价值客户', color: '#722ed1' },
  { id: 'tag16', name: '低价值客户', color: '#8c8c8c' },
  { id: 'tag17', name: '投诉客户', color: '#ff4d4f' },
  { id: 'tag18', name: '满意客户', color: '#52c41a' },
  { id: 'tag19', name: '推荐客户', color: '#1890ff' },
  { id: 'tag20', name: '长期客户', color: '#fa8c16' },
  { id: 'tag21', name: '新客户', color: '#13c2c2' },
  { id: 'tag22', name: '老客户', color: '#722ed1' },
  { id: 'tag23', name: '活跃客户', color: '#52c41a' },
  { id: 'tag24', name: '沉睡客户', color: '#8c8c8c' },
]

// Mock 服务偏好标签池数据
const mockServicePreferenceTagPool: TagPool[] = [
  { id: 'sp1', name: '定期保养', color: '#13c2c2' },
  { id: 'sp2', name: '紧急维修', color: '#f5222d' },
  { id: 'sp3', name: '质保期内', color: '#52c41a' },
  { id: 'sp4', name: '质保期外', color: '#faad14' },
  { id: 'sp5', name: '车辆检测', color: '#1890ff' },
  { id: 'sp6', name: '美容护理', color: '#eb2f96' },
  { id: 'sp7', name: '轮胎更换', color: '#722ed1' },
  { id: 'sp8', name: '保险服务', color: '#fa8c16' },
  { id: 'sp9', name: '道路救援', color: '#ff4d4f' },
  { id: 'sp10', name: '延保服务', color: '#2f54eb' },
  { id: 'sp11', name: '二手车评估', color: '#13c2c2' },
  { id: 'sp12', name: '金融贷款', color: '#52c41a' },
]

// Mock 维保记录数据
const mockMaintenanceRecords = [
  {
    id: 'M001',
    serviceType: '定期保养',
    serviceTime: '2024-01-15 10:30:00',
    serviceStore: '北京朝阳4S店',
    vehicleModel: 'BMW 3系 2023款',
    amount: 1200,
    description: '更换机油、机滤、空滤，检查轮胎、刹车系统',
    status: '已完成',
    tags: ['定期保养', '质保期内'],
    source: '官网',
    insurance: {
      type: '商业险',
      company: '中国人保',
      policyNo: 'PICC2024001234',
      startDate: '2024-01-01',
      endDate: '2025-01-01',
      amount: 5000,
    } as InsuranceInfo,
  },
  {
    id: 'M002',
    serviceType: '紧急维修',
    serviceTime: '2023-12-20 14:20:00',
    serviceStore: '北京朝阳4S店',
    vehicleModel: 'BMW 3系 2023款',
    amount: 3500,
    description: '更换前保险杠，修复前大灯',
    status: '已完成',
    tags: ['紧急维修', '质保期内'],
    source: '线下门店',
    insurance: {
      type: '交强险+商业险',
      company: '平安保险',
      policyNo: 'PAIC2023005678',
      startDate: '2023-12-01',
      endDate: '2024-12-01',
      amount: 6800,
    } as InsuranceInfo,
  },
  {
    id: 'M003',
    serviceType: '定期保养',
    serviceTime: '2023-10-05 09:15:00',
    serviceStore: '北京朝阳4S店',
    vehicleModel: 'BMW 3系 2023款',
    amount: 1500,
    description: '更换机油、机滤、空滤、空调滤芯，检查电瓶',
    status: '已完成',
    tags: ['定期保养', '质保期内', '满意客户'],
    source: '官网',
    insurance: {
      type: '商业险',
      company: '中国人保',
      policyNo: 'PICC2023001234',
      startDate: '2023-10-01',
      endDate: '2024-10-01',
      amount: 5000,
    } as InsuranceInfo,
  },
  {
    id: 'M004',
    serviceType: '检测服务',
    serviceTime: '2023-08-18 11:00:00',
    serviceStore: '北京朝阳4S店',
    vehicleModel: 'BMW 3系 2023款',
    amount: 0,
    description: '免费检测：发动机、变速箱、制动系统',
    status: '已完成',
    tags: ['质保期内'],
    source: '官网',
  },
]

// 模拟网络延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 统一的请求体解析函数
const parseBody = (req: any): any => {
  console.log('[Mock parseBody] 开始解析请求体，req 对象:', {
    url: req.url,
    method: req.method,
    hasBody: !!req.body,
    hasRawBody: !!req.rawBody,
    hasData: !!req.data,
    hasQuery: !!req.query,
    bodyType: typeof req.body,
    bodyValue: req.body,
    rawBodyType: typeof req.rawBody,
    rawBodyValue: req.rawBody,
  })
  
  // 优先使用 req.body（vite-plugin-mock 3.0 标准格式）
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Array.isArray(req.body) && Object.keys(req.body).length > 0) {
      console.log('[Mock parseBody] 从 req.body 解析成功:', req.body)
      return req.body
    }
    if (typeof req.body === 'string' && req.body.length > 0) {
      try {
        const parsed = JSON.parse(req.body)
        console.log('[Mock parseBody] 从 req.body 字符串解析成功:', parsed)
        return parsed
      } catch (e) {
        console.warn('[Mock parseBody] 解析 body 字符串失败:', e)
      }
    }
    if (Array.isArray(req.body)) {
      console.log('[Mock parseBody] req.body 是数组:', req.body)
      return req.body
    }
  }
  
  // 其次使用 req.rawBody
  if (req.rawBody !== undefined && req.rawBody !== null) {
    if (typeof req.rawBody === 'string') {
      try {
        const parsed = JSON.parse(req.rawBody)
        console.log('[Mock parseBody] 从 req.rawBody 字符串解析成功:', parsed)
        return parsed
      } catch (e) {
        console.warn('[Mock parseBody] 解析 rawBody 失败:', e)
      }
    }
    if (typeof req.rawBody === 'object') {
      console.log('[Mock parseBody] 从 req.rawBody 对象获取:', req.rawBody)
      return req.rawBody
    }
  }
  
  // 最后使用 req.data
  if (req.data !== undefined && req.data !== null) {
    console.log('[Mock parseBody] 从 req.data 获取:', req.data)
    return req.data
  }
  
  // 如果都没有，尝试从 query 中获取（某些情况下可能在这里）
  if (req.query && typeof req.query === 'object' && Object.keys(req.query).length > 0) {
    console.log('[Mock parseBody] 从 req.query 获取:', req.query)
    return req.query
  }
  
  console.warn('[Mock parseBody] ⚠️ 无法解析请求体，返回空对象。请求信息:', {
    url: req.url,
    method: req.method,
    hasBody: req.body !== undefined,
    hasRawBody: req.rawBody !== undefined,
    hasData: req.data !== undefined,
    hasQuery: req.query !== undefined,
    bodyType: typeof req.body,
    bodyValue: req.body,
  })
  
  return {}
}

export default [
  // 获取客户画像数据
  {
    url: '/api/customer/profile',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/profile - 请求:', req)
      await delay(800)
      const result = {
        code: 200,
        message: 'success',
        data: mockCustomerProfile,
      }
      console.log('[Mock GET] /api/customer/profile - 返回:', result)
      console.log('[Mock GET] /api/customer/profile - vehicles:', mockCustomerProfile.vehicles)
      console.log('[Mock GET] /api/customer/profile - assets:', mockCustomerProfile.assets)
      console.log('[Mock GET] /api/customer/profile - customerType:', mockCustomerProfile.customerType)
      console.log('[Mock GET] /api/customer/profile - opportunityType:', mockCustomerProfile.opportunityType)
      console.log('[Mock GET] /api/customer/profile - segmentType:', mockCustomerProfile.segmentType)
      console.log('[Mock GET] /api/customer/profile - totalConsumption:', mockCustomerProfile.totalConsumption)
      return result
    },
  },
  // 更新手机号（旧版接口，保持兼容）
  {
    url: '/api/customer/mobile',
    method: 'post',
    response: async (req: any) => {
      console.log('[Mock POST] /api/customer/mobile - 开始处理请求')
      console.log('[Mock POST] /api/customer/mobile - 请求对象:', req)
      await delay(600)
      const body = parseBody(req)
      console.log('[Mock POST] /api/customer/mobile - 解析后的 body:', body)
      const { mobile } = body
      if (!mobile || !/^1[3-9]\d{9}$/.test(mobile)) {
        return {
          code: 400,
          message: '手机号格式不正确',
          data: null,
        }
      }
      const mobileData = mockCustomerProfile.mobile
      if ('value' in mobileData) {
        mobileData.value = mobile
      } else if ('items' in mobileData) {
        const primaryItem = mobileData.items.find((i) => i.isPrimary)
        if (primaryItem) {
          primaryItem.mobile = mobile
        }
      }
      return {
        code: 200,
        message: '更新成功',
        data: { mobile },
      }
    },
  },
  // 获取标签池
  {
    url: '/api/customer/tags/pool',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/tags/pool - 请求:', req)
      await delay(500)
      const result = {
        code: 200,
        message: 'success',
        data: mockTagPool,
      }
      console.log('[Mock GET] /api/customer/tags/pool - 返回:', result)
      return result
    },
  },
  // 获取关系标签池
  {
    url: '/api/customer/tags/relation-pool',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/tags/relation-pool - 请求:', req)
      await delay(500)
      const { mockRelationTagPool } = await import('./data')
      const result = {
        code: 200,
        message: 'success',
        data: mockRelationTagPool,
      }
      console.log('[Mock GET] /api/customer/tags/relation-pool - 返回:', result)
      return result
    },
  },
  // 添加标签
  {
    url: '/api/customer/tags',
    method: 'post',
    response: async (req: any) => {
      console.log('[Mock POST] /api/customer/tags - 开始处理请求')
      console.log('[Mock POST] /api/customer/tags - 完整请求对象:', req)
      console.log('[Mock POST] /api/customer/tags - req.body:', req.body)
      console.log('[Mock POST] /api/customer/tags - req.rawBody:', req.rawBody)
      console.log('[Mock POST] /api/customer/tags - req.data:', req.data)
      console.log('[Mock POST] /api/customer/tags - req.query:', req.query)
      await delay(700)
      const body = parseBody(req)
      console.log('[Mock POST] /api/customer/tags - 解析后的 body:', body)
      const { tagId } = body
      
      if (!tagId) {
        return {
          code: 400,
          message: '缺少标签ID',
          data: null,
        }
      }
      
      const tag = mockTagPool.find((t) => t.id === tagId)
      if (!tag) {
        return {
          code: 400,
          message: '标签不存在',
          data: null,
        }
      }
      
      if (!mockCustomerProfile.tags.includes(tag.name)) {
        mockCustomerProfile.tags.push(tag.name)
      }
      
      const result = {
        code: 200,
        message: '添加成功',
        data: { tags: mockCustomerProfile.tags },
      }
      console.log('[Mock POST] 添加标签 - 返回:', result)
      return result
    },
  },
  // 删除标签
  {
    url: '/api/customer/tags',
    method: 'delete',
    response: async (req: any) => {
      console.log('[Mock DELETE] /api/customer/tags - 开始处理请求')
      console.log('[Mock DELETE] /api/customer/tags - 请求对象:', req)
      console.log('[Mock DELETE] /api/customer/tags - req.query:', req.query)
      await delay(700)
      const tagName = req.query?.tagName
      
      if (!tagName) {
        return {
          code: 400,
          message: '缺少标签名称',
          data: null,
        }
      }
      
      const index = mockCustomerProfile.tags.indexOf(tagName)
      if (index > -1) {
        mockCustomerProfile.tags.splice(index, 1)
      }
      
      const result = {
        code: 200,
        message: '删除成功',
        data: { tags: mockCustomerProfile.tags },
      }
      console.log('[Mock DELETE] 删除标签 - 返回:', result)
      return result
    },
  },
  // 新增电话号码
  {
    url: '/api/customer/mobile/items',
    method: 'post',
    response: async (req: any) => {
      console.log('[Mock POST] /api/customer/mobile/items - 开始处理请求')
      console.log('[Mock POST] /api/customer/mobile/items - 请求对象:', req)
      await delay(600)
      const body = parseBody(req)
      console.log('[Mock POST] /api/customer/mobile/items - 解析后的 body:', body)
      const { mobile, relationTagId, relationTagName, isPrimary } = body
      
      if (!mobile || !/^1[3-9]\d{9}$/.test(mobile)) {
        return {
          code: 400,
          message: '手机号格式不正确',
          data: null,
        }
      }
      
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
      
      const result = {
        code: 200,
        message: '添加成功',
        data: newItem,
      }
      console.log('[Mock POST] 新增电话号码 - 返回:', result)
      return result
    },
  },
  // 更新电话号码
  {
    url: '/api/customer/mobile/items',
    method: 'put',
    response: async (req: any) => {
      console.log('[Mock PUT] /api/customer/mobile/items - 开始处理请求')
      console.log('[Mock PUT] /api/customer/mobile/items - 请求对象:', req)
      await delay(600)
      const body = parseBody(req)
      console.log('[Mock PUT] /api/customer/mobile/items - 解析后的 body:', body)
      const { id, mobile, relationTagId, relationTagName, isPrimary } = body
      
      if (!id) {
        return {
          code: 400,
          message: '缺少电话号码ID',
          data: null,
        }
      }
      
      if (!mobile || !/^1[3-9]\d{9}$/.test(mobile)) {
        return {
          code: 400,
          message: '手机号格式不正确',
          data: null,
        }
      }
      
      const mobileData = mockCustomerProfile.mobile as MobileData
      const item = mobileData.items.find((i) => i.id === id)
      if (!item) {
        return {
          code: 404,
          message: '电话号码不存在',
          data: null,
        }
      }
      
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
      
      const result = {
        code: 200,
        message: '更新成功',
        data: item,
      }
      console.log('[Mock PUT] 更新电话号码 - 返回:', result)
      return result
    },
  },
  // 删除电话号码 - 使用正则表达式匹配动态路由
  {
    url: /\/api\/customer\/mobile\/items\/.+/,
    method: 'delete',
    response: async (req: any) => {
      console.log('[Mock DELETE] 删除电话号码 - 请求:', req)
      console.log('[Mock DELETE] req.url:', req.url)
      console.log('[Mock DELETE] req 所有键:', Object.keys(req))
      
      await delay(600)
      
      // 从 URL 中提取 id
      let id: string | undefined
      
      if (req.url && typeof req.url === 'string') {
        const match = req.url.match(/\/items\/([^/?]+)/)
        if (match && match[1]) {
          id = match[1]
        }
      }
      
      if (!id && req.params) {
        if (typeof req.params === 'object') {
          id = req.params.id || req.params[0]
          if (Array.isArray(req.params) && req.params.length > 0) {
            id = req.params[0]
          }
        }
      }
      
      console.log('[Mock DELETE] 提取的 id:', id)
      
      if (!id) {
        console.error('[Mock DELETE] ❌ 无法提取 id')
        return {
          code: 400,
          message: '缺少电话号码ID',
          data: null,
        }
      }
      
      const mobileData = mockCustomerProfile.mobile as MobileData
      const item = mobileData.items.find((i) => i.id === id)
      if (!item) {
        return {
          code: 404,
          message: '电话号码不存在',
          data: null,
        }
      }
      
      if (item.isPrimary) {
        return {
          code: 400,
          message: '不能删除主号码',
          data: null,
        }
      }
      
      mobileData.items = mobileData.items.filter((i) => i.id !== id)
      mobileData.isConflict = mobileData.items.length > 1
      
      const result = {
        code: 200,
        message: '删除成功',
        data: { success: true },
      }
      console.log('[Mock DELETE] 删除电话号码 - 返回:', result)
      return result
    },
  },
  // 合并电话号码
  {
    url: '/api/customer/mobile/merge',
    method: 'post',
    response: async (req: any) => {
      console.log('[Mock POST] 合并电话号码 - 完整请求对象:', JSON.stringify(req, null, 2))
      console.log('[Mock POST] 合并电话号码 - req.body:', req.body)
      console.log('[Mock POST] 合并电话号码 - req.rawBody:', req.rawBody)
      console.log('[Mock POST] 合并电话号码 - req.data:', req.data)
      console.log('[Mock POST] 合并电话号码 - req.query:', req.query)
      
      await delay(800)
      const body = parseBody(req)
      console.log('[Mock POST] 合并电话号码 - 解析后的 body:', body)
      const { ids } = body
      
      if (!Array.isArray(ids) || ids.length === 0) {
        const errorResult = {
          code: 400,
          message: '请选择要合并的号码',
          data: null,
        }
        console.log('[Mock POST] 合并电话号码 - 返回错误:', errorResult)
        return errorResult
      }
      
      const mobileData = mockCustomerProfile.mobile as MobileData
      const primaryItem = mobileData.items.find((i) => i.isPrimary)
      if (!primaryItem) {
        const errorResult = {
          code: 400,
          message: '未找到主号码',
          data: null,
        }
        console.log('[Mock POST] 合并电话号码 - 返回错误:', errorResult)
        return errorResult
      }
      
      // 深拷贝 mobileData 避免直接修改原始数据
      const updatedMobileData: MobileData = {
        items: mobileData.items.filter(
          (i) => i.isPrimary || !ids.includes(i.id)
        ),
        isConflict: false,
        editable: mobileData.editable,
      }
      updatedMobileData.isConflict = updatedMobileData.items.length > 1
      
      const result = {
        code: 200,
        message: '合并成功',
        data: updatedMobileData,
      }
      console.log('[Mock POST] 合并电话号码 - 返回成功:', JSON.stringify(result, null, 2))
      return result
    },
  },
  // 获取维保记录
  {
    url: '/api/customer/maintenance/records',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/maintenance/records - 请求:', req)
      await delay(800)
      const result = {
        code: 200,
        message: 'success',
        data: mockMaintenanceRecords,
      }
      console.log('[Mock GET] /api/customer/maintenance/records - 返回:', result)
      return result
    },
  },
  // 更新维保记录标签
  {
    url: /\/api\/customer\/maintenance\/records\/.+\/tags/,
    method: 'put',
    response: async (req: any) => {
      console.log('[Mock PUT] 更新维保记录标签 - 请求:', req)
      await delay(700)
      const body = parseBody(req)
      console.log('[Mock PUT] 更新维保记录标签 - 解析后的 body:', body)
      
      // 从 URL 中提取 recordId
      let recordId: string | undefined
      if (req.url && typeof req.url === 'string') {
        const match = req.url.match(/\/records\/([^/]+)\/tags/)
        if (match && match[1]) {
          recordId = match[1]
        }
      }
      
      if (!recordId) {
        return {
          code: 400,
          message: '缺少记录ID',
          data: null,
        }
      }
      
      const { tags } = body
      if (!Array.isArray(tags)) {
        return {
          code: 400,
          message: '标签格式不正确',
          data: null,
        }
      }
      
      const record = mockMaintenanceRecords.find((r) => r.id === recordId)
      if (!record) {
        return {
          code: 404,
          message: '记录不存在',
          data: null,
        }
      }
      
      record.tags = tags
      
      const result = {
        code: 200,
        message: '更新成功',
        data: { tags },
      }
      console.log('[Mock PUT] 更新维保记录标签 - 返回:', result)
      return result
    },
  },
  // 更新用户偏好标签
  {
    url: '/api/customer/preferred-car-model/tags',
    method: 'put',
    response: async (req: any) => {
      console.log('[Mock PUT] 更新用户偏好标签 - 请求:', req)
      await delay(700)
      const body = parseBody(req)
      console.log('[Mock PUT] 更新用户偏好标签 - 解析后的 body:', body)
      
      const { tags } = body
      if (!Array.isArray(tags)) {
        return {
          code: 400,
          message: '标签格式不正确',
          data: null,
        }
      }
      
      // 更新 mock 数据中的用户偏好标签
      if (!mockCustomerProfile.preferredCarModel.tags) {
        mockCustomerProfile.preferredCarModel.tags = []
      }
      mockCustomerProfile.preferredCarModel.tags = tags
      
      const result = {
        code: 200,
        message: '更新成功',
        data: { tags },
      }
      console.log('[Mock PUT] 更新用户偏好标签 - 返回:', result)
      return result
    },
  },
  // 获取交易记录
  {
    url: '/api/customer/transactions',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/transactions - 请求:', req)
      await delay(800)
      const transactions: TransactionRecord[] = mockCustomerProfile.transactions || []
      const result = {
        code: 200,
        message: 'success',
        data: transactions,
      }
      console.log('[Mock GET] /api/customer/transactions - 返回:', result)
      return result
    },
  },
  // 获取车辆关联
  {
    url: '/api/customer/vehicles',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/vehicles - 请求:', req)
      await delay(800)
      const vehicles: VehicleRelation[] = mockCustomerProfile.vehicles || []
      const result = {
        code: 200,
        message: 'success',
        data: vehicles,
      }
      console.log('[Mock GET] /api/customer/vehicles - 返回:', result)
      return result
    },
  },
  // 获取资产中心
  {
    url: '/api/customer/assets',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/assets - 请求:', req)
      await delay(800)
      const assets: Asset[] = mockCustomerProfile.assets || []
      const result = {
        code: 200,
        message: 'success',
        data: assets,
      }
      console.log('[Mock GET] /api/customer/assets - 返回:', result)
      return result
    },
  },
  // 提交姓名+手机号冲突处理
  {
    url: '/api/customer/conflicts/name-mobile',
    method: 'post',
    response: async (req: any) => {
      console.log('[Mock POST] /api/customer/conflicts/name-mobile - 请求:', req)
      await delay(800)
      const body = parseBody(req)
      console.log('[Mock POST] /api/customer/conflicts/name-mobile - 解析后的 body:', body)
      const { selectedIds, note } = body
      
      if (!selectedIds || !Array.isArray(selectedIds) || selectedIds.length === 0) {
        return {
          code: 400,
          message: '请至少选择一项',
          data: null,
        }
      }
      
      const result = {
        code: 200,
        message: '提交成功，后台管理人员将尽快处理',
        data: { success: true },
      }
      console.log('[Mock POST] 提交冲突处理 - 返回:', result)
      return result
    },
  },
  // 获取预约信息
  {
    url: '/api/customer/appointments',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/appointments - 请求:', req)
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
      const result = {
        code: 200,
        message: 'success',
        data: mockAppointments,
      }
      console.log('[Mock GET] /api/customer/appointments - 返回:', result)
      return result
    },
  },
  // 获取平台溯源信息
  {
    url: '/api/customer/platform-sources',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/platform-sources - 请求:', req)
      await delay(800)
      const mockPlatformSources: PlatformSource[] = [
        {
          id: 'PS001',
          name: '官网注册',
          type: '官网平台',
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
          name: '线下门店',
          type: '门店系统',
          mergeTime: '2023-09-15 14:20:00',
          keyInfo: {
            name: '张三丰',
            mobile: '13900139000',
            age: 38,
            gender: '男',
            city: '上海',
          },
        },
        {
          id: 'PS003',
          name: '电话咨询',
          type: '呼叫中心',
          mergeTime: '2023-09-20 09:15:00',
          keyInfo: {
            name: '张三',
            mobile: '13800138000',
            age: 36,
            gender: '男',
            city: '北京',
          },
        },
      ]
      const result = {
        code: 200,
        message: 'success',
        data: mockPlatformSources,
      }
      console.log('[Mock GET] /api/customer/platform-sources - 返回:', result)
      return result
    },
  },
  // 提交字段纠错信息
  {
    url: '/api/customer/fields/correction',
    method: 'post',
    response: async (req: any) => {
      console.log('[Mock POST] /api/customer/fields/correction - 请求:', req)
      await delay(800)
      
      // 解析请求体
      let body = req.body
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body)
        } catch (e) {
          console.error('[Mock POST] /api/customer/fields/correction - 解析 body 失败:', e)
        }
      }
      
      console.log('[Mock POST] /api/customer/fields/correction - 解析后的 body:', body)
      
      // 验证必填字段
      if (!body.field || body.currentValue === undefined || body.correctValue === undefined) {
        return {
          code: 400,
          message: '字段名、当前值和纠错值不能为空',
          data: { success: false },
        }
      }
      
      // 验证值是否变化
      if (String(body.currentValue) === String(body.correctValue)) {
        return {
          code: 400,
          message: '纠错值应与当前值不同',
          data: { success: false },
        }
      }
      
      // 手机号格式验证
      if (body.field === 'mobile' && !/^1[3-9]\d{9}$/.test(String(body.correctValue))) {
        return {
          code: 400,
          message: '手机号格式不正确',
          data: { success: false },
        }
      }
      
      const result = {
        code: 200,
        message: '纠错信息已提交，等待审核',
        data: { success: true },
      }
      console.log('[Mock POST] /api/customer/fields/correction - 返回:', result)
      return result
    },
  },
  // 更新基础信息（提交审核）
  {
    url: '/api/customer/basic-info',
    method: 'put',
    response: async (req: any) => {
      console.log('[Mock PUT] /api/customer/basic-info - 请求:', req)
      await delay(800)
      
      // 解析请求体
      let body = req.body
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body)
        } catch (e) {
          console.error('[Mock PUT] /api/customer/basic-info - 解析 body 失败:', e)
        }
      }
      
      console.log('[Mock PUT] /api/customer/basic-info - 解析后的 body:', body)
      
      // 验证更改理由
      if (!body.reason || !body.reason.trim()) {
        return {
          code: 400,
          message: '请输入更改理由',
          data: { success: false },
        }
      }
      
      // 手机号格式验证
      if (body.mobile && !/^1[3-9]\d{9}$/.test(String(body.mobile))) {
        return {
          code: 400,
          message: '手机号格式不正确',
          data: { success: false },
        }
      }
      
      // 年龄验证
      if (body.age !== undefined && (isNaN(Number(body.age)) || Number(body.age) < 0 || Number(body.age) > 150)) {
        return {
          code: 400,
          message: '年龄格式不正确',
          data: { success: false },
        }
      }
      
      const result = {
        code: 200,
        message: '提交成功，等待后台审核',
        data: { success: true },
      }
      console.log('[Mock PUT] /api/customer/basic-info - 返回:', result)
      return result
    },
  },
] as MockMethod[]
