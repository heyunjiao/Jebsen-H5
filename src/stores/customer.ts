import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CustomerProfile, TagPool, MaintenanceRecord, TransactionRecord, VehicleRelation, Asset, ConflictResolution, Appointment, PlatformSource, Opportunity, OperationLog, InsuranceRecord } from '@/api/customer'
import { customerApi } from '@/api/customer'
import { showLoadingToast, closeToast, showToast } from 'vant'

export const useCustomerStore = defineStore('customer', () => {
  const profile = ref<CustomerProfile | null>(null)
  const tagPool = ref<TagPool[]>([])
  const maintenanceRecords = ref<MaintenanceRecord[]>([])
  const insuranceRecords = ref<InsuranceRecord[]>([])
  const transactions = ref<TransactionRecord[]>([])
  const vehicles = ref<VehicleRelation[]>([])
  const assets = ref<Asset[]>([])
  const appointments = ref<Appointment[]>([])
  const platformSources = ref<PlatformSource[]>([])
  const opportunities = ref<Opportunity[]>([])
  const operationLogs = ref<OperationLog[]>([])
  const loading = ref(false)

  // 获取客户画像
  const fetchProfile = async (customerId?: string) => {
    loading.value = true
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
    })

    try {
      const res = await customerApi.getProfile(customerId)
      if (res.code === 200) {
        console.log('[Store] 接收到的 profile 数据:', res.data)
        console.log('[Store] vehicles:', res.data.vehicles)
        console.log('[Store] assets:', res.data.assets)
        console.log('[Store] customerType:', res.data.customerType)
        console.log('[Store] opportunityType:', res.data.opportunityType)
        console.log('[Store] segmentType:', res.data.segmentType)
        console.log('[Store] totalConsumption:', res.data.totalConsumption)
        profile.value = res.data
        console.log('[Store] 设置后的 profile.value:', profile.value)
        console.log('[Store] profile.value.vehicles:', profile.value?.vehicles)
        console.log('[Store] profile.value.assets:', profile.value?.assets)
        console.log('[Store] profile.value.customerType:', profile.value?.customerType)
        console.log('[Store] profile.value.opportunityType:', profile.value?.opportunityType)
        console.log('[Store] profile.value.segmentType:', profile.value?.segmentType)
        console.log('[Store] profile.value.totalConsumption:', profile.value?.totalConsumption)
        console.log('[Store] profile.value.latestOperation:', profile.value?.latestOperation)
      }
    } catch (error: any) {
      // Fallback: 使用本地数据
      console.log('使用 fallback 数据设置 profile')
      profile.value = {
        id: 'C001',
        name: { value: '陈明', isConflict: false },
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
              relationTagId: 'tag2',
              relationTagName: '高意向',
              source: '官网',
              updateTime: '2023-10-01 10:30:00',
            },
            {
              id: 'mobile2',
              mobile: '13900139000',
              isPrimary: false,
              relationTagId: 'tag3',
              relationTagName: '置换需求',
              source: '线下门店',
              updateTime: '2023-09-15 14:20:00',
            },
          ],
          isConflict: true,
          editable: true,
        },
        gender: { value: '男', isConflict: false },
        city: {
          value: '北京',
          isConflict: true,
          sources: [
            { origin: '官网注册', value: '北京', time: '2023-10-01 10:30:00' },
            { origin: '线下门店', value: '上海', time: '2023-09-15 14:20:00' },
          ],
        },
        preferredCarModel: { value: '3系', isConflict: false },
        maintenanceRecords: { value: '3次保养，1次维修', isConflict: false },
        tags: ['高意向', '置换需求'],
        // 新增字段
        customerType: {
          value: '个人',
          isConflict: false,
          sources: [
            { origin: 'CRM系统', value: '个人', time: '2023-10-01 10:30:00' },
          ],
        },
        opportunityType: {
          value: '高价值商机',
          isConflict: false,
          sources: [
            { origin: 'CRM系统', value: '高价值商机', time: '2023-10-01 10:30:00' },
          ],
        },
        segmentType: {
          value: 'VIP客户群',
          isConflict: false,
          sources: [
            { origin: '数据分析系统', value: 'VIP客户群', time: '2023-10-01 10:30:00' },
          ],
        },
        totalConsumption: {
          value: 1456200,
          isConflict: false,
          sources: [
            { origin: '财务系统', value: 1456200, time: '2023-11-15 09:00:00' },
          ],
        },
        // 最新操作信息（用于首页提示）
        latestOperation: {
          operator: 'Rebecca Z.',
          operationType: '人工更新',
          operationTime: '2024-01-15 14:30:00',
        },
      }
      console.log('Profile 已设置:', profile.value)
      console.log('Profile customerType:', profile.value?.customerType)
      console.log('Profile opportunityType:', profile.value?.opportunityType)
      console.log('Profile segmentType:', profile.value?.segmentType)
      console.log('Profile totalConsumption:', profile.value?.totalConsumption)
    } finally {
      loading.value = false
      closeToast()
    }
  }

  // 获取标签池
  const fetchTagPool = async () => {
    try {
      const res = await customerApi.getTagPool()
      if (res.code === 200) {
        tagPool.value = res.data
      }
    } catch (error: any) {
      // Fallback: 使用本地数据（静默处理，不显示警告）
      // 使用与Mock数据一致的分类标签（莫兰迪色系）
      tagPool.value = [
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
    }
  }

  // 添加标签
  const addTag = async (tagId: string) => {
    showLoadingToast({
      message: '添加中...',
      forbidClick: true,
    })

    try {
      const res = await customerApi.addTag(tagId)
      if (res.code === 200 && profile.value) {
        // 使用新数组引用确保响应式更新
        profile.value.tags = [...res.data.tags]
        showToast('添加成功')
      }
    } catch (error: any) {
      showToast(error.message || '添加失败，请重试')
    } finally {
      closeToast()
    }
  }

  // 删除标签
  const removeTag = async (tagName: string) => {
    showLoadingToast({
      message: '删除中...',
      forbidClick: true,
    })

    try {
      const res = await customerApi.removeTag(tagName)
      if (res.code === 200 && profile.value) {
        // 使用新数组引用确保响应式更新
        profile.value.tags = [...res.data.tags]
        showToast('删除成功')
      }
    } catch (error: any) {
      showToast(error.message || '删除失败，请重试')
    } finally {
      closeToast()
    }
  }

  // 批量更新标签（一次性提交）
  const updateTags = async (tags: string[]) => {
    showLoadingToast({
      message: '保存中...',
      forbidClick: true,
    })

    try {
      const res = await customerApi.updateTags(tags)
      if (res.code === 200 && profile.value) {
        // 使用新数组引用确保响应式更新
        profile.value.tags = [...res.data.tags]
        showToast('保存成功')
      }
    } catch (error: any) {
      showToast(error.message || '保存失败，请重试')
      throw error
    } finally {
      closeToast()
    }
  }

  // 获取维保记录
  const fetchMaintenanceRecords = async (customerId?: string) => {
    try {
      const res = await customerApi.getMaintenanceRecords(customerId)
      if (res.code === 200) {
        // 使用新数组引用确保响应式更新
        maintenanceRecords.value = [...res.data]
      }
    } catch (error: any) {
      console.error('获取维保记录失败:', error)
      // Fallback: 使用空数组
      maintenanceRecords.value = []
    }
  }

  // 更新维保记录标签
  const updateMaintenanceTags = async (recordId: string, tags: string[]) => {
    try {
      const res = await customerApi.updateMaintenanceTags(recordId, tags)
      if (res.code === 200) {
        // 直接更新本地数据，避免重新加载
        const index = maintenanceRecords.value.findIndex((r) => r.id === recordId)
        if (index !== -1) {
          // 使用新数组引用确保响应式更新
          // 创建新对象以确保响应式更新
          maintenanceRecords.value[index] = {
            ...maintenanceRecords.value[index],
            tags: [...res.data.tags],
          }
        }
      }
      return res
    } catch (error: any) {
      throw error
    }
  }

  // 更新用户偏好标签
  const updatePreferredCarModelTags = async (tags: string[], showSuccessToast = true) => {
    if (showSuccessToast) {
      showLoadingToast({
        message: '保存中...',
        forbidClick: true,
      })
    }

    try {
      const res = await customerApi.updatePreferredCarModelTags(tags)
      if (res.code === 200 && profile.value) {
        // 使用对象展开运算符创建新对象，确保响应式更新
        profile.value.preferredCarModel = {
          ...profile.value.preferredCarModel,
          tags: [...res.data.tags],
        }
        
        if (showSuccessToast) {
          showToast('保存成功')
        }
      }
    } catch (error: any) {
      if (showSuccessToast) {
        showToast(error.message || '保存失败，请重试')
      }
      throw error
    } finally {
      if (showSuccessToast) {
        closeToast()
      }
    }
  }

  // 获取交易记录
  const fetchTransactions = async (customerId?: string) => {
    try {
      const res = await customerApi.getTransactions(customerId)
      if (res.code === 200) {
        transactions.value = [...res.data]
      }
    } catch (error: any) {
      console.error('获取交易记录失败:', error)
      // Fallback: 使用本地数据
      transactions.value = [
        {
          id: 'T001',
          orderNo: 'ORD20231001001',
          productName: '3系 2023款',
          amount: 320000,
          status: '已完成',
          transactionTime: '2023-10-01 14:30:00',
          source: '官网',
        },
        {
          id: 'T002',
          orderNo: 'ORD20230915002',
          productName: '车辆保养服务',
          amount: 1200,
          status: '已完成',
          transactionTime: '2023-09-15 10:20:00',
          source: '线下门店',
        },
      ]
    }
  }

  // 获取车辆关联
  const fetchVehicles = async (customerId?: string) => {
    try {
      const res = await customerApi.getVehicles(customerId)
      if (res.code === 200) {
        vehicles.value = [...res.data]
      }
    } catch (error: any) {
      console.error('获取车辆关联失败:', error)
      // Fallback: 使用本地数据
      vehicles.value = [
        {
          id: 'V001',
          vehicleModel: '3系 2023款',
          licensePlate: '京A12345',
          vin: 'LBVNU210X3K123456',
          purchaseDate: '2023-10-01',
          status: '已售',
          source: '官网',
        },
        {
          id: 'V002',
          vehicleModel: 'X5 2023款',
          licensePlate: '京B67890',
          vin: '5UXKR0C50L9A12345',
          purchaseDate: '2022-05-15',
          status: '已售',
          source: '线下门店',
        },
      ]
    }
  }

  // 获取资产中心
  const fetchAssets = async (customerId?: string) => {
    try {
      const res = await customerApi.getAssets(customerId)
      if (res.code === 200) {
        assets.value = [...res.data]
      }
    } catch (error: any) {
      console.error('获取资产中心失败:', error)
      // Fallback: 使用本地数据
      assets.value = [
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
      ]
    }
  }

  // 提交姓名+手机号冲突处理
  const submitNameMobileConflict = async (data: ConflictResolution) => {
    showLoadingToast({
      message: '提交中...',
      forbidClick: true,
    })

    try {
      const res = await customerApi.submitNameMobileConflict(data)
      if (res.code === 200) {
        showToast('提交成功，后台管理人员将尽快处理')
        return res
      }
    } catch (error: any) {
      showToast(error.message || '提交失败，请重试')
      throw error
    } finally {
      closeToast()
    }
  }

  // 获取预约信息
  const fetchAppointments = async (customerId?: string) => {
    try {
      const res = await customerApi.getAppointments(customerId)
      console.log('[Store] 获取预约信息响应:', res)
      console.log('[Store] 响应数据类型:', typeof res.data, Array.isArray(res.data))
      console.log('[Store] 响应数据长度:', res.data?.length)
      if (res.code === 200) {
        // 确保 data 是数组且只包含预约信息
        if (Array.isArray(res.data)) {
          console.log('[Store] 预约信息数据:', res.data)
          // 只取前2条，确保数据正确
          appointments.value = res.data.slice(0, 2)
          console.log('[Store] 设置后的 appointments 长度:', appointments.value.length)
        } else {
          console.warn('[Store] 预约信息数据格式错误，不是数组:', res.data)
          appointments.value = []
        }
      }
    } catch (error: any) {
      console.error('获取预约信息失败:', error)
      // Fallback: 使用本地数据
      appointments.value = [
        {
          id: 'A001',
          type: '试驾预约',
          date: '2024-02-15',
          time: '14:00',
          store: '北京朝阳4S店',
          status: '已确认',
          description: '预约试驾3系 2024款',
          vehicleModel: '3系 2024款',
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
          vehicleModel: '3系 2023款',
          source: '官网',
        },
      ]
    }
  }

  // 获取平台溯源信息
  const fetchPlatformSources = async (customerId?: string) => {
    try {
      const res = await customerApi.getPlatformSources(customerId)
      if (res.code === 200) {
        platformSources.value = [...res.data]
      }
    } catch (error: any) {
      console.error('获取平台溯源信息失败:', error)
      platformSources.value = []
    }
  }

  // 获取商机信息
  const fetchOpportunities = async (customerId?: string) => {
    try {
      const res = await customerApi.getOpportunities(customerId)
      if (res.code === 200) {
        opportunities.value = [...res.data]
      }
    } catch (error: any) {
      console.error('获取商机信息失败:', error)
      // Fallback: 使用本地数据
      opportunities.value = [
        {
          id: 'OPP001',
          oneId: 'ONE-202401001',
          type: '首保流失15个月',
          triggerRule: '首保流失提醒规则',
          priority: '高',
          status: '待处理',
          pushTarget: 'bdc',
          pushStatus: '待推送',
          createTime: '2024-01-15 10:30:00',
          description: '最近保养公里：0\n交付日期：2026/02/02',
          source: 'CRM系统',
        },
        {
          id: 'OPP002',
          oneId: 'ONE-202401002',
          type: 'PCN售后',
          triggerRule: 'PCN售后活动规则',
          priority: '高',
          status: '处理中',
          pushTarget: 'bdc',
          pushStatus: '成功',
          createTime: '2024-01-14 09:20:00',
          description: '活动内容：对网关控制单元（蓄电池传感器）重新编程\n活动完成率：30%\n距离目标差值（车）：30\n活动属性：30',
          source: 'CRM系统',
        },
      ]
    }
  }

  // 获取操作日志
  const fetchOperationLogs = async (customerId?: string) => {
    try {
      const res = await customerApi.getOperationLogs(customerId)
      if (res.code === 200) {
        operationLogs.value = [...res.data]
      }
    } catch (error: any) {
      console.error('获取操作日志失败:', error)
      // Fallback: 使用空数组
      operationLogs.value = []
    }
  }

  // 获取保险记录（分页加载）
  const fetchInsuranceRecordsPage = async (page: number = 1, pageSize: number = 5, customerId?: string): Promise<boolean> => {
    try {
      const res = await customerApi.getInsuranceRecords({
        customerId,
        page,
        pageSize,
      })
      if (res.code === 200) {
        // 追加新数据到现有列表
        if (page === 1) {
          // 第一页，重置数据
          insuranceRecords.value = [...res.data.list]
        } else {
          // 后续页，追加数据
          insuranceRecords.value = [...insuranceRecords.value, ...res.data.list]
        }
        return res.data.hasMore
      }
      return false
    } catch (error: any) {
      console.error('获取保险记录失败:', error)
      return false
    }
  }

  // 获取保险记录（兼容旧接口，一次性加载所有）
  const fetchInsuranceRecords = async (customerId?: string) => {
    try {
      const res = await customerApi.getInsuranceRecords({
        customerId,
        page: 1,
        pageSize: 100, // 一次性加载大量数据
      })
      if (res.code === 200) {
        // 新格式：{ list, hasMore, total }
        if (res.data && 'list' in res.data) {
          insuranceRecords.value = [...res.data.list]
        } else {
          // 兼容旧格式：直接是数组
          insuranceRecords.value = Array.isArray(res.data) ? [...res.data] : []
        }
      }
    } catch (error: any) {
      console.error('获取保险记录失败:', error)
      insuranceRecords.value = []
    }
  }

  // 清空保险记录
  const clearInsuranceRecords = () => {
    insuranceRecords.value = []
  }

  return {
    profile,
    tagPool,
    maintenanceRecords,
    insuranceRecords,
    transactions,
    vehicles,
    assets,
    appointments,
    platformSources,
    opportunities,
    operationLogs,
    loading,
    fetchProfile,
    fetchTagPool,
    fetchMaintenanceRecords,
    fetchInsuranceRecords,
    fetchInsuranceRecordsPage,
    clearInsuranceRecords,
    fetchTransactions,
    fetchVehicles,
    fetchAssets,
    fetchAppointments,
    fetchPlatformSources,
    fetchOpportunities,
    fetchOperationLogs,
    addTag,
    removeTag,
    updateTags,
    updatePreferredCarModelTags,
    updateMaintenanceTags,
    submitNameMobileConflict,
  }
})

