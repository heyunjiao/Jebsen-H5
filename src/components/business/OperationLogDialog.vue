<template>
  <van-popup
    :show="show"
    @update:show="handleUpdateShow"
    position="bottom"
    :style="{ height: '70%' }"
    round
    lock-scroll
  >
    <div class="operation-log-dialog">
      <div class="popup-header">
        <h3>操作日志</h3>
        <van-icon name="cross" @click="handleClose" />
      </div>
      <div class="popup-content">
        <div v-if="loading" class="loading-container">
          <van-loading type="spinner" vertical>加载中...</van-loading>
        </div>
        <div v-else-if="logs.length === 0" class="empty-container">
          <van-empty description="暂无操作日志" />
        </div>
        <div v-else class="logs-list">
          <div
            v-for="log in logs"
            :key="log.id"
            class="log-item"
          >
            <div class="log-header">
              <div class="log-operator">
                <van-icon name="user-o" class="operator-icon" />
                <span class="operator-name">{{ log.operator }}</span>
              </div>
              <div class="log-time">{{ formatTime(log.operationTime) }}</div>
            </div>
            <div class="log-type">
              <van-tag :type="getOperationTypeTagType(log.operationType)" :size="'small' as any">
                {{ log.operationType }}
              </van-tag>
            </div>
            <div v-if="log.description" class="log-description">
              {{ log.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { OperationLog } from '@/types/customer'

interface Props {
  show: boolean
  logs: OperationLog[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const handleClose = () => {
  emit('update:show', false)
}

const handleUpdateShow = (value: boolean) => {
  emit('update:show', value)
}

// 格式化时间
const formatTime = (time: string) => {
  try {
    const date = new Date(time)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}年${month}月${day}日 ${hours}:${minutes}`
  } catch (e) {
    return time
  }
}

// 获取操作类型标签类型
const getOperationTypeTagType = (type: string): any => {
  const typeMap: Record<string, any> = {
    '人工更新': 'primary',
    '系统更新': 'default',
    '数据合并': 'success',
    '数据纠错': 'warning',
    '冲突处理': 'danger',
  }
  return typeMap[type] || 'default'
}
</script>

<style scoped lang="scss">
.operation-log-dialog {
  padding: 12px; // 减少内边距
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px; // 统一内边距
    border-bottom: 1px solid #ebedf0;
    margin-bottom: 12px; // 统一间距

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

    .loading-container,
    .empty-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }

    .logs-list {
      display: flex;
      flex-direction: column;
      gap: 6px; // 减少间距

      .log-item {
        background: white;
        border-radius: 6px; // 减小圆角
        padding: 10px 12px; // 减少内边距
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06); // 减小阴影

        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px; // 减少间距

          .log-operator {
            display: flex;
            align-items: center;
            gap: 5px; // 减少间距

            .operator-icon {
              font-size: 14px; // 减小图标
              color: #1989fa;
            }

            .operator-name {
              font-size: 13px; // 减小字体
              font-weight: 600;
              color: #323233;
            }
          }

          .log-time {
            font-size: 11px; // 减小字体
            color: #969799;
          }
        }

        .log-type {
          margin-bottom: 6px; // 减少间距
        }

        .log-description {
          font-size: 12px; // 减小字体
          color: #646566;
          line-height: 1.4; // 优化行高
          margin-bottom: 8px; // 减少间距
        }

        .log-details {
          padding: 8px 10px; // 减少内边距
          background: #f7f8fa;
          border-radius: 4px; // 减小圆角
          display: flex;
          flex-direction: column;
          gap: 6px; // 减少间距

          .detail-item {
            display: flex;
            font-size: 11px; // 减小字体
            line-height: 1.3; // 优化行高

            .detail-label {
              color: #969799;
              min-width: 70px;
              flex-shrink: 0;
            }

            .detail-value {
              color: #323233;
              flex: 1;
              word-break: break-all;

              &.old-value {
                text-decoration: line-through;
                color: #969799;
              }

              &.new-value {
                color: #1989fa;
                font-weight: 500;
              }
            }
          }
        }
      }
    }
  }
}
</style>

