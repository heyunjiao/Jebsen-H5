<template>
  <van-popup
    :show="show"
    @update:show="(value: boolean) => emit('update:show', value)"
    position="bottom"
    :style="{ height: '70%' }"
    round
    :lock-scroll="true"
  >
    <div class="conflict-resolver">
      <div class="popup-header">
        <h3>冲突处理</h3>
        <van-icon name="cross" @click="close" />
      </div>
      <div class="popup-content">
        <div class="conflict-tip">
          <van-notice-bar
            left-icon="info-o"
            color="#ff976a"
            background="#fff4e8"
          >
            系统检测到【姓名+手机号高度相似】不一致。请确认最终保留值。
          </van-notice-bar>
        </div>
        <div class="conflict-list">
          <div
            v-for="item in conflicts"
            :key="item.id"
            class="conflict-item"
            :class="{ 'is-selected': isSelected(item.id) }"
            @click="toggleSelect(item.id)"
          >
            <van-checkbox
              :model-value="isSelected(item.id)"
              @click.stop="toggleSelect(item.id)"
            />
            <div class="item-content">
              <div class="item-header">
                <van-tag type="primary" :size="'small' as any">{{ item.origin }}</van-tag>
                <span class="item-time">{{ item.updateTime }}</span>
              </div>
              <div class="item-info">
                <div class="info-row">
                  <span class="label">姓名：</span>
                  <span class="value">{{ item.name }}</span>
                </div>
                <div class="info-row">
                  <span class="label">手机号：</span>
                  <span class="value">{{ item.mobile }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="note-section">
          <van-field
            v-model="note"
            type="textarea"
            placeholder="请输入备注信息（选填）"
            rows="3"
            maxlength="200"
            show-word-limit
          />
        </div>
      </div>
      <div class="popup-footer">
        <van-button
          type="primary"
          size="large"
          :loading="submitting"
          :disabled="selectedIds.length === 0"
          @click="handleSubmit('merge')"
        >
          是同一个人（申请合并）
        </van-button>
        <van-button
          type="default"
          size="large"
          :loading="submitting"
          :disabled="selectedIds.length === 0"
          @click="handleSubmit('keep')"
        >
          不是一个人（保持多条）
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { NameMobileConflict } from '@/types/customer'
import { useCustomerStore } from '@/stores/customer'
import { showToast } from 'vant'

interface Props {
  show: boolean
  conflicts: NameMobileConflict[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:show': [value: boolean]
  'submitted': []
}>()

const customerStore = useCustomerStore()
const selectedIds = ref<string[]>([])
const note = ref('')
const submitting = ref(false)

const isSelected = (id: string) => {
  return selectedIds.value.includes(id)
}

const toggleSelect = (id: string) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

const close = () => {
  emit('update:show', false)
  selectedIds.value = []
  note.value = ''
}

const handleSubmit = async (action: 'merge' | 'keep') => {
  if (selectedIds.value.length === 0) {
    showToast('请至少选择一项')
    return
  }

  submitting.value = true
  try {
    await customerStore.submitNameMobileConflict({
      selectedIds: selectedIds.value,
      note: note.value || undefined,
      action,
    })
    emit('submitted')
    close()
  } catch (error: any) {
    // 错误已在store中处理
  } finally {
    submitting.value = false
  }
}

watch(() => props.show, (newVal) => {
  if (!newVal) {
    selectedIds.value = []
    note.value = ''
  }
})
</script>

<style scoped lang="scss">
.conflict-resolver {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-slate);
  font-family: "Porsche Next", -apple-system, "PingFang SC", sans-serif;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  margin-bottom: 0;

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
  padding-top: 10px;
}

.conflict-tip {
  margin-bottom: 10px;
}

.conflict-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.conflict-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--border-color);
  margin-bottom: 6px;

  &:last-child {
    margin-bottom: 0;
  }

  &.is-selected {
    background: #FCFAF6;
    border-color: var(--accent-gold);
    border-width: 2px;
  }

  &:active {
    background: var(--bg-slate);
  }

  .item-content {
    flex: 1;
    min-width: 0;

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;

      .item-time {
        font-size: 11px;
        color: var(--text-sub);
      }
    }

    .item-info {
      .info-row {
        display: flex;
        margin-bottom: 4px;
        font-size: 12px;
        line-height: 1.3;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          color: var(--text-sub);
          min-width: 55px;
          flex-shrink: 0;
          font-size: 12px;
        }

        .value {
          color: var(--text-main);
          font-weight: 500;
          font-size: 12px;
        }
      }
    }
  }
}

.note-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);

  :deep(.van-field) {
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: white;
    padding: 8px 10px;

    &:focus-within {
      border-color: var(--accent-gold);
    }

    .van-field__control {
      min-height: 50px;
      font-size: 12px;
      line-height: 1.3;
      color: var(--text-main);
    }

    .van-field__word-limit {
      color: var(--text-sub);
      font-size: 11px;
    }
  }
}

.popup-footer {
  display: flex;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
  margin-top: auto;

  .van-button {
    flex: 1;
    font-size: 14px !important;
    height: 40px;
  }
}
</style>

