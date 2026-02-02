import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CustomerProfile, TagPool, MaintenanceRecord, TransactionRecord, VehicleRelation, Asset, ConflictResolution, Appointment, PlatformSource } from '@/api/customer'
import { customerApi } from '@/api/customer'
import { showLoadingToast, closeToast, showToast } from 'vant'

export const useCustomerStore = defineStore('customer', () => {
  const profile = ref<CustomerProfile | null>(null)
  const tagPool = ref<TagPool[]>([])
  const maintenanceRecords = ref<MaintenanceRecord[]>([])
  const transactions = ref<TransactionRecord[]>([])
  const vehicles = ref<VehicleRelation[]>([])
  const assets = ref<Asset[]>([])
  const appointments = ref<Appointment[]>([])
  const platformSources = ref<PlatformSource[]>([])
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
      }
    } catch (error: any) {
      // Fallback: 使用本地数据
      console.log('使用 fallback 数据设置 profile')
      profile.value = {
        id: 'C001',
        name: { value: '张三', isConflict: false },
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
        preferredCarModel: { value: 'BMW 3系', isConflict: false },
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
      tagPool.value = [
        { id: 'tag1', name: '战败客户', color: '#ff4d4f' },
        { id: 'tag2', name: '高意向', color: '#52c41a' },
        { id: 'tag3', name: '置换需求', color: '#1890ff' },
        { id: 'tag4', name: '首购客户', color: '#722ed1' },
        { id: 'tag5', name: 'VIP客户', color: '#fa8c16' },
        { id: 'tag6', name: '潜在客户', color: '#13c2c2' },
        { id: 'tag7', name: '已成交', color: '#eb2f96' },
        { id: 'tag8', name: '流失客户', color: '#8c8c8c' },
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
          productName: 'BMW 3系 2023款',
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

  return {
    profile,
    tagPool,
    maintenanceRecords,
    transactions,
    vehicles,
    assets,
    appointments,
    platformSources,
    loading,
    fetchProfile,
    fetchTagPool,
    fetchMaintenanceRecords,
    fetchTransactions,
    fetchVehicles,
    fetchAssets,
    fetchAppointments,
    fetchPlatformSources,
    addTag,
    removeTag,
    updatePreferredCarModelTags,
    updateMaintenanceTags,
    submitNameMobileConflict,
  }
})

