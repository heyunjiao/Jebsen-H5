import { MockMethod } from 'vite-plugin-mock'
import type { CustomerProfile, TagPool, MobileData, MobileItem, MaintenanceRecord, TransactionRecord, VehicleRelation, Asset, NameMobileConflict, Appointment, PlatformSource, InsuranceInfo, Opportunity, OperationLog, InsuranceRecord } from '@/types/customer'
import { validateInsuranceRecords, normalizeInsuranceRecords } from './rules'

// Mock 客户画像数据（包含冲突数据）
const mockCustomerProfile: CustomerProfile = {
  id: 'C001',
  name: {
    value: '陈明',
    isConflict: true,
    sources: [
      { origin: 'DMS', value: '陈明', time: '2025-10-01 10:30:00' },
      { origin: 'BDC', value: '陈明华', time: '2025-09-15 14:20:00' },
    ],
  },
  age: {
    value: 35,
    isConflict: true,
    sources: [
      { origin: 'DMS', value: 35, time: '2025-10-01 10:30:00' },
      { origin: 'BDC', value: 38, time: '2025-09-15 14:20:00' },
      { origin: 'CRM', value: 36, time: '2025-09-20 09:15:00' },
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
        businessTags: ['车主'],
        source: 'DMS',
        updateTime: '2025-10-01 10:30:00',
      },
      {
        id: 'mobile2',
        mobile: '13900139000',
        isPrimary: false,
        relationTagId: 'relation2',
        relationTagName: '配偶',
        businessTags: ['送修人'],
        source: 'BDC',
        updateTime: '2025-09-15 14:20:00',
      },
    ],
    isConflict: true,
    editable: true,
  } as MobileData,
  gender: {
    value: '男',
    isConflict: true,
    sources: [
      { origin: 'DMS', value: '男', time: '2025-10-01 10:30:00' },
      { origin: 'BDC', value: '男', time: '2025-09-15 14:20:00' },
      { origin: 'CRM', value: '男', time: '2025-09-20 09:15:00' },
    ],
  },
  city: {
    value: '上海',
    isConflict: true,
    sources: [
      { origin: 'DMS', value: '上海', time: '2025-10-01 10:30:00' },
      { origin: 'BDC', value: '上海', time: '2025-09-15 14:20:00' },
    ],
  },
  preferredCarModel: {
    value: '911',
    isConflict: true,
    sources: [
      { origin: 'POAS', value: '911', time: '2025-10-01 10:30:00' },
      { origin: 'BDC', value: 'Macan', time: '2025-09-15 14:20:00' },
      { origin: 'CRM', value: '911', time: '2025-09-20 09:15:00' },
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
      { origin: 'CRM', value: '钻石客户', time: '2025-10-01 10:30:00' },
      { origin: 'WWS', value: '高价值商机', time: '2025-10-05 14:20:00' },
      { origin: 'WWS', value: '置换需求', time: '2025-10-08 09:15:00' },
    ],
  },
  segmentType: {
    value: 'VIP客户群',
    isConflict: false,
    sources: [
      { origin: 'C@P', value: 'VIP客户群', time: '2025-10-01 10:30:00' },
      { origin: 'POAS', value: '高价值客户群', time: '2025-10-05 14:20:00' },
      { origin: 'CRM', value: '活跃客户群', time: '2025-10-08 09:15:00' },
    ],
  },
  totalConsumption: {
    value: 1456200,
    isConflict: false,
    sources: [
      { origin: 'DMS', value: 1456200, time: '2025-11-15 09:00:00' },
    ],
  },
  customerType: {
    value: '个人',
    isConflict: false,
    sources: [
      { origin: 'CRM', value: '个人', time: '2025-10-01 10:30:00' },
    ],
  },
  servicePreferences: {
    tags: ['定期保养', '紧急维修', '质保期内'],
  },
  // 姓名+手机号冲突数据
  nameMobileConflict: [
    {
      id: 'conflict1',
      name: '陈明',
      mobile: '13800138000',
      origin: 'DMS',
      updateTime: '2025-10-01 10:30:00',
    },
    {
      id: 'conflict2',
      name: '陈明华',
      mobile: '13800138001',
      origin: 'BDC',
      updateTime: '2025-09-15 14:20:00',
    },
  ] as NameMobileConflict[],
  // 是否是多源平台合并
  isMultiSource: true,
  // 最新操作信息（用于首页提示）
  latestOperation: {
    operator: 'Rebecca Z.',
    operationType: '人工更新',
    operationTime: '2025-01-15 14:30:00',
  },
  transactions: [
    {
      id: 'T001',
      orderNo: 'ORD20251001001',
      productName: '911 2025款',
      amount: 1450000,
      status: '已完成',
      transactionTime: '2025-10-01 14:30:00',
      source: 'DMS',
    },
    {
      id: 'T002',
      orderNo: 'ORD20250915002',
      productName: '保养服务套餐',
      amount: 3200,
      status: '已完成',
      transactionTime: '2025-09-15 10:20:00',
      source: 'BDC',
    },
    {
      id: 'T003',
      orderNo: 'ORD20250820003',
      productName: 'Cayenne 2025款',
      amount: 920000,
      status: '已完成',
      transactionTime: '2025-08-20 16:45:00',
      source: 'BDC',
    },
    {
      id: 'T004',
      orderNo: 'ORD20250710004',
      productName: '维修服务',
      amount: 8500,
      status: '已完成',
      transactionTime: '2025-07-10 11:30:00',
      source: 'DMS',
    },
    {
      id: 'T005',
      orderNo: 'ORD20251115005',
      productName: 'Panamera 2025款',
      amount: 980000,
      status: '待支付',
      transactionTime: '2025-11-15 09:00:00',
      source: 'DMS',
    },
    {
      id: 'T006',
      orderNo: 'ORD20251025006',
      productName: '检测服务',
      amount: 800,
      status: '已完成',
      transactionTime: '2025-10-25 14:20:00',
      source: 'BDC',
    },
  ],
  vehicles: [
    {
      id: 'V001',
      vehicleModel: '911 2025款',
      licensePlate: '沪A12345',
      vin: 'WP0AB2A99DS123456',
      purchaseDate: '2025-10-01',
      status: '已售',
      source: 'DMS',
    },
    {
      id: 'V002',
      vehicleModel: 'Cayenne 2025款',
      licensePlate: '沪B67890',
      vin: 'WP1AG2A99DS67890',
      purchaseDate: '2025-05-15',
      status: '已售',
      source: 'BDC',
    },
    {
      id: 'V003',
      vehicleModel: 'Panamera 2025款',
      licensePlate: '沪C11111',
      vin: 'WP0AF2A99NS11111',
      purchaseDate: '2025-03-20',
      status: '已售',
      source: 'DMS',
    },
    {
      id: 'V004',
      vehicleModel: 'Macan 2025款',
      licensePlate: '沪D22222',
      vin: 'WP1AA2A99DS22222',
      purchaseDate: '2025-06-10',
      status: '自用',
      source: 'BDC',
    },
    {
      id: 'V005',
      vehicleModel: 'Taycan 2025款',
      licensePlate: '沪E33333',
      vin: 'WP0AC2A99DS33333',
      purchaseDate: '2025-04-05',
      status: '维修中',
      source: 'DMS',
    },
  ],
  assets: [
    {
      id: 'A001',
      type: 'voucher',
      name: '购车代金券',
      amount: 5000,
      status: '未使用',
      validFrom: '2025-10-01',
      validTo: '2025-10-01',
      source: '上海闵行店',
    },
    {
      id: 'A002',
      type: 'coupon',
      name: '保养折扣券',
      discount: 0.8,
      status: '未使用',
      validFrom: '2025-09-01',
      validTo: '2025-09-01',
      source: '上海浦东店',
    },
    {
      id: 'A003',
      type: 'voucher',
      name: '维修代金券',
      amount: 2000,
      status: '未使用',
      validFrom: '2025-01-01',
      validTo: '2025-12-31',
      source: '上海浦东店',
    },
    {
      id: 'A004',
      type: 'coupon',
      name: '购车优惠券',
      discount: 0.95,
      status: '已使用',
      validFrom: '2025-08-01',
      validTo: '2025-12-31',
      source: '上海闵行店',
    },
    {
      id: 'A005',
      type: 'voucher',
      name: '检测代金券',
      amount: 300,
      status: '未使用',
      validFrom: '2025-11-01',
      validTo: '2025-11-01',
      source: '上海浦东店',
    },
    {
      id: 'A006',
      type: 'coupon',
      name: '维修折扣券',
      discount: 0.85,
      status: '未使用',
      validFrom: '2025-10-15',
      validTo: '2025-10-15',
      source: '上海闵行店',
    },
    {
      id: 'A007',
      type: 'voucher',
      name: '保养代金券',
      amount: 1000,
      status: '已过期',
      validFrom: '2025-01-01',
      validTo: '2025-01-01',
      source: '上海浦东店',
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
    serviceTime: '2025-01-15 10:30:00',
    serviceStore: '上海闵行4S店',
    vehicleModel: '911 2025款',
    amount: 1200,
    description: '更换机油、机滤、空滤，检查轮胎、刹车系统',
    status: '已完成',
    tags: ['定期保养', '质保期内'],
    source: 'DMS',
    insurance: {
      type: '商业险',
      company: '中国人保',
      policyNo: 'PICC202501150012346',
      startDate: '2025-01-15',
      endDate: '2026-01-14',
      amount: 4850,
    } as InsuranceInfo,
  },
  {
    id: 'M002',
    serviceType: '紧急维修',
    serviceTime: '2025-12-20 14:20:00',
    serviceStore: '上海浦东4S店',
    vehicleModel: '911 2025款',
    amount: 3500,
    description: '更换前保险杠，修复前大灯',
    status: '已完成',
    tags: ['紧急维修', '质保期内'],
    source: 'BDC',
    insurance: {
      type: '交强险+商业险',
      company: '平安保险',
      policyNo: 'PAIC202412150056789',
      startDate: '2024-12-15',
      endDate: '2025-12-14',
      amount: 6800,
    } as InsuranceInfo,
  },
  {
    id: 'M003',
    serviceType: '定期保养',
    serviceTime: '2025-10-05 09:15:00',
    serviceStore: '上海闵行4S店',
    vehicleModel: '911 2025款',
    amount: 1500,
    description: '更换机油、机滤、空滤、空调滤芯，检查电瓶',
    status: '已完成',
    tags: ['定期保养', '质保期内', '满意客户'],
    source: 'DMS',
    insurance: {
      type: '商业险',
      company: '中国人保',
      policyNo: 'PICC2025001234',
      startDate: '2025-10-01',
      endDate: '2025-10-01',
      amount: 5000,
    } as InsuranceInfo,
  },
  {
    id: 'M004',
    serviceType: '检测服务',
    serviceTime: '2025-08-18 11:00:00',
    serviceStore: '上海浦东4S店',
    vehicleModel: '911 2025款',
    amount: 0,
    description: '免费检测：发动机、变速箱、制动系统',
    status: '已完成',
    tags: ['质保期内'],
    source: 'DMS',
  },
]

// Mock 保险记录数据（原始数据，将通过规则验证和规范化）
const mockInsuranceRecordsRaw: Partial<InsuranceRecord>[] = [
  {
    id: 'I001',
    type: '交强险',
    amount: 950,
    status: '已生效',
    company: '中国人保',
    policyNo: 'PICC202501010012345',
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
    policyNo: 'PAIC202501010056789',
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
    policyNo: 'PICC202401010012344',
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
    policyNo: 'PAIC202406010056788',
    startDate: '2024-06-15',
    endDate: '2025-06-14',
    purchaseDate: '2024-05-25',
    source: 'BDC',
  },
]

// 使用规则验证和规范化保险记录数据
let mockInsuranceRecords: InsuranceRecord[]
try {
  // 规范化数据（确保金额取整、格式正确等）
  mockInsuranceRecords = normalizeInsuranceRecords(mockInsuranceRecordsRaw)
  
  // 验证规范化后的数据
  if (!validateInsuranceRecords(mockInsuranceRecords)) {
    throw new Error('保险记录数据验证失败')
  }
  
  console.log('[Mock] 保险记录数据已通过规则验证，共', mockInsuranceRecords.length, '条')
} catch (error) {
  console.error('[Mock] 保险记录数据规范化或验证失败:', error)
  // 如果验证失败，使用空数组，避免返回无效数据
  mockInsuranceRecords = []
}

// Mock 商机信息数据
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
      console.log('[Mock GET] /api/customer/profile - latestOperation:', mockCustomerProfile.latestOperation)
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
      const { mobile, relationTagId, relationTagName, relationTagIds, relationTagNames, businessTags, isPrimary } = body
      
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
        relationTagId: relationTagId || (relationTagIds && relationTagIds.length > 0 ? relationTagIds[0] : undefined),
        relationTagName: relationTagName || (relationTagNames && relationTagNames.length > 0 ? relationTagNames[0] : undefined),
        businessTags: businessTags || [],
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
      const { id, mobile, relationTagId, relationTagName, relationTagIds, relationTagNames, businessTags, isPrimary } = body
      
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
          date: '2025-02-15',
          time: '14:00',
          store: '上海闵行4S店',
          status: '已确认',
          description: '预约试驾911 2025款',
          vehicleModel: '911 2025款',
          source: 'DMS',
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
          source: 'DMS',
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
          name: 'DMS',
          type: 'DMS系统',
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
          name: 'BDC',
          type: 'BDC系统',
          mergeTime: '2025-09-15 14:20:00',
          keyInfo: {
            name: '陈明华',
            mobile: '13900139000',
            age: 38,
            gender: '男',
            city: '上海',
          },
        },
        {
          id: 'PS003',
          name: 'CRM',
          type: 'CRM系统',
          mergeTime: '2025-09-20 09:15:00',
          keyInfo: {
            name: '陈明',
            mobile: '13800138000',
            age: 36,
            gender: '男',
            city: '上海',
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
  // 获取商机信息
  {
    url: '/api/customer/opportunities',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/opportunities - 请求:', req)
      await delay(800)
      const result = {
        code: 200,
        message: 'success',
        data: mockOpportunities,
      }
      console.log('[Mock GET] /api/customer/opportunities - 返回:', result)
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
  // 获取操作日志
  {
    url: '/api/customer/operation-logs',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/operation-logs - 请求:', req)
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
      const result = {
        code: 200,
        message: 'success',
        data: mockOperationLogs,
      }
      console.log('[Mock GET] /api/customer/operation-logs - 返回:', result)
      return result
    },
  },
  // 获取保险记录
  {
    url: '/api/customer/insurance/records',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/insurance/records - 请求:', req)
      await delay(800)
      
      // 确保返回的数据符合规则
      let records = mockInsuranceRecords
      
      // 再次验证数据（防止运行时数据被修改）
      if (!validateInsuranceRecords(records)) {
        console.error('[Mock] 保险记录数据验证失败，返回空数组')
        records = []
      }
      
      const result = {
        code: 200,
        message: 'success',
        data: records,
      }
      console.log('[Mock GET] /api/customer/insurance/records - 返回:', result)
      console.log('[Mock GET] /api/customer/insurance/records - 数据条数:', records.length)
      return result
    },
  },
] as MockMethod[]
