<template>
  <div class="maintenance-container">
    <!-- 维保记录列表（使用 van-list 实现滚动加载） -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <!-- 维保记录卡片 -->
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
            <span class="label">服务类型：</span>
            <span class="value">{{ record.serviceType }}</span>
          </div>
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
          <div v-if="record.tags && record.tags.length > 0" class="info-row">
            <span class="label">标签：</span>
            <div class="tags">
              <van-tag
                v-for="(tag, index) in record.tags"
                :key="index"
                type="primary"
                :size="'small' as any"
                style="margin-right: 4px;"
              >
                {{ tag }}
              </van-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && maintenanceRecords.length === 0" class="empty-state">
        <van-empty description="暂无维保记录" />
      </div>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCustomerStore } from '@/stores/customer'

const customerStore = useCustomerStore()
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = ref(5) // 每页加载 5 条

// 维保记录列表
const maintenanceRecords = computed(() => {
  return customerStore.maintenanceRecords || []
})

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

// 滚动加载数据
const onLoad = async () => {
  try {
    if (!customerStore.profile) {
      await customerStore.fetchProfile()
    }
    
    // 加载维保记录（目前一次性加载，后续可以改为分页）
    if (maintenanceRecords.value.length === 0) {
      await customerStore.fetchMaintenanceRecords()
    }
    
    finished.value = true
  } catch (error) {
    console.error('加载维保记录失败:', error)
    finished.value = true
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(async () => {
  // 重置分页状态
  page.value = 1
  finished.value = false
})
</script>

<style scoped lang="scss">
.maintenance-container {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 4px; // 减少内边距，与首屏保持一致
  max-width: 100%;
  box-sizing: border-box;
  padding-bottom: 12px; // 减少底部空间
  
  // van-list 样式
  :deep(.van-list) {
    min-height: 100%;
  }
  
  :deep(.van-list__finished-text) {
    padding: 12px 0; // 减少内边距
    color: #969799;
    font-size: 12px; // 减小字体
    text-align: center;
  }
  
  :deep(.van-list__loading) {
    padding: 12px 0; // 减少内边距
    text-align: center;
  }
}

.maintenance-card {
  background: white;
  border-radius: 8px; // 与首屏保持一致
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06); // 减小阴影
  margin-bottom: 3px; // 减少间距，更紧凑

  .card-header {
    padding: 6px 10px; // 减少内边距
    border-bottom: 1px solid #ebedf0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .record-title {
      font-size: 12px; // 减小字体
      font-weight: 600;
      color: #323233;
    }
  }

  .card-content {
    padding: 6px 10px; // 减少内边距

    .info-row {
      display: flex;
      margin-bottom: 6px; // 减少间距
      font-size: 11px; // 减小字体
      line-height: 1.3; // 优化行高

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #969799;
        min-width: 75px; // 减少最小宽度
        flex-shrink: 0;
        font-size: 11px; // 减小字体
      }

      .value {
        color: #323233;
        flex: 1;
        word-break: break-all;
        font-size: 11px; // 减小字体

        &.amount {
          color: #ee0a24;
          font-weight: 600;
          font-size: 12px; // 减小字体
        }
      }
      
      .tags {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        gap: 3px; // 减少间距
      }
    }
  }
}

.empty-state {
  padding: 30px 0; // 减少内边距
}

// 响应式适配

</style>

