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

.conflict-tip {
  margin-bottom: 16px;
}

.conflict-list {
  display: flex;
  flex-direction: column;
  gap: 8px; // 减少间距
  margin-bottom: 12px; // 减少间距
}

.conflict-item {
  display: flex;
  align-items: flex-start;
  gap: 10px; // 减少间距
  padding: 8px 10px; // 减少内边距
  background: #f7f8fa;
  border-radius: 6px; // 减小圆角
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;

  &.is-selected {
    background: #e8f4ff;
    border-color: #1989fa;
  }

  &:active {
    background: #ebedf0;
  }

  .item-content {
    flex: 1;
    min-width: 0;

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .item-time {
        font-size: 12px;
        color: #969799;
      }
    }

    .item-info {
      .info-row {
        display: flex;
        margin-bottom: 3px; // 减少间距
        font-size: 12px; // 减小字体
        line-height: 1.3; // 优化行高

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          color: #969799;
          min-width: 55px; // 减少最小宽度
          flex-shrink: 0;
          font-size: 12px; // 减小字体
        }

        .value {
          color: #323233;
          font-weight: 500;
          font-size: 12px; // 减小字体
        }
      }
    }
  }
}

.note-section {
  margin-top: 12px; // 减少间距
  padding-top: 12px; // 减少内边距
  border-top: 1px solid #ebedf0;

  :deep(.van-field) {
    border: 1px solid #dcdee0;
    border-radius: 6px; // 减小圆角
    background: #fff;
    padding: 8px 10px; // 减少内边距

    &:focus-within {
      border-color: #1989fa;
    }

    .van-field__control {
      min-height: 50px; // 减小最小高度
      font-size: 12px; // 减小字体
      line-height: 1.4; // 优化行高
    }

    .van-field__word-limit {
      color: #969799;
      font-size: 11px; // 减小字体
    }
  }
}

.popup-footer {
  display: flex;
  gap: 10px; // 减少间距
  padding-top: 12px; // 减少内边距
  border-top: 1px solid #ebedf0;
  flex-shrink: 0;

  .van-button {
    flex: 1;
  }
}
</style>

