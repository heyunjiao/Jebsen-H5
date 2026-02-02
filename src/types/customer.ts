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
}

// 电话号码项类型
export interface MobileItem {
  id: string // 电话号码唯一ID
  mobile: string // 电话号码
  relationTagId?: string // 关系标签ID（从标签池选择）
  relationTagName?: string // 关系标签名称
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
  status: string // 状态：在售、已售、维修中等
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
  // 注意：transactions、vehicles、assets 已迁移到独立接口，不再从此接口返回
  // 保留可选字段以保持向后兼容性（Mock 数据中可能仍包含）
  transactions?: TransactionRecord[] // 交易记录（已废弃，使用独立接口）
  vehicles?: VehicleRelation[] // 车辆关联（已废弃，使用独立接口）
  assets?: Asset[] // 资产中心（已废弃，使用独立接口）
}

