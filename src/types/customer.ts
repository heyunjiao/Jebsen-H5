/**
 * 客户画像相关类型定义
 */

// 冲突数据源详情类型
export interface SourceDetail {
  origin: string // 来源名称
  value: string | number // 来源值
  time: string // 更新时间
}

// 字段数据类型
export interface FieldData {
  value: string | number // 主值（最优值）
  isConflict: boolean // 是否存在冲突
  editable?: boolean // 是否可编辑（仅手机号）
  sources?: SourceDetail[] // 冲突时的多源数据
}

// 标签池类型
export interface TagPool {
  id: string
  name: string
  color?: string
  category?: string // 标签分类
  required?: boolean // 是否必选
  minSelect?: number // 最少选择数量（如爱好≥1项）
}

// 电话号码项类型
export interface MobileItem {
  id: string // 电话号码唯一ID
  mobile: string // 电话号码
  relationTagId?: string // 关系标签ID（从标签池选择，单选）
  relationTagName?: string // 关系标签名称（单选）
  relationTagIds?: string[] // 关系标签ID列表（向后兼容，已废弃，改为单选）
  relationTagNames?: string[] // 关系标签名称列表（向后兼容，已废弃，改为单选）
  businessTags?: string[] // 业务标签列表（多选：车主、送修人等）
  isPrimary: boolean // 是否为主号码
  source?: string // 来源系统
  updateTime?: string // 更新时间
}

// 电话号码数据类型（支持列表）
export interface MobileData {
  items: MobileItem[] // 电话号码列表
  isConflict: boolean // 是否存在冲突（多个号码）
  editable?: boolean // 是否可编辑
}

// 交易记录类型
export interface TransactionRecord {
  id: string
  orderNo: string // 订单号
  productName: string // 产品名称
  amount: number // 交易金额
  status: string // 交易状态：已完成、待支付、已取消等
  transactionTime: string // 交易时间
  source?: string // 来源系统
}

// 车辆关联类型
export interface VehicleRelation {
  id: string
  vehicleModel: string // 车型
  licensePlate?: string // 车牌号
  vin?: string // 车架号
  purchaseDate?: string // 购买日期
  status: string // 状态：自用、已售、维修中等
  source?: string // 来源系统
}

// 资产类型（优惠券/代金券）
export interface Asset {
  id: string
  type: 'coupon' | 'voucher' // 类型：优惠券或代金券
  name: string // 资产名称
  amount?: number // 面额（代金券）
  discount?: number // 折扣（优惠券）
  status: string // 状态：未使用、已使用、已过期
  validFrom: string // 有效期开始
  validTo: string // 有效期结束
  source?: string // 来源系统
}

// 维保记录类型
export interface MaintenanceRecord {
  id: string
  serviceType: string // 服务类型：保养、维修、检测等
  serviceTime: string // 服务时间
  serviceStore: string // 服务门店
  vehicleModel?: string // 车辆型号
  amount?: number // 服务金额
  description?: string // 服务描述
  status: string // 状态：已完成、进行中、待处理、已取消
  tags?: string[] // 标签列表（可多选）
  source?: string // 来源系统
  insurance?: InsuranceInfo // 保险信息
}

// 保险信息类型
export interface InsuranceInfo {
  type: string // 保险类型：交强险、商业险等
  company?: string // 保险公司
  policyNo?: string // 保单号
  startDate?: string // 保险开始日期
  endDate?: string // 保险结束日期
  amount?: number // 保险金额
}

// 保险记录类型
export interface InsuranceRecord {
  id: string
  type: '交强险' | '商业险' | '第三者责任险' | '意外险' // 保险类型
  amount: number // 保险金额（取整）
  status: string // 状态：已生效、已过期、待续保、已退保等
  company?: string // 保险公司
  policyNo?: string // 保单号
  startDate?: string // 保险开始日期
  endDate?: string // 保险结束日期
  purchaseDate?: string // 购买日期
  source?: string // 来源系统
}

// 姓名+手机号冲突数据
export interface NameMobileConflict {
  id: string
  name: string
  mobile: string
  origin: string // 来源平台
  updateTime: string
}

// 冲突处理提交数据
export interface ConflictResolution {
  selectedIds: string[] // 选中的冲突数据ID
  note?: string // 备注信息
  action: 'merge' | 'keep' // 操作类型：merge-申请合并，keep-保持多条
}

// 预约信息类型
export interface Appointment {
  id: string
  type: string // 预约类型：试驾、保养、维修等
  date: string // 预约日期
  time: string // 预约时间
  store: string // 预约门店
  status: string // 状态：待确认、已确认、已完成、已取消
  description?: string // 预约描述
  vehicleModel?: string // 相关车型
  source?: string // 来源系统
}

// 平台溯源信息
export interface PlatformSource {
  id: string
  name: string // 平台名称
  type: string // 平台类型
  mergeTime: string // 合并时间
  keyInfo: {
    name?: string
    mobile?: string
    age?: number
    gender?: string
    city?: string
    [key: string]: any // 其他关键信息
  }
}

// 商机信息类型
export interface Opportunity {
  id: string
  oneId?: string // OneID（可选）
  type: string // 商机类型：维保到期、代金券到期、高价值客户、流失预警、复购机会、升级机会等
  triggerRule: string // 触发规则
  priority: '高' | '中' | '低' // 优先级
  status: '待处理' | '处理中' | '已推送' | '已完成' // 状态
  pushTarget?: string // 推送目标：bdc、wechat、crm等
  pushStatus?: '待推送' | '成功' | '失败' // 推送状态
  createTime: string // 创建时间
  description?: string // 描述信息
  source?: string // 来源系统
}

// 操作日志类型
export interface OperationLog {
  id: string
  operator: string // 操作人姓名
  operationType: string // 操作类型：人工更新、系统更新、数据合并等
  operationTime: string // 操作时间
  description?: string // 操作描述
  details?: {
    field?: string // 操作的字段
    oldValue?: string | number // 旧值
    newValue?: string | number // 新值
    [key: string]: any // 其他详情
  }
}

// 客户画像数据类型
export interface CustomerProfile {
  id: string
  name: FieldData
  age: FieldData
  mobile: MobileData | FieldData // 支持新的MobileData或旧的FieldData（向后兼容）
  gender: FieldData
  city: FieldData
  preferredCarModel: FieldData & { tags?: string[] } // 意向车型（支持标签）
  maintenanceRecords: FieldData // 维保记录（旧版，保留兼容）
  tags: string[] // 用户标签
  // 新增字段
  opportunityType?: FieldData // 商机类型
  segmentType?: FieldData // 分群类型
  totalConsumption?: FieldData // 总消费
  customerType?: FieldData // 客户类型：个人/公司
  servicePreferences?: { tags: string[] } // 服务偏好（支持多标签）
  // 冲突和合并相关
  nameMobileConflict?: NameMobileConflict[] // 姓名+手机号冲突数据
  isMultiSource?: boolean // 是否是多源平台合并
  platformSources?: PlatformSource[] // 平台溯源信息
  // 预约信息
  appointments?: Appointment[] // 预约信息列表
  // 最新操作信息（用于首页提示）
  latestOperation?: {
    operator: string // 操作人
    operationType: string // 操作类型
    operationTime: string // 操作时间
  }
  // 注意：transactions、vehicles、assets 已迁移到独立接口，不再从此接口返回
  // 保留可选字段以保持向后兼容性（Mock 数据中可能仍包含）
  transactions?: TransactionRecord[] // 交易记录（已废弃，使用独立接口）
  vehicles?: VehicleRelation[] // 车辆关联（已废弃，使用独立接口）
  assets?: Asset[] // 资产中心（已废弃，使用独立接口）
}

