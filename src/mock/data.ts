/**
 * Mock 数据定义
 */
import type { CustomerProfile, TagPool, MobileData, MaintenanceRecord, NameMobileConflict, PlatformSource, InsuranceInfo } from '@/types/customer'

// Mock 客户画像数据（包含冲突数据）
export const mockCustomerProfile: CustomerProfile = {
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
    tags: ['热', 'PMP邀约'],
  },
  maintenanceRecords: {
    value: '8次保养，2次维修',
    isConflict: false,
  },
  tags: ['热', 'PMP邀约', '本市', '人保', '精确报价', '亲子', '品酒'],
  // 新增字段
  customerType: {
    value: '个人',
    isConflict: false,
    sources: [
      { origin: 'CRM', value: '个人', time: '2025-10-01 10:30:00' },
    ],
  },
  opportunityType: {
    value: '高价值商机',
    isConflict: false,
    sources: [
      { origin: 'CRM', value: '高价值商机', time: '2025-10-01 10:30:00' },
    ],
  },
  segmentType: {
    value: 'VIP客户群',
    isConflict: false,
    sources: [
      { origin: 'C@P', value: 'VIP客户群', time: '2025-10-01 10:30:00' },
    ],
  },
  totalConsumption: {
    value: 1456200,
    isConflict: false,
    sources: [
      { origin: 'DMS', value: 1456200, time: '2025-11-15 09:00:00' },
    ],
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
  // 平台溯源信息（可选，如果为空则从 platformSources API 获取）
  platformSources: [
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
  ] as PlatformSource[],
}

// Mock 公司账户数据
export const mockCompanyProfile: CustomerProfile = {
  id: 'COMP001',
  name: { value: '上海喜茶公司', isConflict: false },
  customerType: { value: '公司', isConflict: false },
  latestOperation: { operator: 'Rebecca Z.', operationType: '人工更新', operationTime: '2025-01-15 10:00:00' },
  handlers: [
    {
      id: 'H001',
      name: '张三',
      role: '采购主管',
      mobile: '13811112222',
      age: 42,
      gender: '男',
      city: '上海',
      tags: ['高价值', '餐饮行业', 'VIP车主', '商务合作伙伴'],
      nameMobileConflict: [
        { id: 'conf_h1_1', name: '张三(二级部门)', mobile: '13811112222', origin: 'DMS', updateTime: '2025-01-12 10:00:00' }
      ],
      latestOperation: { operator: 'System', operationType: '同步经办人', operationTime: '2025-01-20 09:00:00' },
      vehicles: [
        { id: 'V_H001_1', vehicleModel: 'Cayenne Turbo', licensePlate: '沪A66666', vin: 'WP0ZZZ92ZDS123456', status: '自用', source: 'DMS' }
      ]
    },
    {
      id: 'H002',
      name: '李四',
      role: '财务经理',
      mobile: '13833334444',
      age: 38,
      gender: '男',
      city: '杭州',
      tags: ['精密严谨', '财务背景', '老客户'],
      latestOperation: { operator: 'Admin', operationType: '手动录入', operationTime: '2025-01-22 15:30:00' }
    },
    {
      id: 'H003',
      name: '王五',
      role: '行政总监',
      mobile: '13855556666',
      age: 45,
      gender: '男',
      city: '上海',
      tags: ['大客户', '高价值', 'VIP车主', '决策者'],
      latestOperation: { operator: 'DMS', operationType: '自动化更新', operationTime: '2025-01-25 11:15:00' },
      vehicles: [
        { id: 'V_H003_1', vehicleModel: 'Taycan Turbo S', licensePlate: '沪A88888', vin: 'WP0ZZZ99ZDS123456', status: '自用', source: 'DMS' },
        { id: 'V_H003_2', vehicleModel: 'Panamera', licensePlate: '沪B99999', vin: 'WP0ZZZ99ZDS654321', status: '自用', source: 'DMS' }
      ],
      assets: [
        { id: 'A_H003_1', type: 'voucher', name: '大客户礼包', amount: 50000, status: '未使用', validFrom: '2025-01-01', validTo: '2026-01-01', source: 'CRM' }
      ],
      opportunities: [
        { id: 'O_H003_1', type: 'VIP 车主', triggerRule: '高价值', priority: '高', status: '待处理', createTime: '2025-01-16 10:00:00' },
        { id: 'O_H003_2', type: '钻石客户', triggerRule: '高价值', priority: '高', status: '待处理', createTime: '2025-01-14 09:20:00' }
      ]
    },
  ],
  selectedHandlerId: 'H001',
  age: { value: 'N/A', isConflict: false },
  gender: { value: 'N/A', isConflict: false },
  city: { value: '上海', isConflict: false },
  preferredCarModel: { value: 'Taycan', isConflict: false, tags: ['高价值', '餐饮行业'] },
  maintenanceRecords: { value: '25次保养', isConflict: false },
  tags: ['大客户', '高价值', '餐饮行业', 'VIP车主'],
  totalConsumption: { value: 5680000, isConflict: false },
  mobile: {
    items: [{ id: 'c_m1', mobile: '021-66668888', isPrimary: true, relationTagName: '公司电话' }],
    isConflict: false
  } as any,
  vehicles: [
    { id: 'CV001', vehicleModel: 'Taycan Turbo S', licensePlate: '沪A88888', vin: 'WP0ZZZ99ZDS123456', status: '自用', source: 'DMS' },
    { id: 'CV002', vehicleModel: 'Panamera', licensePlate: '沪B99999', vin: 'WP0ZZZ99ZDS654321', status: '自用', source: 'CRM' },
  ],
  assets: [
    { id: 'CA001', type: 'voucher', name: '大客户礼包', amount: 50000, status: '未使用', validFrom: '2025-01-01', validTo: '2026-01-01', source: '集团总部' },
  ],
  transactions: [
    { id: 'CT001', orderNo: 'ORD_COMP_001', productName: 'Taycan 批量采购', amount: 5000000, status: '已完成', transactionTime: '2025-01-05', source: 'DMS' },
  ]
}

// Mock 标签池数据（业务标签）
export const mockTagPool: TagPool[] = [
  // 意向级别 - 灰蓝色系
  { id: 'intent_cold', name: '冷', category: '意向级别', color: '#A8B5C0' },
  { id: 'intent_warm', name: '暖', category: '意向级别', color: '#D8C8A8' },
  { id: 'intent_hot', name: '热', category: '意向级别', color: '#D4B8B8' },

  // SC【必选】- 灰绿色系
  { id: 'sc_pmp', name: 'PMP邀约', category: 'SC【必选】', required: true, color: '#B8C8B8' },
  { id: 'sc_full_payment', name: '全款', category: 'SC【必选】', required: true, color: '#B8C8B8' },
  { id: 'sc_employee_referral', name: '员工介绍', category: 'SC【必选】', required: true, color: '#B8C8B8' },
  { id: 'sc_marketing', name: '市场活动', category: 'SC【必选】', required: true, color: '#B8C8B8' },
  { id: 'sc_new_car', name: '新车', category: 'SC【必选】', required: true, color: '#B8C8B8' },
  { id: 'sc_used_car', name: '易手车', category: 'SC【必选】', required: true, color: '#B8C8B8' },
  { id: 'sc_old_customer_referral', name: '老客介绍', category: 'SC【必选】', required: true, color: '#B8C8B8' },
  { id: 'sc_old_customer_repurchase', name: '老客重购', category: 'SC【必选】', required: true, color: '#B8C8B8' },
  { id: 'sc_natural_flow', name: '自然客流', category: 'SC【必选】', required: true, color: '#B8C8B8' },
  { id: 'sc_loan', name: '贷款', category: 'SC【必选】', required: true, color: '#B8C8B8' },
  { id: 'sc_sales_invitation', name: '销售邀约', category: 'SC【必选】', required: true, color: '#B8C8B8' },
  { id: 'sc_public_plate', name: '公牌', category: 'SC【必选】', required: true, color: '#B8C8B8' },
  { id: 'sc_other', name: '其他', category: 'SC【必选】', required: true, color: '#B8C8B8' },

  // SA【必选】- 灰紫色系
  { id: 'sa_local', name: '本市', category: 'SA【必选】', required: true, color: '#D8C8E8' },
  { id: 'sa_outside', name: '省内外市', category: 'SA【必选】', required: true, color: '#D8C8E8' },
  { id: 'sa_private_plate', name: '私牌', category: 'SA【必选】', required: true, color: '#D8C8E8' },

  // 续保【必选】- 灰粉色系
  { id: 'insurance_picc', name: '人保', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_life', name: '人寿', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_expire_10', name: '保险到期月份-10月', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_expire_11', name: '保险到期月份-11月', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_expire_12', name: '保险到期月份-12月', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_expire_1', name: '保险到期月份-1月', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_expire_2', name: '保险到期月份-2月', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_expire_3', name: '保险到期月份-3月', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_expire_4', name: '保险到期月份-4月', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_expire_5', name: '保险到期月份-5月', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_expire_6', name: '保险到期月份-6月', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_expire_7', name: '保险到期月份-7月', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_expire_8', name: '保险到期月份-8月', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_expire_9', name: '保险到期月份-9月', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_other', name: '其他', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_repair_not_insured', name: '在修不在保', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_cpic', name: '太保', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_pingan', name: '平安', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_new', name: '新保', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_renewal', name: '续保', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_taiping', name: '太平', category: '续保【必选】', required: true, color: '#E4C8C8' },
  { id: 'insurance_dadi', name: '大地', category: '续保【必选】', required: true, color: '#E4C8C8' },

  // POC【必选】- 灰黄色系
  { id: 'poc_other', name: '其他评估', category: 'POC【必选】', required: true, color: '#E8D8B8' },
  { id: 'poc_range', name: '区间报价', category: 'POC【必选】', required: true, color: '#E8D8B8' },
  { id: 'poc_aftersales', name: '售后评估', category: 'POC【必选】', required: true, color: '#E8D8B8' },
  { id: 'poc_precise', name: '精确报价', category: 'POC【必选】', required: true, color: '#E8D8B8' },
  { id: 'poc_sales', name: '销售评估', category: 'POC【必选】', required: true, color: '#E8D8B8' },

  // 免打扰车主 - 灰褐色系
  { id: 'dnd_owner', name: '车主免打扰', category: '免打扰车主', color: '#D8C8B8' },

  // 线上活动 - 灰蓝色系
  { id: 'online_activity_aug', name: '8月再购活动抽奖', category: '线上活动', color: '#C8D5E0' },

  // 爱好(≥1项) - 灰绿色系
  { id: 'hobby_parent_child', name: '亲子', category: '爱好(≥1项)', minSelect: 1, color: '#C8D8C8' },
  { id: 'hobby_wine', name: '品酒', category: '爱好(≥1项)', minSelect: 1, color: '#C8D8C8' },
  { id: 'hobby_pet', name: '宠物', category: '爱好(≥1项)', minSelect: 1, color: '#C8D8C8' },
  { id: 'hobby_trendy', name: '潮玩', category: '爱好(≥1项)', minSelect: 1, color: '#C8D8C8' },
  { id: 'hobby_self_drive', name: '自驾游', category: '爱好(≥1项)', minSelect: 1, color: '#C8D8C8' },
  { id: 'hobby_art', name: '艺术文化', category: '爱好(≥1项)', minSelect: 1, color: '#C8D8C8' },
  { id: 'hobby_racing', name: '赛车', category: '爱好(≥1项)', minSelect: 1, color: '#C8D8C8' },
  { id: 'hobby_sports', name: '运动', category: '爱好(≥1项)', minSelect: 1, color: '#C8D8C8' },
  { id: 'hobby_golf', name: '高尔夫', category: '爱好(≥1项)', minSelect: 1, color: '#C8D8C8' },
]

// Mock 关系标签池数据（用于电话号码关系标签）
export const mockRelationTagPool: TagPool[] = [
  { id: 'relation1', name: '本人', color: '#1989fa' },
  { id: 'relation2', name: '配偶', color: '#ff6b9d' },
  { id: 'relation3', name: '父亲', color: '#52c41a' },
  { id: 'relation4', name: '母亲', color: '#52c41a' },
  { id: 'relation5', name: '儿子', color: '#1890ff' },
  { id: 'relation6', name: '女儿', color: '#eb2f96' },
  { id: 'relation7', name: '朋友', color: '#fa8c16' },
  { id: 'relation8', name: '同事', color: '#13c2c2' },
  { id: 'relation9', name: '其他', color: '#8c8c8c' },
]

// Mock 维保记录数据
export const mockMaintenanceRecords: MaintenanceRecord[] = [
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

