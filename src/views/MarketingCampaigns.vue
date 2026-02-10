<template>
  <div class="marketing-campaigns-container">
    <!-- 线下活动记录列表（使用 van-list 实现滚动加载） -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <!-- 线下活动记录卡片 -->
      <div
        v-for="campaign in marketingCampaigns"
        :key="campaign.id"
        class="campaign-card"
      >
        <div class="card-header">
          <div class="campaign-title">{{ campaign.campaignName }}</div>
          <van-tag :type="getStatusType(campaign.status)" :size="'small' as any">
            {{ campaign.status }}
          </van-tag>
        </div>
        <div class="card-content">
          <div class="info-row">
            <span class="label">活动编码：</span>
            <span class="value">{{ campaign.campaignCode }}</span>
          </div>
          <div class="info-row">
            <span class="label">活动名称：</span>
            <span class="value">{{ campaign.campaignName }}</span>
          </div>
          <div class="info-row">
            <span class="label">活动类型：</span>
            <span class="value">{{ campaign.campaignType }}</span>
          </div>
          <div class="info-row">
            <span class="label">活动时间：</span>
            <span class="value">{{ campaign.activityTime }}</span>
          </div>
          <div v-if="campaign.location" class="info-row">
            <span class="label">活动地点：</span>
            <span class="value">{{ campaign.location }}</span>
          </div>
          <div v-if="campaign.organizer" class="info-row">
            <span class="label">组织者：</span>
            <span class="value">{{ campaign.organizer }}</span>
          </div>
          <div v-if="campaign.uploader" class="info-row">
            <span class="label">上传人：</span>
            <span class="value">{{ campaign.uploader }}</span>
          </div>
          <div v-if="campaign.validExamples" class="info-row">
            <span class="label">有效例子：</span>
            <span class="value">{{ campaign.validExamples }}</span>
          </div>
          <div v-if="campaign.description" class="info-row">
            <span class="label">活动描述：</span>
            <span class="value">{{ campaign.description }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && marketingCampaigns.length === 0" class="empty-state">
        <van-empty description="暂无线下活动记录" />
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

// 线下活动记录列表
const marketingCampaigns = computed(() => {
  return customerStore.marketingCampaigns || []
})

// 获取状态类型
const getStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '已参加': 'success',
    '未参加': 'warning',
  }
  return typeMap[status] || 'warning'
}

// 滚动加载数据
const onLoad = async () => {
  try {
    loading.value = true
    
    if (!customerStore.profile) {
      await customerStore.fetchProfile()
    }
    
    const customerId = customerStore.profile?.id
    const hasMore = await customerStore.fetchMarketingCampaignsPage(page.value, pageSize.value, customerId)
    
    if (hasMore) {
      page.value++
    } else {
      finished.value = true
    }
  } catch (error) {
    console.error('加载线下活动记录失败:', error)
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
  customerStore.clearMarketingCampaigns()
})
</script>

<style scoped lang="scss">
.marketing-campaigns-container {
  min-height: 200px;
  background: transparent;
  padding: 0;
  max-width: 100%;
  box-sizing: border-box;
  
  // van-list 样式
  :deep(.van-list) {
    min-height: 100%;
  }
  
  :deep(.van-list__finished-text) {
    padding: 12px 0;
    color: #969799;
    font-size: 12px;
    text-align: center;
  }
  
  :deep(.van-list__loading) {
    padding: 12px 0;
    text-align: center;
  }
}

.campaign-card {
  background: white;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  margin-bottom: 8px;
  border: 1px solid var(--border-color);

  .card-header {
    padding: 6px 10px;
    border-bottom: 1px solid #ebedf0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .campaign-title {
      font-size: 12px;
      font-weight: 600;
      color: #323233;
      flex: 1;
      margin-right: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .card-content {
    padding: 6px 10px;

    .info-row {
      display: flex;
      margin-bottom: 6px;
      font-size: 11px;
      line-height: 1.3;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #969799;
        min-width: 75px;
        flex-shrink: 0;
        font-size: 11px;
      }

      .value {
        color: #323233;
        flex: 1;
        word-break: break-all;
        font-size: 11px;
      }
    }
  }
}

.empty-state {
  padding: 30px 0;
}
</style>

