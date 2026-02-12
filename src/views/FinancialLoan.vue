<template>
  <div class="loan-container">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <div
        v-for="record in loanRecords"
        :key="record.id"
        class="loan-card"
      >
        <div class="card-header">
          <div class="record-title">{{ record.vehicleModel }}</div>
          <van-tag :type="getStatusType(record.status)" :size="'small' as any">
            {{ record.status }}
          </van-tag>
        </div>
        <div class="card-content">
          <div class="info-row">
            <span class="label">开始日期：</span>
            <span class="value">{{ record.startDate }}</span>
          </div>
          <div class="info-row">
            <span class="label">到期月数：</span>
            <span class="value">{{ record.expectedExpiryMonths }}个月</span>
          </div>
          <div class="info-row">
            <span class="label">贷款信息：</span>
            <span class="value">{{ record.loanInfo }}</span>
          </div>
          <div class="info-row">
            <span class="label">贷款银行：</span>
            <span class="value">{{ record.bank }}</span>
          </div>
          <div class="info-row">
            <span class="label">还款日：</span>
            <span class="value">每月 {{ record.repaymentDay }} 日</span>
          </div>
          <div class="info-row">
            <span class="label">起始-到月：</span>
            <span class="value">{{ record.period }}</span>
          </div>
        </div>
      </div>

      <div v-if="!loading && loanRecords.length === 0" class="empty-state">
        <van-empty :description="type === 'expiring' ? '暂无即将到期贷款' : '暂无金融贷款记录'" />
      </div>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCustomerStore } from '@/stores/customer'

const props = defineProps<{
  type?: 'all' | 'expiring'
}>()

const customerStore = useCustomerStore()
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = ref(5)

const loanRecords = computed(() => {
  if (props.type === 'expiring') {
    return customerStore.financialLoanRecords.filter(r => r.status === '即将到期')
  }
  return customerStore.financialLoanRecords
})

const getStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '正常': 'success',
    '即将到期': 'warning',
    '已结清': 'primary',
    '逾期': 'danger',
  }
  return typeMap[status] || 'default'
}

const onLoad = async () => {
  try {
    const hasMore = await customerStore.fetchFinancialLoanRecordsPage(
      page.value, 
      pageSize.value,
      customerStore.profile?.id
    )
    
    if (hasMore) {
      page.value++
    } else {
      finished.value = true
    }
  } catch (error) {
    console.error('加载贷款记录失败:', error)
    finished.value = true
  } finally {
    loading.value = false
  }
}

watch(() => props.type, () => {
  page.value = 1
  finished.value = false
  customerStore.clearFinancialLoanRecords()
  onLoad()
})

// 移除 onMounted 中的 clearFinancialLoanRecords，防止与 van-list 的 onLoad 竞争
onMounted(() => {
  // 可以在这里做一些初始化，但不要清空刚加载的数据
})
</script>

<style scoped lang="scss">
.loan-container {
  min-height: 200px;
  background: transparent;
  padding: 0;
  
  :deep(.van-list__finished-text) {
    padding: 12px 0;
    color: #969799;
    font-size: 12px;
    text-align: center;
  }
}

.loan-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  margin-bottom: 8px;

  .card-header {
    padding: 8px 12px;
    border-bottom: 1px solid #ebedf0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .record-title {
      font-size: 13px;
      font-weight: 600;
      color: #323233;
    }
  }

  .card-content {
    padding: 8px 12px;

    .info-row {
      display: flex;
      margin-bottom: 6px;
      font-size: 12px;
      line-height: 1.4;

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

.empty-state {
  padding: 30px 0;
}
</style>
