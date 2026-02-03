<template>
  <div class="c360-field">
    <van-cell
      :title="label"
      :value="displayValue"
      class="field-cell"
    >
      <template #value>
        <div class="field-value-wrapper">
          <span class="field-value">{{ displayValue }}</span>
          <van-icon
            name="edit"
            class="edit-icon"
            @click.stop="handleEdit"
          />
        </div>
      </template>
    </van-cell>

    <!-- 字段纠错弹窗 -->
    <van-popup
      v-if="!isMobileData"
      v-model:show="showEditPopup"
      position="bottom"
      round
      lock-scroll
    >
      <div class="edit-popup">
        <div class="popup-header">
          <h3>纠错{{ label }}</h3>
          <van-icon name="cross" @click="showEditPopup = false" />
        </div>
        <div class="popup-content">
          <div class="current-value-display">
            <div class="current-label">当前值：</div>
            <div class="current-value-text">{{ displayValue }}</div>
          </div>
          <van-field
            v-model="editValue"
            :label="`纠错${label}`"
            :placeholder="`请输入正确的${label}`"
            :rules="editRules"
            clearable
          />
          <van-field
            v-model="correctionNote"
            label="备注"
            type="textarea"
            placeholder="请输入纠错原因或说明（选填）"
            rows="3"
            maxlength="200"
            show-word-limit
          />
          <div class="edit-actions">
            <van-button
              type="default"
              size="large"
              @click="showEditPopup = false"
            >
              取消
            </van-button>
            <van-button
              type="primary"
              size="large"
              :loading="saving"
              @click="handleSave"
            >
              提交纠错
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- MobileEditor组件（新版MobileData） -->
    <MobileEditor
      v-if="isMobileData"
      v-model="showMobileEditor"
      :mobile-data="fieldData as MobileData"
      @update="handleMobileUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import type { FieldData, MobileData } from '@/types/customer'
import { customerApi } from '@/api/customer'
import MobileEditor from '@/components/business/MobileEditor.vue'
import { useCustomerStore } from '@/stores/customer'

interface Props {
  label: string // 字段标签
  fieldData: FieldData | MobileData // 字段数据（支持FieldData或MobileData）
  fieldKey: string // 字段键名（用于更新）
}

const customerStore = useCustomerStore()

const props = defineProps<Props>()

const showEditPopup = ref(false)
const showMobileEditor = ref(false)
const editValue = ref('')
const correctionNote = ref('')
const saving = ref(false)

// 判断是否为MobileData类型
const isMobileData = computed(() => {
  return props.fieldKey === 'mobile' && 'items' in props.fieldData
})

// 是否可编辑（所有基础信息字段都可以编辑）
const editable = computed(() => {
  return true
})

// 显示值
const displayValue = computed(() => {
  if (isMobileData.value) {
    const mobileData = props.fieldData as MobileData
    const primaryItem = mobileData.items.find((item) => item.isPrimary)
    if (primaryItem) {
      return primaryItem.mobile
    }
    return mobileData.items.length > 0 ? mobileData.items[0].mobile : '未设置'
  }
  return String((props.fieldData as FieldData).value)
})

// 编辑规则（手机号验证）
const editRules = computed(() => {
  if (props.fieldKey === 'mobile') {
    return [
      { required: true, message: '请输入手机号' },
      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
    ]
  }
  return []
})

// 点击编辑图标
const handleEdit = () => {
  if (isMobileData.value) {
    // 如果是MobileData，打开MobileEditor
    showMobileEditor.value = true
  } else {
    // 所有字段都可以纠错
    editValue.value = displayValue.value
    correctionNote.value = ''
    showEditPopup.value = true
  }
}

// 保存纠错信息
const handleSave = async () => {
  if (!editValue.value) {
    showToast('请输入纠错内容')
    return
  }

  // 如果值没有变化，提示用户
  if (editValue.value === displayValue.value) {
    showToast('纠错值应与当前值不同')
    return
  }

  // 手机号格式验证
  if (props.fieldKey === 'mobile') {
    if (!/^1[3-9]\d{9}$/.test(editValue.value)) {
      showToast('手机号格式不正确')
      return
    }
  }

  saving.value = true
  showLoadingToast({
    message: '提交中...',
    forbidClick: true,
  })

  try {
    const res = await customerApi.submitFieldCorrection({
      field: props.fieldKey,
      currentValue: (props.fieldData as FieldData).value,
      correctValue: editValue.value,
      note: correctionNote.value || undefined,
    })
    
    if (res.code === 200) {
      showToast('纠错信息已提交，等待审核')
      showEditPopup.value = false
      editValue.value = ''
      correctionNote.value = ''
      // 触发更新事件（可选，根据业务需求决定是否立即更新）
      emit('update', {
        field: props.fieldKey,
        value: editValue.value,
      })
    }
  } catch (error: any) {
    showToast(error.message || '提交失败，请重试')
  } finally {
    saving.value = false
    closeToast()
  }
}

// 处理MobileEditor更新
const handleMobileUpdate = (data: MobileData) => {
  // 更新本地数据
  if (isMobileData.value) {
    Object.assign(props.fieldData as MobileData, data)
  }
  // 触发更新事件
  emit('update', {
    field: props.fieldKey,
    value: data,
  })
}

const emit = defineEmits<{
  update: [data: { field: string; value: string | number | MobileData }]
}>()
</script>

<style scoped lang="scss">
.c360-field {
  .field-cell {
    :deep(.van-cell__value) {
      flex: 1;
    }
  }

  .field-value-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: flex-end;
  }

  .field-value {
    flex: 1;
    text-align: right;
  }

  .conflict-tag {
    flex-shrink: 0;
  }

  .edit-icon {
    color: #1989fa;
    cursor: pointer;
    flex-shrink: 0;
  }

  .edit-popup {
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .current-value-display {
    margin-bottom: 12px; // 减少间距
    padding: 10px; // 减少内边距
    background: #f7f8fa;
    border-radius: 6px; // 减小圆角

    .current-label {
      font-size: 11px; // 减小字体
      color: #969799;
      margin-bottom: 4px;
    }

    .current-value-text {
      font-size: 12px; // 进一步减小字体
      color: #323233;
      font-weight: 500;
    }
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px; // 统一内边距
    border-bottom: 1px solid #ebedf0;

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


  .edit-actions {
    display: flex;
    gap: 10px; // 减少间距
    margin-top: 16px; // 减少间距
    padding-top: 12px; // 减少内边距
    border-top: 1px solid #ebedf0;

    .van-button {
      flex: 1;
    }
  }
}
</style>

