<template>
  <div class="maintenance-container">
    <!-- 头部 -->
    <!-- <div class="header">
      <h1 class="title">维保记录</h1>
      <div v-if="customerStore.profile" class="customer-id">
        客户ID: {{ customerStore.profile.id }}
      </div>
    </div> -->

    <!-- 加载状态 -->
    <van-loading
      v-if="loading"
      type="spinner"
      vertical
      class="loading"
    >
      加载中...
    </van-loading>

    <!-- 内容区域 -->
    <div v-else class="content">
      <!-- 维保记录列表 -->
      <div
        v-for="record in maintenanceRecords"
        :key="record.id"
        class="maintenance-card"
      >
        <div class="card-header">
          <div class="record-title">{{ record.serviceType }}</div>
          <van-tag :type="getStatusType(record.status)" :size="'small' as any">
            {{ record.status }}
          </van-tag>
        </div>
        <div class="card-content">
          <div class="info-row">
            <span class="label">服务时间：</span>
            <span class="value">{{ record.serviceTime }}</span>
          </div>
          <div class="info-row">
            <span class="label">服务门店：</span>
            <span class="value">{{ record.serviceStore }}</span>
          </div>
          <div v-if="record.vehicleModel" class="info-row">
            <span class="label">车辆型号：</span>
            <span class="value">{{ record.vehicleModel }}</span>
          </div>
          <div v-if="record.amount" class="info-row">
            <span class="label">服务金额：</span>
            <span class="value amount">¥{{ formatAmount(record.amount) }}</span>
          </div>
          <div v-if="record.description" class="info-row">
            <span class="label">服务描述：</span>
            <span class="value">{{ record.description }}</span>
          </div>

          <!-- 保险信息 -->
          <div v-if="record.insurance" class="insurance-section">
            <div class="insurance-header">
              <span class="insurance-label">保险信息：</span>
            </div>
            <div class="insurance-content">
              <div class="info-row">
                <span class="label">保险类型：</span>
                <span class="value">{{ record.insurance.type }}</span>
              </div>
              <div v-if="record.insurance.company" class="info-row">
                <span class="label">保险公司：</span>
                <span class="value">{{ record.insurance.company }}</span>
              </div>
              <div v-if="record.insurance.policyNo" class="info-row">
                <span class="label">保单号：</span>
                <span class="value">{{ record.insurance.policyNo }}</span>
              </div>
              <div v-if="record.insurance.startDate || record.insurance.endDate" class="info-row">
                <span class="label">保险期限：</span>
                <span class="value">
                  {{ record.insurance.startDate || '未知' }} 至 {{ record.insurance.endDate || '未知' }}
                </span>
              </div>
              <div v-if="record.insurance.amount" class="info-row">
                <span class="label">保险金额：</span>
                <span class="value amount">¥{{ formatAmount(record.insurance.amount) }}</span>
              </div>
            </div>
          </div>

          <!-- 标签区域 -->
          <div class="tags-section">
            <div class="tags-header">
              <span class="tags-label">标签：</span>
              <van-button
                type="primary"
                size="mini"
                plain
                icon="plus"
                @click="openTagSelector(record.id)"
              >
                添加标签
              </van-button>
            </div>
            <div v-if="record.tags && record.tags.length > 0" class="selected-tags">
              <van-tag
                v-for="(tag, index) in record.tags"
                :key="index"
                :type="getTagType(tag)"
                :size="'small' as any"
                closeable
                @close="handleRemoveTag(record.id, tag)"
                class="tag-item"
              >
                {{ tag }}
              </van-tag>
            </div>
            <div v-else class="empty-tags">暂无标签</div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="maintenanceRecords.length === 0" class="empty-state">
        <van-empty description="暂无维保记录" />
      </div>
    </div>

    <!-- 标签选择器弹窗（多选） -->
    <van-popup
      v-model:show="showTagSelector"
      position="bottom"
      :style="{ height: '60%' }"
      round
    >
      <div class="tag-selector">
        <div class="popup-header">
          <h3>选择标签（可多选）</h3>
          <van-icon name="cross" @click="closeTagSelector" />
        </div>
        <div class="popup-content">
          <div
            v-for="tag in customerStore.tagPool"
            :key="tag.id"
            class="tag-option"
            :class="{ 'is-selected': isTagSelected(tag.name) }"
            @click="toggleTag(tag.name)"
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
        <div class="popup-footer">
          <van-button
            type="default"
            size="large"
            @click="closeTagSelector"
          >
            取消
          </van-button>
          <van-button
            type="primary"
            size="large"
            :loading="savingTags"
            @click="handleSaveTags"
          >
            确定
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCustomerStore } from '@/stores/customer'
import { showToast, showLoadingToast, closeToast } from 'vant'

const customerStore = useCustomerStore()
const showTagSelector = ref(false)
const currentRecordId = ref<string | null>(null)
const selectedTags = ref<string[]>([])
const savingTags = ref(false)
const loading = ref(false)

// 维保记录列表
const maintenanceRecords = computed(() => {
  return customerStore.maintenanceRecords || []
})

// 打开标签选择器
const openTagSelector = (recordId: string) => {
  currentRecordId.value = recordId
  const record = maintenanceRecords.value.find((r) => r.id === recordId)
  selectedTags.value = record?.tags ? [...record.tags] : []
  showTagSelector.value = true
}

// 关闭标签选择器
const closeTagSelector = () => {
  showTagSelector.value = false
  currentRecordId.value = null
  selectedTags.value = []
}

// 检查标签是否已选
const isTagSelected = (tagName: string) => {
  return selectedTags.value.includes(tagName)
}

// 切换标签选择
const toggleTag = (tagName: string) => {
  const index = selectedTags.value.indexOf(tagName)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tagName)
  }
}

// 保存标签
const handleSaveTags = async () => {
  if (!currentRecordId.value) return

  savingTags.value = true
  showLoadingToast({
    message: '保存中...',
    forbidClick: true,
  })

  try {
    await customerStore.updateMaintenanceTags(currentRecordId.value, selectedTags.value)
    showToast('保存成功')
    closeTagSelector()
  } catch (error: any) {
    showToast(error.message || '保存失败，请重试')
  } finally {
    savingTags.value = false
    closeToast()
  }
}

// 删除标签
const handleRemoveTag = async (recordId: string, tagName: string) => {
  const record = maintenanceRecords.value.find((r) => r.id === recordId)
  if (!record) return

  const newTags = record.tags.filter((t) => t !== tagName)
  
  showLoadingToast({
    message: '删除中...',
    forbidClick: true,
  })

  try {
    await customerStore.updateMaintenanceTags(recordId, newTags)
    showToast('删除成功')
  } catch (error: any) {
    showToast(error.message || '删除失败，请重试')
  } finally {
    closeToast()
  }
}

// 获取标签类型（用于颜色）
const getTagType = (tagName: string): any => {
  const tag = customerStore.tagPool.find((t) => t.name === tagName)
  if (!tag) return 'default'
  
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

// 获取状态类型
const getStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '已完成': 'success',
    '进行中': 'primary',
    '待处理': 'warning',
    '已取消': 'default',
  }
  return typeMap[status] || 'default'
}

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 初始化
onMounted(async () => {
  loading.value = true
  try {
    if (!customerStore.profile) {
      await customerStore.fetchProfile()
    }
    await customerStore.fetchMaintenanceRecords()
    await customerStore.fetchTagPool()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.maintenance-container {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 12px 0;
  max-width: 100%;
  box-sizing: border-box;
  padding-bottom: 20px; // 确保底部有足够空间
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

    .insurance-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #ebedf0;

      .insurance-header {
        margin-bottom: 12px;

        .insurance-label {
          font-size: 14px;
          color: #323233;
          font-weight: 500;
        }
      }

      .insurance-content {
        padding: 12px;
        background: #f7f8fa;
        border-radius: 8px;

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

            &.amount {
              color: #ee0a24;
              font-weight: 600;
            }
          }
        }
      }
    }

    .tags-section {
      margin-top: 16px;
      padding-top: 16px;
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
}

.empty-state {
  padding: 40px 0;
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
  flex-shrink: 0;

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

// 响应式适配
@media (max-width: 400px) {
  .maintenance-container {
    padding: 8px;
  }

  .header {
    padding: 12px;

    .title {
      font-size: 18px;
    }
  }
}
</style>

