<template>
  <van-popup
    :show="show"
    @update:show="(value: boolean) => emit('update:show', value)"
    position="bottom"
    :style="{ height: '80%' }"
    round
    :lock-scroll="true"
  >
    <div class="platform-flow">
      <div class="popup-header">
        <h3>平台溯源信息</h3>
        <van-icon name="cross" @click="close" />
      </div>
      <div class="popup-content">
        <!-- 顶部：OneID -->
        <div class="oneid-section">
          <div class="oneid-node">
            <div class="oneid-box">
              <div class="oneid-id">{{ oneIdDisplay }}</div>
            </div>
            <div class="oneid-label">OneID</div>
          </div>
          <div class="flow-arrow-down">
            <van-icon name="arrow-down" />
          </div>
        </div>

        <!-- 平台网格布局 -->
        <div class="platform-grid">
          <div
            v-for="(source, index) in sources"
            :key="source.id"
            class="platform-card"
            :class="{ 
              'is-active': activeNodeId === source.id,
              'is-primary': index === 0 
            }"
            @click="handleNodeClick(source.id)"
          >
            <div class="platform-name">{{ source.name }}</div>
            <div v-if="activeNodeId === source.id" class="platform-check">
              <van-icon name="success" />
            </div>
          </div>
        </div>

        <!-- 平台详情（页面内显示，不弹窗） -->
        <div v-if="activeSource" class="source-detail">
          <div class="detail-header">
            <h4>{{ activeSource.name }} 系统</h4>
            <van-icon name="cross" @click="activeNodeId = null" />
          </div>
          <div class="detail-content">
            <div
              v-for="(value, key) in activeSource.keyInfo"
              :key="key"
              class="detail-row"
            >
              <span class="detail-label">{{ getLabel(key) }}：</span>
              <span class="detail-value">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="popup-footer">
        <van-button
          type="primary"
          size="large"
          block
          @click="close"
        >
          关闭
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PlatformSource } from '@/types/customer'

interface Props {
  show: boolean
  sources: PlatformSource[]
  customerId?: string // 客户ID，用于显示 OneID
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const activeNodeId = ref<string | null>(null)

// 默认选中第一个源平台
watch(() => props.show, (newVal) => {
  if (newVal && props.sources.length > 0 && !activeNodeId.value) {
    activeNodeId.value = props.sources[0].id
  }
}, { immediate: true })

// 监听 sources 变化，如果弹窗已打开且没有选中项，默认选中第一个
watch(() => props.sources, (newSources) => {
  if (props.show && newSources.length > 0 && !activeNodeId.value) {
    activeNodeId.value = newSources[0].id
  }
}, { immediate: true })

const activeSource = computed(() => {
  if (!activeNodeId.value) return null
  return props.sources.find(s => s.id === activeNodeId.value) || null
})

// OneID 显示值
const oneIdDisplay = computed(() => {
  if (props.customerId) {
    // 如果客户ID是数字，格式化为 ONEID + 8位数字
    const num = props.customerId.replace(/\D/g, '')
    if (num) {
      return `ONEID${num.padStart(8, '0').slice(-8)}`
    }
    return props.customerId
  }
  return 'ONEID00000001'
})

const handleNodeClick = (id: string) => {
  if (activeNodeId.value === id) {
    activeNodeId.value = null
  } else {
    activeNodeId.value = id
    // 滚动到详情区域
    setTimeout(() => {
      const detailEl = document.querySelector('.source-detail')
      if (detailEl) {
        detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }, 100)
  }
}

const close = () => {
  emit('update:show', false)
  activeNodeId.value = null
}

const getLabel = (key: string): string => {
  const labelMap: Record<string, string> = {
    name: '姓名',
    mobile: '手机号',
    age: '年龄',
    gender: '性别',
    city: '城市',
  }
  return labelMap[key] || key
}
</script>

<style scoped lang="scss">
.platform-flow {
  padding: 12px; // 减少内边距
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px; // 统一内边距
  border-bottom: 1px solid #ebedf0;
  flex-shrink: 0;

  h3 {
    margin: 0;
    font-size: 14px; // 统一标题字体大小
    font-weight: 600;
    color: #323233;
  }

  .van-icon {
    font-size: 16px; // 统一图标大小
    color: #969799;
    cursor: pointer;
  }
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 12px; // 减少内边距
}

// OneID 区域
.oneid-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px; // 减少间距
  margin-bottom: 12px; // 减少间距
  padding-bottom: 12px; // 减少内边距
  border-bottom: 1px solid #ebedf0;

  .oneid-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;

    .oneid-box {
      background: #e8f4ff;
      border-radius: 6px;
      padding: 8px 16px;
      border: 1px solid #b3d8ff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);

      .oneid-id {
        font-size: 13px;
        font-weight: 600;
        color: #1989fa;
        letter-spacing: 0.3px;
      }
    }

    .oneid-label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
      margin-top: 2px;
    }
  }

  .flow-arrow-down {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #1989fa;
    font-size: 18px;
    padding: 4px 0;
    font-weight: bold;
  }
}

// 平台网格布局（4列，让卡片更窄）
.platform-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  padding: 0 4px;
}

// 平台卡片
.platform-card {
  position: relative;
  background: #f5f5f5;
  border-radius: 4px;
  padding: 6px 4px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1.5px solid transparent;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 36px;

  // 未选择时都是灰色
  &:not(.is-active) {
    background: #f5f5f5;
    
    .platform-name {
      color: #969799;
    }
  }

  &.is-active {
    background: #e8f4ff;
    border-color: #1989fa;
    box-shadow: 0 2px 8px rgba(25, 137, 250, 0.3);
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.96);
  }

  .platform-name {
    font-size: 11px;
    font-weight: 600;
    color: #969799;
    text-align: center;
    transition: all 0.2s;
    line-height: 1.2;
  }

  &.is-active .platform-name {
    color: #1989fa;
  }

  .platform-check {
    position: absolute;
    top: 1px;
    right: 1px;
    width: 14px;
    height: 14px;
    background: #1989fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 9px;
  }
}

// 平台详情（页面内显示）
.source-detail {
  margin-top: 12px; // 减少间距
  padding: 10px 12px; // 减少内边距
  background: #f7f8fa;
  border-radius: 6px; // 减小圆角
  border: 1px solid #ebedf0;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px; // 减少间距
    padding-bottom: 8px; // 减少内边距
    border-bottom: 1px solid #ebedf0;

    h4 {
      margin: 0;
      font-size: 13px; // 减小字体
      font-weight: 600;
      color: #323233;
    }

    .van-icon {
      font-size: 16px; // 减小图标
      color: #969799;
      cursor: pointer;
    }
  }

  .detail-content {
    .detail-row {
      display: flex;
      padding: 6px 0; // 减少内边距
      font-size: 12px; // 减小字体
      line-height: 1.3; // 优化行高
      border-bottom: 1px solid #ebedf0;

      &:last-child {
        border-bottom: none;
      }

      .detail-label {
        color: #969799;
        min-width: 75px; // 减少最小宽度
        flex-shrink: 0;
        font-size: 12px; // 减小字体
      }

      .detail-value {
        color: #323233;
        font-weight: 500;
        flex: 1;
        text-align: right;
        font-size: 12px; // 减小字体
      }
    }

    .detail-divider {
      height: 1px;
      background: #ebedf0;
      margin: 10px 0; // 减少间距
    }

    .detail-section-title {
      font-size: 12px; // 减小字体
      font-weight: 600;
      color: #323233;
      margin-bottom: 8px; // 减少间距
      padding-bottom: 6px; // 减少内边距
      border-bottom: 2px solid #1989fa;
    }
  }
}
</style>

