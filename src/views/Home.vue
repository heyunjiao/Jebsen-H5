<template>
  <div class="home-container">
    <!-- 冲突提示（最顶部优先显示） -->
    <div
      v-if="customerStore.profile?.nameMobileConflict && customerStore.profile.nameMobileConflict.length > 0"
      class="conflict-alert-top"
    >
      <van-notice-bar
        left-icon="info-o"
        color="#ff976a"
        background="#fff4e8"
        scrollable
        :speed="50"
        @click="showConflictResolver = true"
        style="cursor: pointer;"
      >
        系统检测到【姓名+手机号高度相似】不一致。请确认最终保留值。
      </van-notice-bar>
    </div>

    <!-- 多源平台提示（最顶部优先显示） -->
    <div
      v-if="customerStore.profile?.isMultiSource && customerStore.platformSources.length > 0"
      class="multi-source-alert"
    >
      <van-notice-bar
        left-icon="info-o"
        color="#1989fa"
        background="#e8f4ff"
        scrollable
        :speed="50"
      >
        <span>该客户数据来自多个平台合并。</span>
        <span
          class="source-link"
          @click="showPlatformFlow = true"
        >
          查看溯源信息
        </span>
      </van-notice-bar>
    </div>

    <!-- 头部 -->
    <div class="header">
      <h1 class="title">{{ customerStore.profile?.name?.value || 'XX' }} 客户</h1>
      <div v-if="customerStore.profile" class="customer-id">
        客户ID: {{ customerStore.profile.id }}
      </div>
      <!-- 商机类型、总消费、标签、分群类型 -->
      <div v-if="customerStore.profile && !customerStore.loading" class="header-info">
        <!-- 商机类型（支持多条） -->
        <div v-if="opportunityList.length > 0" class="header-info-item">
          <van-icon name="star-o" class="header-info-icon opportunity-icon" />
          <span class="header-info-label">商机：</span>
          <div class="header-info-values">
            <span
              v-for="(opportunity, index) in opportunityList"
              :key="index"
              class="header-info-value"
            >
              {{ opportunity }}
              <span v-if="index < opportunityList.length - 1" class="separator">、</span>
            </span>
          </div>
        </div>
        <!-- 总消费 -->
        <div v-if="customerStore.profile.totalConsumption" class="header-info-item">
          <van-icon name="gold-coin-o" class="header-info-icon consumption-icon" />
          <span class="header-info-label">总消费：</span>
          <span class="header-info-value consumption-value">
            ¥{{ formatAmount(customerStore.profile.totalConsumption.value as number) }}
          </span>
        </div>
        <!-- 标签（支持多条） -->
        <div v-if="customerStore.profile.tags && customerStore.profile.tags.length > 0" class="header-info-item">
          <van-icon name="bookmark-o" class="header-info-icon tag-icon" />
          <span class="header-info-label">标签：</span>
          <div class="header-info-values">
            <span
              v-for="(tag, index) in customerStore.profile.tags"
              :key="index"
              class="header-info-value"
            >
              {{ tag }}
              <span v-if="index < customerStore.profile.tags.length - 1" class="separator">、</span>
            </span>
          </div>
        </div>
        <!-- 分群类型（支持多条） -->
        <div v-if="segmentList.length > 0" class="header-info-item">
          <van-icon name="friends-o" class="header-info-icon segment-icon" />
          <span class="header-info-label">分群：</span>
          <div class="header-info-values">
            <span
              v-for="(segment, index) in segmentList"
              :key="index"
              class="header-info-value"
            >
              {{ segment }}
              <span v-if="index < segmentList.length - 1" class="separator">、</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 预约信息卡片（提前显示，业务人员重点关注） -->
    <div v-if="customerStore.appointments && customerStore.appointments.length > 0 && !customerStore.loading" class="appointment-card-top">
      <div class="card-header">
        <div class="card-title">预约信息</div>
      </div>
      <div class="card-content">
        <div
          v-for="appointment in customerStore.appointments"
          :key="appointment.id"
          class="appointment-item"
        >
          <div class="appointment-header">
            <div class="appointment-type">{{ appointment.type }}</div>
            <van-tag
              :type="getAppointmentStatusType(appointment.status)"
              :size="'small' as any"
            >
              {{ appointment.status }}
            </van-tag>
          </div>
          <div class="appointment-info">
            <div class="info-row">
              <span class="label">预约时间：</span>
              <span class="value">{{ appointment.date }} {{ appointment.time }}</span>
            </div>
            <div class="info-row">
              <span class="label">预约门店：</span>
              <span class="value">{{ appointment.store }}</span>
            </div>
            <div v-if="appointment.vehicleModel" class="info-row">
              <span class="label">相关车型：</span>
              <span class="value">{{ appointment.vehicleModel }}</span>
            </div>
            <div v-if="appointment.description" class="info-row">
              <span class="label">预约描述：</span>
              <span class="value">{{ appointment.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>



    <!-- Tab 切换 -->
    <van-tabs v-model:active="activeTab" class="main-tabs">
      <van-tab title="客户画像" name="profile">
        <!-- 加载状态 -->
        <van-loading
          v-if="customerStore.loading"
          type="spinner"
          vertical
          class="loading"
        >
          加载中...
        </van-loading>

        <!-- 内容区域 -->
        <div v-else-if="customerStore.profile" class="content">
      <!-- 电话号码管理卡片（重要，提前显示） -->
      <div v-if="customerStore.profile?.mobile && 'items' in customerStore.profile.mobile" class="info-card mobile-manager-card">
        <div class="card-header">
          <div class="card-title">电话号码管理</div>
          <van-button
            type="primary"
            size="mini"
            plain
            icon="setting"
            @click="showMobileManager = true"
          >
            管理
          </van-button>
        </div>
        <div class="card-content">
          <div class="mobile-preview">
            <div
              v-for="item in (customerStore.profile.mobile as MobileData).items"
              :key="item.id"
              class="mobile-preview-item"
              :class="{ 'is-primary': item.isPrimary }"
            >
              <div class="mobile-info">
                <span class="mobile-number">{{ item.mobile }}</span>
                <van-tag v-if="item.isPrimary" type="primary" :size="'small' as any">主号</van-tag>
                <van-tag v-if="item.relationTagName" type="default" :size="'small' as any">{{ item.relationTagName }}</van-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 基础信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <div class="card-title">基础信息</div>
          <van-button
            type="primary"
            size="mini"
            plain
            icon="edit"
            @click="handleOpenBasicInfoEditor"
          >
            编辑
          </van-button>
        </div>
        <div class="card-content">
          <van-cell title="姓名" :value="String(customerStore.profile.name.value)" />
          <van-cell title="年龄" :value="String(customerStore.profile.age.value)" />
          <van-cell
            v-if="!('items' in customerStore.profile.mobile)"
            title="手机号"
            :value="String(customerStore.profile.mobile.value)"
          />
          <van-cell title="性别" :value="String(customerStore.profile.gender.value)" />
          <van-cell title="城市" :value="String(customerStore.profile.city.value)" />
          <van-cell
            v-if="customerStore.profile?.customerType"
            title="客户类型"
            :value="String(customerStore.profile.customerType.value)"
          />
        </div>
      </div>

      <!-- 业务信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <div class="card-title">业务信息</div>
        </div>
        <div class="card-content">
          <!-- 意向车型（支持标签） -->
          <div class="preferred-car-field">
            <van-cell title="意向车型" :value="customerStore.profile.preferredCarModel.value" />
            <div class="preferred-car-tags">
              <div class="tags-header">
                <span class="tags-label">标签：</span>
                <van-button
                  type="primary"
                  size="mini"
                  plain
                  icon="plus"
                  @click="openPreferredCarTagSelector"
                >
                  添加标签
                </van-button>
              </div>
              <div v-if="preferredCarTags.length > 0" class="selected-tags">
                <van-tag
                  v-for="(tag, index) in preferredCarTags"
                  :key="index"
                  :type="getTagType(tag)"
                  :size="'small' as any"
                  closeable
                  @close="handleRemovePreferredCarTag(tag)"
                  class="tag-item"
                >
                  {{ tag }}
                </van-tag>
              </div>
              <div v-else class="empty-tags">暂无标签</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签卡片 -->
      <div class="info-card">
        <div class="card-header">
          <div class="card-title">客户标签</div>
        </div>
        <div class="card-content">
          <div class="tags-section">
            <!-- 已选标签 -->
            <div v-if="customerStore.profile.tags.length > 0" class="selected-tags">
              <van-tag
                v-for="(tag, index) in customerStore.profile.tags"
                :key="index"
                :type="getTagType(tag)"
                size="medium"
                closeable
                @close="handleRemoveTag(tag)"
                class="tag-item"
              >
                {{ tag }}
              </van-tag>
            </div>
            <div v-else class="empty-tags">暂无标签</div>

            <!-- 添加标签按钮 -->
            <van-button
              type="primary"
              size="small"
              plain
              icon="plus"
              @click="showTagSelector = true"
              class="add-tag-btn"
            >
              添加标签
            </van-button>
          </div>
        </div>
      </div>
        </div>
      </van-tab>

      <!-- 交易记录 Tab -->
      <van-tab title="交易" name="transactions">
        <div class="tab-content">
          <div
            v-for="transaction in customerStore.transactions"
            :key="transaction.id"
            class="maintenance-card"
          >
            <div class="card-header">
              <div class="record-title">{{ transaction.productName }}</div>
              <van-tag
                :type="getTransactionStatusType(transaction.status)"
                :size="'small' as any"
              >
                {{ transaction.status }}
              </van-tag>
            </div>
            <div class="card-content">
              <div class="info-row">
                <span class="label">订单号：</span>
                <span class="value">{{ transaction.orderNo }}</span>
              </div>
              <div class="info-row">
                <span class="label">交易金额：</span>
                <span class="value amount">¥{{ formatAmount(transaction.amount) }}</span>
              </div>
              <div class="info-row">
                <span class="label">交易时间：</span>
                <span class="value">{{ transaction.transactionTime }}</span>
              </div>
              <div v-if="transaction.source" class="info-row">
                <span class="label">来源：</span>
                <span class="value">{{ transaction.source }}</span>
              </div>
            </div>
          </div>
          <div v-if="!customerStore.transactions || customerStore.transactions.length === 0" class="empty-state">
            <van-empty description="暂无交易记录" />
          </div>
        </div>
      </van-tab>

      <!-- 车辆关联 Tab -->
      <van-tab title="车辆" name="vehicles">
        <div class="tab-content">
          <div
            v-for="vehicle in customerStore.vehicles"
            :key="vehicle.id"
            class="maintenance-card"
          >
            <div class="card-header">
              <div class="record-title">{{ vehicle.vehicleModel }}</div>
              <van-tag
                :type="getVehicleStatusType(vehicle.status)"
                :size="'small' as any"
              >
                {{ vehicle.status }}
              </van-tag>
            </div>
            <div class="card-content">
              <div v-if="vehicle.licensePlate" class="info-row">
                <span class="label">车牌号：</span>
                <span class="value">{{ vehicle.licensePlate }}</span>
              </div>
              <div v-if="vehicle.vin" class="info-row">
                <span class="label">车架号：</span>
                <span class="value">{{ vehicle.vin }}</span>
              </div>
              <div v-if="vehicle.purchaseDate" class="info-row">
                <span class="label">购买日期：</span>
                <span class="value">{{ vehicle.purchaseDate }}</span>
              </div>
              <div v-if="vehicle.source" class="info-row">
                <span class="label">来源：</span>
                <span class="value">{{ vehicle.source }}</span>
              </div>
            </div>
          </div>
          <div v-if="!customerStore.vehicles || customerStore.vehicles.length === 0" class="empty-state">
            <van-empty description="暂无车辆关联" />
          </div>
        </div>
      </van-tab>

      <!-- 资产中心 Tab -->
      <van-tab title="资产" name="assets">
        <div class="tab-content">
          <div
            v-for="asset in customerStore.assets"
            :key="asset.id"
            class="maintenance-card"
          >
            <div class="card-header">
              <div class="record-title">{{ asset.name }}</div>
              <van-tag
                :type="getAssetStatusType(asset.status)"
                :size="'small' as any"
              >
                {{ asset.status }}
              </van-tag>
            </div>
            <div class="card-content">
              <div class="info-row">
                <span class="label">类型：</span>
                <span class="value">{{ asset.type === 'coupon' ? '优惠券' : '代金券' }}</span>
              </div>
              <div v-if="asset.amount" class="info-row">
                <span class="label">面额：</span>
                <span class="value amount">¥{{ formatAmount(asset.amount) }}</span>
              </div>
              <div v-if="asset.discount" class="info-row">
                <span class="label">折扣：</span>
                <span class="value">{{ (asset.discount * 10).toFixed(1) }}折</span>
              </div>
              <div class="info-row">
                <span class="label">有效期：</span>
                <span class="value">{{ asset.validFrom }} 至 {{ asset.validTo }}</span>
              </div>
              <div v-if="asset.source" class="info-row">
                <span class="label">来源：</span>
                <span class="value">{{ asset.source }}</span>
              </div>
            </div>
          </div>
          <div v-if="!customerStore.assets || customerStore.assets.length === 0" class="empty-state">
            <van-empty description="暂无优惠券记录" />
          </div>
        </div>
      </van-tab>

      <van-tab title="维保记录" name="maintenance">
        <Maintenance />
      </van-tab>
    </van-tabs>

    <!-- 客户标签选择器弹窗 -->
    <van-popup
      v-model:show="showTagSelector"
      position="bottom"
      :style="{ height: '60%' }"
      round
    >
      <div class="tag-selector">
        <div class="popup-header">
          <h3>选择标签</h3>
          <van-icon name="cross" @click="showTagSelector = false" />
        </div>
        <div class="popup-content">
          <div
            v-for="tag in availableTags"
            :key="tag.id"
            class="tag-option"
            @click="handleAddTag(tag.id)"
          >
            <van-tag
              :type="getTagType(tag.name)"
              size="medium"
              :style="{ backgroundColor: tag.color }"
            >
              {{ tag.name }}
            </van-tag>
            <van-icon
              v-if="isTagSelected(tag.name)"
              name="success"
              color="#52c41a"
            />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 用户偏好标签选择器弹窗（多选） -->
    <van-popup
      v-model:show="showPreferredCarTagSelector"
      position="bottom"
      :style="{ height: '60%' }"
      round
    >
      <div class="tag-selector">
        <div class="popup-header">
          <h3>选择标签（可多选）</h3>
          <van-icon name="cross" @click="closePreferredCarTagSelector" />
        </div>
        <div class="popup-content">
          <div
            v-for="tag in customerStore.tagPool"
            :key="tag.id"
            class="tag-option"
            :class="{ 'is-selected': isPreferredCarTagSelected(tag.name) }"
            @click="togglePreferredCarTag(tag.name)"
          >
            <van-tag
              :type="getTagType(tag.name)"
              size="medium"
              :style="{ backgroundColor: tag.color }"
            >
              {{ tag.name }}
            </van-tag>
            <van-icon
              v-if="isPreferredCarTagSelected(tag.name)"
              name="success"
              color="#52c41a"
            />
          </div>
        </div>
        <div class="popup-footer">
          <van-button
            type="default"
            size="large"
            @click="closePreferredCarTagSelector"
          >
            取消
          </van-button>
          <van-button
            type="primary"
            size="large"
            :loading="savingPreferredCarTags"
            @click="handleSavePreferredCarTags"
          >
            确定
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 冲突处理弹窗 -->
    <ConflictResolver
      v-if="customerStore.profile?.nameMobileConflict"
      v-model:show="showConflictResolver"
      :conflicts="customerStore.profile.nameMobileConflict"
      @submitted="handleConflictSubmitted"
    />

    <!-- 平台溯源流程图 -->
    <PlatformFlow
      v-model:show="showPlatformFlow"
      :sources="customerStore.platformSources"
      :customer-id="customerStore.profile?.id"
    />

    <!-- 电话号码管理弹窗 -->
    <MobileEditor
      v-if="customerStore.profile?.mobile && 'items' in customerStore.profile.mobile"
      v-model="showMobileManager"
      :mobile-data="customerStore.profile.mobile as MobileData"
      @update="handleMobileUpdate"
    />

    <!-- 基础信息编辑弹窗 -->
    <van-popup
      v-model:show="showBasicInfoEditor"
      position="bottom"
      :style="{ height: '70%' }"
      round
      lock-scroll
    >
      <div class="basic-info-editor">
        <div class="popup-header">
          <h3>编辑基础信息</h3>
          <van-icon name="cross" @click="showBasicInfoEditor = false" />
        </div>
        <div class="popup-content">
          <van-form ref="basicInfoFormRef" @submit="handleSaveBasicInfo">
            <van-field
              v-model="basicInfoForm.name"
              name="name"
              label="姓名"
              placeholder="请输入姓名"
              clearable
            />
            <van-field
              v-model="basicInfoForm.age"
              name="age"
              label="年龄"
              type="number"
              placeholder="请输入年龄"
              clearable
            />
            <van-field
              v-if="!('items' in customerStore.profile.mobile)"
              v-model="basicInfoForm.mobile"
              name="mobile"
              label="手机号"
              placeholder="请输入11位手机号"
              :rules="mobileRules"
              clearable
            />
            <van-field
              v-model="basicInfoForm.gender"
              name="gender"
              label="性别"
              placeholder="请输入性别"
              clearable
            />
            <van-field
              v-model="basicInfoForm.city"
              name="city"
              label="城市"
              placeholder="请输入城市"
              clearable
            />
            <van-field
              v-if="customerStore.profile?.customerType"
              v-model="basicInfoForm.customerType"
              name="customerType"
              label="客户类型"
              placeholder="请输入客户类型"
              clearable
            />
            <van-field
              v-model="basicInfoForm.reason"
              name="reason"
              label="更改理由"
              type="textarea"
              placeholder="请输入更改理由（必填）"
              rows="3"
              maxlength="200"
              show-word-limit
              :rules="[{ required: true, message: '请输入更改理由' }]"
            />
            <div class="edit-actions">
              <van-button
                type="default"
                size="large"
                native-type="button"
                @click="showBasicInfoEditor = false"
              >
                取消
              </van-button>
              <van-button
                type="primary"
                size="large"
                native-type="submit"
                :loading="savingBasicInfo"
                :disabled="savingBasicInfo"
              >
                提交
              </van-button>
            </div>
          </van-form>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCustomerStore } from '@/stores/customer'
import C360Field from '@/components/C360Field.vue'
import Maintenance from '@/views/Maintenance.vue'
import ConflictResolver from '@/components/business/ConflictResolver.vue'
import PlatformFlow from '@/components/business/PlatformFlow.vue'
import MobileEditor from '@/components/business/MobileEditor.vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { customerApi } from '@/api/customer'
import type { TagPool, MobileData } from '@/api/customer'

const customerStore = useCustomerStore()
const activeTab = ref('profile')
const showTagSelector = ref(false)
const showPreferredCarTagSelector = ref(false)
const selectedPreferredCarTags = ref<string[]>([])
const savingPreferredCarTags = ref(false)
const showConflictResolver = ref(false)
const showPlatformFlow = ref(false)
const showMobileManager = ref(false)
const showBasicInfoEditor = ref(false)
const savingBasicInfo = ref(false)
const basicInfoFormRef = ref()
const basicInfoForm = ref({
  name: '',
  age: '',
  mobile: '',
  gender: '',
  city: '',
  customerType: '',
  reason: '',
})

const mobileRules = [
  { required: true, message: '请输入手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
]

// 商机列表（支持多条，从 sources 中提取或使用 value）
const opportunityList = computed(() => {
  const opportunityType = customerStore.profile?.opportunityType
  if (!opportunityType) return []
  
  // 如果有 sources，提取所有不同的值
  if (opportunityType.sources && opportunityType.sources.length > 0) {
    const values = opportunityType.sources.map(s => String(s.value))
    // 去重并保持顺序
    return Array.from(new Set(values))
  }
  
  // 否则使用主值
  return opportunityType.value ? [String(opportunityType.value)] : []
})

// 分群列表（支持多条，从 sources 中提取或使用 value）
const segmentList = computed(() => {
  const segmentType = customerStore.profile?.segmentType
  if (!segmentType) return []
  
  // 如果有 sources，提取所有不同的值
  if (segmentType.sources && segmentType.sources.length > 0) {
    const values = segmentType.sources.map(s => String(s.value))
    // 去重并保持顺序
    return Array.from(new Set(values))
  }
  
  // 否则使用主值
  return segmentType.value ? [String(segmentType.value)] : []
})

// 可用标签（排除已选标签）
const availableTags = computed(() => {
  const selectedTags = customerStore.profile?.tags || []
  return customerStore.tagPool.filter(
    (tag) => !selectedTags.includes(tag.name)
  )
})

// 检查标签是否已选
const isTagSelected = (tagName: string) => {
  return customerStore.profile?.tags.includes(tagName) || false
}

// 获取标签类型（用于颜色）
const getTagType = (tagName: string): any => {
  const tag = customerStore.tagPool.find((t) => t.name === tagName)
  if (!tag) return 'default'
  
  // 根据标签名称映射类型
  const typeMap: Record<string, any> = {
    '战败客户': 'danger',
    '高意向': 'success',
    '置换需求': 'primary',
    '首购客户': 'primary',
    'VIP客户': 'warning',
    '潜在客户': 'default',
    '已成交': 'success',
    '流失客户': 'default',
  }
  
  return typeMap[tagName] || 'default'
}

// 处理字段更新
const handleFieldUpdate = (data: { field: string; value: string | number }) => {
  if (customerStore.profile) {
    // 字段已通过 API 更新，这里只需要更新本地状态（如果需要）
    console.log('字段已更新:', data)
  }
}

// 添加标签
const handleAddTag = async (tagId: string) => {
  await customerStore.addTag(tagId)
  // 如果标签已添加，可以关闭弹窗
  if (customerStore.profile?.tags.includes(
    customerStore.tagPool.find((t) => t.id === tagId)?.name || ''
  )) {
    showTagSelector.value = false
  }
}

// 删除标签
const handleRemoveTag = async (tagName: string) => {
  await customerStore.removeTag(tagName)
}

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 格式化总消费字段（将数字转换为带货币符号的字符串）
const formattedTotalConsumption = computed(() => {
  if (!customerStore.profile?.totalConsumption) return null
  const consumption = customerStore.profile.totalConsumption
  return {
    ...consumption,
    value: `¥${formatAmount(consumption.value as number)}`,
  }
})

// 获取交易状态类型
const getTransactionStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '已完成': 'success',
    '待支付': 'warning',
    '已取消': 'default',
  }
  return typeMap[status] || 'default'
}

// 获取车辆状态类型
const getVehicleStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '已售': 'success',
    '在售': 'primary',
    '维修中': 'warning',
  }
  return typeMap[status] || 'default'
}

// 获取资产状态类型
const getAssetStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '未使用': 'success',
    '已使用': 'default',
    '已过期': 'danger',
  }
  return typeMap[status] || 'default'
}

// 用户偏好标签相关
const preferredCarTags = computed(() => {
  return customerStore.profile?.preferredCarModel?.tags || []
})

const openPreferredCarTagSelector = () => {
  selectedPreferredCarTags.value = [...preferredCarTags.value]
  showPreferredCarTagSelector.value = true
}

const closePreferredCarTagSelector = () => {
  showPreferredCarTagSelector.value = false
  selectedPreferredCarTags.value = []
}

const isPreferredCarTagSelected = (tagName: string) => {
  return selectedPreferredCarTags.value.includes(tagName)
}

const togglePreferredCarTag = (tagName: string) => {
  const index = selectedPreferredCarTags.value.indexOf(tagName)
  if (index > -1) {
    selectedPreferredCarTags.value.splice(index, 1)
  } else {
    selectedPreferredCarTags.value.push(tagName)
  }
}

const handleSavePreferredCarTags = async () => {
  savingPreferredCarTags.value = true
  showLoadingToast({
    message: '保存中...',
    forbidClick: true,
  })

  try {
    await customerStore.updatePreferredCarModelTags(selectedPreferredCarTags.value)
    closePreferredCarTagSelector()
  } catch (error: any) {
    showToast(error.message || '保存失败，请重试')
  } finally {
    savingPreferredCarTags.value = false
    closeToast()
  }
}

const handleRemovePreferredCarTag = async (tagName: string) => {
  const newTags = preferredCarTags.value.filter((t) => t !== tagName)
  
  showLoadingToast({
    message: '删除中...',
    forbidClick: true,
  })

  try {
    // 传递 false 参数，避免 store 中显示 toast（由这里统一处理）
    await customerStore.updatePreferredCarModelTags(newTags, false)
    showToast('删除成功')
  } catch (error: any) {
    showToast(error.message || '删除失败，请重试')
  } finally {
    closeToast()
  }
}

// 获取预约状态类型
const getAppointmentStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '待确认': 'warning',
    '已确认': 'primary',
    '已完成': 'success',
    '已取消': 'default',
  }
  return typeMap[status] || 'default'
}

// 处理冲突提交完成
const handleConflictSubmitted = () => {
  // 可以在这里刷新数据或做其他处理
  console.log('冲突处理已提交')
}

// 处理电话号码更新
const handleMobileUpdate = async (data: MobileData) => {
  // 更新本地数据
  if (customerStore.profile && 'items' in customerStore.profile.mobile) {
    Object.assign(customerStore.profile.mobile as MobileData, data)
  }
  // 可以在这里刷新数据
  await customerStore.fetchProfile()
}

// 打开基础信息编辑弹窗
const openBasicInfoEditor = () => {
  if (customerStore.profile) {
    basicInfoForm.value = {
      name: String(customerStore.profile.name.value || ''),
      age: String(customerStore.profile.age.value || ''),
      mobile: !('items' in customerStore.profile.mobile) ? String(customerStore.profile.mobile.value || '') : '',
      gender: String(customerStore.profile.gender.value || ''),
      city: String(customerStore.profile.city.value || ''),
      customerType: customerStore.profile.customerType ? String(customerStore.profile.customerType.value || '') : '',
      reason: '',
    }
  }
}

// 提交基础信息修改
const handleSaveBasicInfo = async () => {
  console.log('[Home] 开始提交基础信息', {
    profile: customerStore.profile,
    form: basicInfoForm.value,
  })

  if (!customerStore.profile) {
    console.warn('[Home] customerStore.profile 不存在')
    showToast('客户信息不存在')
    return
  }

  // 验证更改理由
  if (!basicInfoForm.value.reason || !basicInfoForm.value.reason.trim()) {
    console.warn('[Home] 更改理由为空')
    showToast('请输入更改理由')
    return
  }

  // 手机号格式验证
  if (basicInfoForm.value.mobile && !/^1[3-9]\d{9}$/.test(basicInfoForm.value.mobile)) {
    console.warn('[Home] 手机号格式不正确')
    showToast('手机号格式不正确')
    return
  }

  // 先检查是否有字段变更（在显示 loading 之前）
  const updateData: Record<string, any> = {}
  
  // 收集所有变更的字段
  if (basicInfoForm.value.name !== String(customerStore.profile.name.value || '')) {
    updateData.name = basicInfoForm.value.name
  }
  if (basicInfoForm.value.age !== String(customerStore.profile.age.value || '')) {
    updateData.age = basicInfoForm.value.age ? Number(basicInfoForm.value.age) : null
  }
  if (!('items' in customerStore.profile.mobile) && basicInfoForm.value.mobile !== String(customerStore.profile.mobile.value || '')) {
    updateData.mobile = basicInfoForm.value.mobile
  }
  if (basicInfoForm.value.gender !== String(customerStore.profile.gender.value || '')) {
    updateData.gender = basicInfoForm.value.gender
  }
  if (basicInfoForm.value.city !== String(customerStore.profile.city.value || '')) {
    updateData.city = basicInfoForm.value.city
  }
  if (customerStore.profile.customerType && basicInfoForm.value.customerType !== String(customerStore.profile.customerType.value || '')) {
    updateData.customerType = basicInfoForm.value.customerType
  }

  // 检查是否有需要更新的字段（除了reason）
  const fieldsToUpdate = Object.keys(updateData).filter(key => key !== 'reason')
  if (fieldsToUpdate.length === 0) {
    console.warn('[Home] 没有需要更新的字段')
    showToast('请至少修改一个字段后再提交')
    return
  }

  console.log('[Home] 验证通过，开始提交')

  savingBasicInfo.value = true
  showLoadingToast({
    message: '提交中...',
    forbidClick: true,
  })

  try {

    // 添加更改理由（必填）
    updateData.reason = basicInfoForm.value.reason.trim()

    console.log('[Home] 准备提交的数据:', updateData)
    console.log('[Home] 调用 API updateBasicInfo')
    const res = await customerApi.updateBasicInfo(updateData as { reason: string } & typeof updateData)
    
    console.log('[Home] API 响应:', res)
    
    if (res.code === 200) {
      showToast('提交成功，等待后台审核')
      showBasicInfoEditor.value = false
      // 重置表单
      basicInfoForm.value.reason = ''
      // 不刷新数据，因为需要等待审核
    } else {
      showToast(res.message || '提交失败，请重试')
    }
  } catch (error: any) {
    console.error('[Home] 提交失败:', error)
    showToast(error.message || '提交失败，请重试')
  } finally {
    savingBasicInfo.value = false
    closeToast()
  }
}

// 打开基础信息编辑弹窗（处理函数）
const handleOpenBasicInfoEditor = () => {
  openBasicInfoEditor()
  showBasicInfoEditor.value = true
}

// 初始化
onMounted(async () => {
  console.log('Home 组件 mounted，开始加载数据')
  await customerStore.fetchProfile()
  await customerStore.fetchTagPool()
  // 并行加载交易记录、车辆关联、资产中心、预约信息、平台溯源
  await Promise.all([
    customerStore.fetchTransactions(),
    customerStore.fetchVehicles(),
    customerStore.fetchAssets(),
    customerStore.fetchAppointments(),
    customerStore.fetchPlatformSources(),
  ])
  console.log('数据加载完成，profile:', customerStore.profile)
  console.log('数据加载完成，customerType:', customerStore.profile?.customerType)
  console.log('数据加载完成，opportunityType:', customerStore.profile?.opportunityType)
  console.log('数据加载完成，segmentType:', customerStore.profile?.segmentType)
  console.log('数据加载完成，totalConsumption:', customerStore.profile?.totalConsumption)
  console.log('数据加载完成，tagPool:', customerStore.tagPool)
  console.log('数据加载完成，transactions:', customerStore.transactions)
  console.log('数据加载完成，vehicles:', customerStore.vehicles)
  console.log('数据加载完成，assets:', customerStore.assets)
  console.log('数据加载完成，appointments:', customerStore.appointments)
  console.log('数据加载完成，platformSources:', customerStore.platformSources)
})
</script>

<style scoped lang="scss">
.home-container {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 12px;
  max-width: 100%;
  box-sizing: border-box;
  padding-bottom: 20px; // 确保底部有足够空间
  overflow-y: auto; // 允许滚动
}

.main-tabs {
  :deep(.van-tabs__content) {
    padding-bottom: 20px; // 确保内容底部有足够空间
  }
}

.header {
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 12px;
  color: white;

  .title {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
  }

  .customer-id {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 8px;
  }

  .header-info {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: column;
    gap: 8px;

    .header-info-item {
      display: flex;
      align-items: flex-start;
      font-size: 14px;
      line-height: 1.5;

      .header-info-icon {
        font-size: 16px;
        margin-right: 6px;
        margin-top: 2px;
        flex-shrink: 0;
        opacity: 0.9;

        &.opportunity-icon {
          color: #ffd700;
        }

        &.consumption-icon {
          color: #ffeb3b;
        }

        &.tag-icon {
          color: #4fc3f7;
        }

        &.segment-icon {
          color: #81c784;
        }
      }

      .header-info-label {
        font-weight: 500;
        opacity: 0.95;
        flex-shrink: 0;
        margin-right: 4px;
      }

      .header-info-values {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
      }

      .header-info-value {
        opacity: 0.95;

        &.consumption-value {
          font-weight: 600;
          color: #ffeb3b;
        }
      }

      .separator {
        margin: 0 2px;
        opacity: 0.8;
      }
    }
  }
}

.appointment-card-top {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  border: 2px solid #1989fa;

  .card-header {
    padding: 16px;
    border-bottom: 1px solid #ebedf0;
    background: linear-gradient(135deg, #e8f4ff 0%, #d0e8ff 100%);
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #1989fa;
  }

  .card-content {
    padding: 0;
  }
}

.conflict-alert-top {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(255, 152, 106, 0.2);

  :deep(.van-notice-bar) {
    padding: 12px 16px;
    transition: opacity 0.2s;

    &:active {
      opacity: 0.8;
    }
  }
}

.multi-source-alert {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.2);

  :deep(.van-notice-bar) {
    padding: 12px 16px;
    
    .van-notice-bar__content {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
    }
  }

  .source-link {
    color: #1989fa;
    text-decoration: underline;
    cursor: pointer;
    margin-left: 4px;
    white-space: nowrap;
    flex-shrink: 0;
  }
}

.important-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-bottom: 16px;

  .info-item {
    background: white;
    border-radius: 10px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
    border: 1px solid rgba(0, 0, 0, 0.04);

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transform: translateY(-1px);
    }

    .info-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .info-content {
      flex: 1;
      min-width: 0;

      .info-label {
        font-size: 11px;
        color: #969799;
        margin-bottom: 4px;
        font-weight: 400;
      }

      .info-value {
        font-size: 14px;
        font-weight: 600;
        color: #323233;
        word-break: break-all;
        line-height: 1.4;

        &.consumption-value {
          font-size: 15px;
          font-weight: 700;
          color: #ee0a24;
        }
      }
    }

    &.opportunity-type {
      .info-icon {
        background: linear-gradient(135deg, #e8f8f0 0%, #d0f0e0 100%);
        color: #07c160;
      }
    }

    &.segment-type {
      .info-icon {
        background: linear-gradient(135deg, #fff4e8 0%, #ffe8d0 100%);
        color: #ff976a;
      }
    }

    &.consumption-type {
      .info-icon {
        background: linear-gradient(135deg, #ffe8e8 0%, #ffd0d0 100%);
        color: #ee0a24;
      }
    }
  }
}

.loading {
  padding: 40px 0;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-top: 12px;

  &.mobile-manager-card {
    border: 2px solid #1989fa;
    
    .card-header {
      background: linear-gradient(135deg, #e8f4ff 0%, #d0e8ff 100%);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .card-header {
    padding: 16px;
    border-bottom: 1px solid #ebedf0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
  }

  .card-content {
    padding: 0;
  }
}

.basic-info-editor {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebedf0;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #323233;
    }

    .van-icon {
      font-size: 20px;
      color: #969799;
      cursor: pointer;
    }
  }

  .popup-content {
    flex: 1;
    overflow-y: auto;
  }

  .edit-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #ebedf0;

    .van-button {
      flex: 1;
    }
  }
}

.mobile-preview {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .mobile-preview-item {
    padding: 12px;
    background: #f7f8fa;
    border-radius: 8px;
    border: 1px solid #ebedf0;

    &.is-primary {
      background: #e8f4ff;
      border-color: #1989fa;
    }

    .mobile-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .mobile-number {
        font-size: 16px;
        font-weight: 500;
        color: #323233;
        flex: 1;
      }
    }
  }
}

.tags-section {
  padding: 16px;

  .selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .tag-item {
    margin: 0;
  }

  .empty-tags {
    color: #969799;
    font-size: 14px;
    margin-bottom: 12px;
  }

  .add-tag-btn {
    width: 100%;
  }
}

.preferred-car-field {
  .preferred-car-tags {
    padding: 12px 16px;
    border-top: 1px solid #ebedf0;

    .tags-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .tags-label {
        font-size: 14px;
        color: #323233;
        font-weight: 500;
      }
    }

    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag-item {
      margin: 0;
    }

    .empty-tags {
      color: #969799;
      font-size: 14px;
    }
  }
}

.tab-content {
  min-height: 200px;
  background: #f7f8fa;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .maintenance-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .card-header {
      padding: 16px;
      border-bottom: 1px solid #ebedf0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .record-title {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
      }
    }

    .card-content {
      padding: 16px;

      .info-row {
        display: flex;
        margin-bottom: 12px;
        font-size: 14px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          color: #969799;
          min-width: 80px;
          flex-shrink: 0;
        }

        .value {
          color: #323233;
          flex: 1;
          word-break: break-all;

          &.amount {
            color: #ee0a24;
            font-weight: 600;
          }
        }
      }
    }
  }
  
  .empty-state {
    padding: 40px 0;
    text-align: center;
  }
}

.list-section {
  padding: 16px;

  .list-item {
    padding: 12px;
    background: #f7f8fa;
    border-radius: 8px;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .item-title {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
        flex: 1;
      }
    }

    .item-content {
      .item-row {
        display: flex;
        margin-bottom: 8px;
        font-size: 14px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          color: #969799;
          min-width: 70px;
          flex-shrink: 0;
        }

        .value {
          color: #323233;
          flex: 1;
          word-break: break-all;

          &.amount {
            color: #ee0a24;
            font-weight: 600;
          }
        }
      }
    }
  }
}

.tag-selector {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebedf0;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #323233;
  }

  .van-icon {
    font-size: 20px;
    color: #969799;
    cursor: pointer;
  }
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &.is-selected {
    background: #e8f4ff;
    border: 1px solid #1989fa;
  }

  &:active {
    background: #ebedf0;
  }
}

.popup-footer {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #ebedf0;
  flex-shrink: 0;

  .van-button {
    flex: 1;
  }
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

// 响应式适配（侧边栏宽度约 350px）
@media (max-width: 400px) {
  .home-container {
    padding: 8px;
  }

  .header {
    padding: 12px;

    .title {
      font-size: 18px;
    }

    .customer-id {
      font-size: 13px;
    }

    .header-info {
      margin-top: 10px;
      padding-top: 10px;
      gap: 6px;

      .header-info-item {
        font-size: 13px;
        line-height: 1.4;

        .header-info-icon {
          font-size: 14px;
          margin-right: 5px;
        }
      }
    }
  }

  .appointment-card-top {
    margin-bottom: 12px;

    .card-header {
      padding: 12px;
    }

    .card-title {
      font-size: 15px;
    }
  }

  .conflict-alert-top {
    :deep(.van-notice-bar) {
      padding: 10px 12px;
      font-size: 13px;
    }
  }

  .multi-source-alert {
    :deep(.van-notice-bar) {
      padding: 10px 12px;
      font-size: 13px;
    }
  }

  .important-info {
    grid-template-columns: 1fr;
    gap: 8px;

    .info-item {
      padding: 10px 12px;

      .info-icon {
        width: 32px;
        height: 32px;
        font-size: 16px;
      }

      .info-content {
        .info-label {
          font-size: 10px;
          margin-bottom: 3px;
        }

        .info-value {
          font-size: 13px;

          &.consumption-value {
            font-size: 14px;
          }
        }
      }
    }
  }

  .info-card {
    :deep(.van-card__header) {
      padding: 12px;
    }
  }

  .tags-section {
    padding: 12px;
  }
}

.appointment-item {
  padding: 16px;
  border-bottom: 1px solid #ebedf0;

  &:last-child {
    border-bottom: none;
  }

  .appointment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .appointment-type {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
    }
  }

  .appointment-info {
    .info-row {
      display: flex;
      margin-bottom: 8px;
      font-size: 14px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #969799;
        min-width: 80px;
        flex-shrink: 0;
      }

      .value {
        color: #323233;
        flex: 1;
        word-break: break-all;
      }
    }
  }
}
</style>

