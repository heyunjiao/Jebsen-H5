<template>
  <div class="insurance-container">
    <!-- 保险记录列表（使用 van-list 实现滚动加载） -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <!-- 保险记录卡片 -->
      <div
        v-for="record in insuranceRecords"
        :key="record.id"
        class="insurance-card"
      >
        <div class="card-header">
          <div class="record-title">{{ record.type }}</div>
          <van-tag :type="getStatusType(record.status)" :size="'small' as any">
            {{ record.status }}
          </van-tag>
        </div>
        <div class="card-content">
          <div class="info-row">
            <span class="label">保险类型：</span>
            <span class="value">{{ record.type }}</span>
          </div>
          <div v-if="record.company" class="info-row">
            <span class="label">保险公司：</span>
            <span class="value">{{ record.company }}</span>
          </div>
          <div v-if="record.policyNo" class="info-row">
            <span class="label">保单号：</span>
            <span class="value">{{ record.policyNo }}</span>
          </div>
          <div v-if="record.startDate || record.endDate" class="info-row">
            <span class="label">保险期限：</span>
            <span class="value">
              {{ record.startDate || '未知' }} 至 {{ record.endDate || '未知' }}
            </span>
          </div>
          <div v-if="record.purchaseDate" class="info-row">
            <span class="label">购买日期：</span>
            <span class="value">{{ record.purchaseDate }}</span>
          </div>
          <div class="info-row">
            <span class="label">保险金额：</span>
            <span class="value amount">¥{{ formatAmount(record.amount) }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && insuranceRecords.length === 0" class="empty-state">
        <van-empty description="暂无保险记录" />
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

// 保险记录列表
const insuranceRecords = computed(() => {
  return customerStore.insuranceRecords || []
})

// 获取状态类型
const getStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '已生效': 'success',
    '已过期': 'warning',
    '待续保': 'primary',
    '已退保': 'default',
    '生效中': 'success',
  }
  return typeMap[status] || 'default'
}

// 格式化金额（取整）
const formatAmount = (amount: number) => {
  return Math.round(amount).toLocaleString('zh-CN')
}

// 滚动加载数据
const onLoad = async () => {
  try {
    if (!customerStore.profile) {
      await customerStore.fetchProfile()
    }
    
    // 加载分页数据
    const hasMore = await customerStore.fetchInsuranceRecordsPage(page.value, pageSize.value)
    
    if (hasMore) {
      page.value++
    } else {
      finished.value = true
    }
  } catch (error) {
    console.error('加载保险记录失败:', error)
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
  // 清空已有数据，重新开始加载
  customerStore.clearInsuranceRecords()
})
</script>

<style scoped lang="scss">
.insurance-container {
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

.insurance-card {
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
    }
  }
}

.empty-state {
  padding: 30px 0; // 减少内边距
}

// 响应式适配
@media (max-width: 400px) {
  .insurance-container {
    padding: 8px;
  }
}
</style>



