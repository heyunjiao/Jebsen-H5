/**
 * Mock 数据规则定义
 * 确保所有 mock 数据符合类型定义和业务规则
 */
import type { InsuranceRecord } from '@/types/customer'

/**
 * 保险类型枚举
 */
export const INSURANCE_TYPES = ['交强险', '商业险', '第三者责任险', '意外险'] as const
export type InsuranceType = typeof INSURANCE_TYPES[number]

/**
 * 保险状态枚举
 */
export const INSURANCE_STATUSES = ['已生效', '已过期', '待续保', '已退保', '生效中'] as const
export type InsuranceStatus = typeof INSURANCE_STATUSES[number]

/**
 * 保险公司列表
 */
export const INSURANCE_COMPANIES = [
  '中国人保',
  '平安保险',
  '太平洋保险',
  '中国人寿',
  '大地保险',
  '阳光保险',
] as const

/**
 * 保险记录数据规则
 */
export interface InsuranceRecordRules {
  // 必填字段规则
  required: {
    id: (value: any) => boolean // ID 必须是非空字符串
    type: (value: any) => boolean // 类型必须是枚举值之一
    amount: (value: any) => boolean // 金额必须是正数
    status: (value: any) => boolean // 状态必须是枚举值之一
  }
  // 可选字段规则
  optional: {
    company: (value: any) => boolean // 保险公司名称
    policyNo: (value: any) => boolean // 保单号格式
    startDate: (value: any) => boolean // 开始日期格式
    endDate: (value: any) => boolean // 结束日期格式
    purchaseDate: (value: any) => boolean // 购买日期格式
    source: (value: any) => boolean // 来源系统
  }
  // 业务规则
  business: {
    amountMustBeInteger: (value: number) => boolean // 金额必须取整
    dateRangeValid: (startDate?: string, endDate?: string) => boolean // 日期范围有效
    endDateAfterStartDate: (startDate?: string, endDate?: string) => boolean // 结束日期必须在开始日期之后
  }
}

/**
 * 验证函数：检查值是否为有效的保险类型
 */
export function isValidInsuranceType(value: any): value is InsuranceType {
  return typeof value === 'string' && INSURANCE_TYPES.includes(value as InsuranceType)
}

/**
 * 验证函数：检查值是否为有效的保险状态
 */
export function isValidInsuranceStatus(value: any): value is InsuranceStatus {
  return typeof value === 'string' && INSURANCE_STATUSES.includes(value as InsuranceStatus)
}

/**
 * 验证函数：检查金额是否有效（正数且取整）
 */
export function isValidAmount(value: any): value is number {
  return typeof value === 'number' && value > 0 && Number.isInteger(value)
}

/**
 * 验证函数：检查日期格式（YYYY-MM-DD）
 */
export function isValidDate(value: any): boolean {
  if (typeof value !== 'string') return false
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(value)) return false
  const date = new Date(value)
  return !isNaN(date.getTime())
}

/**
 * 验证函数：检查保单号格式
 */
export function isValidPolicyNo(value: any): boolean {
  if (typeof value !== 'string') return false
  // 保单号通常是字母数字组合，长度在 10-30 之间
  return /^[A-Z0-9]{10,30}$/i.test(value)
}

/**
 * 验证函数：检查日期范围是否有效
 */
export function isValidDateRange(startDate?: string, endDate?: string): boolean {
  if (!startDate || !endDate) return true // 如果任一为空，认为有效（可选字段）
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false
  return new Date(endDate) >= new Date(startDate)
}

/**
 * 验证函数：验证完整的保险记录
 */
export function validateInsuranceRecord(record: any): record is InsuranceRecord {
  // 验证必填字段
  if (!record.id || typeof record.id !== 'string' || record.id.trim() === '') {
    console.error('[Rules] 保险记录验证失败: id 无效', record)
    return false
  }

  if (!isValidInsuranceType(record.type)) {
    console.error('[Rules] 保险记录验证失败: type 无效', record.type, '有效值:', INSURANCE_TYPES)
    return false
  }

  if (!isValidAmount(record.amount)) {
    console.error('[Rules] 保险记录验证失败: amount 无效', record.amount, '必须是正整数')
    return false
  }

  if (!isValidInsuranceStatus(record.status)) {
    console.error('[Rules] 保险记录验证失败: status 无效', record.status, '有效值:', INSURANCE_STATUSES)
    return false
  }

  // 验证可选字段（如果存在）
  if (record.company !== undefined && typeof record.company !== 'string') {
    console.error('[Rules] 保险记录验证失败: company 必须是字符串', record)
    return false
  }

  if (record.policyNo !== undefined && !isValidPolicyNo(record.policyNo)) {
    console.error('[Rules] 保险记录验证失败: policyNo 格式无效', record.policyNo)
    return false
  }

  if (record.startDate !== undefined && !isValidDate(record.startDate)) {
    console.error('[Rules] 保险记录验证失败: startDate 格式无效', record.startDate)
    return false
  }

  if (record.endDate !== undefined && !isValidDate(record.endDate)) {
    console.error('[Rules] 保险记录验证失败: endDate 格式无效', record.endDate)
    return false
  }

  if (record.purchaseDate !== undefined && !isValidDate(record.purchaseDate)) {
    console.error('[Rules] 保险记录验证失败: purchaseDate 格式无效', record.purchaseDate)
    return false
  }

  if (record.source !== undefined && typeof record.source !== 'string') {
    console.error('[Rules] 保险记录验证失败: source 必须是字符串', record)
    return false
  }

  // 验证业务规则
  if (!isValidDateRange(record.startDate, record.endDate)) {
    console.error('[Rules] 保险记录验证失败: 日期范围无效', {
      startDate: record.startDate,
      endDate: record.endDate,
    })
    return false
  }

  return true
}

/**
 * 验证函数：验证保险记录数组
 */
export function validateInsuranceRecords(records: any[]): records is InsuranceRecord[] {
  if (!Array.isArray(records)) {
    console.error('[Rules] 保险记录数组验证失败: 不是数组', records)
    return false
  }

  for (let i = 0; i < records.length; i++) {
    if (!validateInsuranceRecord(records[i])) {
      console.error(`[Rules] 保险记录数组验证失败: 第 ${i + 1} 条记录无效`, records[i])
      return false
    }
  }

  return true
}

/**
 * 规范化函数：确保金额取整
 */
export function normalizeAmount(amount: number): number {
  return Math.round(amount)
}

/**
 * 规范化函数：确保保险记录符合规范
 */
export function normalizeInsuranceRecord(record: Partial<InsuranceRecord>): InsuranceRecord {
  const normalized: InsuranceRecord = {
    id: record.id || `I${Date.now()}`,
    type: isValidInsuranceType(record.type) ? record.type : '交强险',
    amount: normalizeAmount(record.amount || 0),
    status: isValidInsuranceStatus(record.status) ? record.status : '已生效',
    ...(record.company && { company: record.company }),
    ...(record.policyNo && { policyNo: record.policyNo }),
    ...(record.startDate && { startDate: record.startDate }),
    ...(record.endDate && { endDate: record.endDate }),
    ...(record.purchaseDate && { purchaseDate: record.purchaseDate }),
    ...(record.source && { source: record.source }),
  }

  // 验证规范化后的记录
  if (!validateInsuranceRecord(normalized)) {
    throw new Error(`规范化后的保险记录验证失败: ${JSON.stringify(normalized)}`)
  }

  return normalized
}

/**
 * 规范化函数：确保保险记录数组符合规范
 */
export function normalizeInsuranceRecords(records: Partial<InsuranceRecord>[]): InsuranceRecord[] {
  return records.map((record, index) => {
    try {
      return normalizeInsuranceRecord(record)
    } catch (error) {
      console.error(`[Rules] 规范化第 ${index + 1} 条记录失败:`, error, record)
      throw error
    }
  })
}

