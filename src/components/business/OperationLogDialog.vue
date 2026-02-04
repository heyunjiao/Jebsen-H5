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
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-slate);
  font-family: "Porsche Next", -apple-system, "PingFang SC", sans-serif;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 0;
    flex-shrink: 0;

    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
      letter-spacing: -0.01em;
    }

    .van-icon {
      font-size: 16px;
      color: var(--text-sub);
      cursor: pointer;
      padding: 4px;
      transition: opacity 0.2s;
      
      &:active {
        opacity: 0.7;
      }
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
      gap: 6px;
      padding-top: 10px;

      .log-item {
        background: white;
        border-radius: 4px;
        padding: 10px 12px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        border: 1px solid var(--border-color);

        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .log-operator {
            display: flex;
            align-items: center;
            gap: 6px;

            .operator-icon {
              font-size: 14px;
              color: var(--accent-gold);
            }

            .operator-name {
              font-size: 13px;
              font-weight: 600;
              color: var(--text-main);
            }
          }

          .log-time {
            font-size: 11px;
            color: var(--text-sub);
          }
        }

        .log-type {
          margin-bottom: 6px;
        }

        .log-description {
          font-size: 12px;
          color: var(--text-main);
          line-height: 1.3;
          margin-bottom: 6px;
        }

        .log-details {
          padding: 8px 10px;
          background: var(--bg-slate);
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          border: 1px solid var(--border-color);

          .detail-item {
            display: flex;
            font-size: 11px;
            line-height: 1.4;

            .detail-label {
              color: var(--text-sub);
              min-width: 70px;
              flex-shrink: 0;
            }

            .detail-value {
              color: var(--text-main);
              flex: 1;
              word-break: break-all;

              &.old-value {
                text-decoration: line-through;
                color: var(--text-sub);
              }

              &.new-value {
                color: var(--accent-gold);
                font-weight: 600;
              }
            }
          }
        }
      }
    }
  }
}
</style>

