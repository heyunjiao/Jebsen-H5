<template>
  <van-popup
    v-model:show="show"
    position="bottom"
    :style="{ height: '80%' }"
    round
    lock-scroll
    @close="handleClose"
  >
    <div class="mobile-editor">
      <div class="popup-header">
        <h3>管理电话号码</h3>
        <van-icon name="cross" @click="handleClose" />
      </div>

      <div class="popup-content">
        <!-- 号码列表视图 -->
        <div v-if="currentView === 'list'" class="view-content">
          <!-- 电话号码列表 -->
          <div class="mobile-list">
            <div
              v-for="item in mobileItems"
              :key="item.id"
              class="mobile-item"
              :class="{ 'is-primary': item.isPrimary }"
            >
              <div class="mobile-item-header">
                <div class="mobile-number">
                  <!-- 编辑模式：显示输入框 -->
                  <van-field
                    v-if="editingItemId === item.id"
                    v-model="editForm.mobile"
                    placeholder="请输入11位手机号"
                    :rules="mobileRules"
                    clearable
                    class="mobile-input-field"
                  />
                  <!-- 非编辑模式：显示号码 -->
                  <template v-else>
                    <span class="number">{{ item.mobile }}</span>
                  </template>
                  <van-tag v-if="item.isPrimary" type="primary">主号码</van-tag>
                  <van-tag v-if="item.source && editingItemId !== item.id" type="default">{{ item.source }}</van-tag>
                </div>
                <div class="mobile-actions">
                  <!-- 编辑模式：显示保存/取消按钮 -->
                  <template v-if="editingItemId === item.id">
                    <van-button
                      type="default"
                      size="mini"
                      @click="handleCancelEdit"
                    >
                      取消
                    </van-button>
                    <van-button
                      type="primary"
                      size="mini"
                      :loading="saving"
                      @click="handleSaveEdit"
                    >
                      保存
                    </van-button>
                  </template>
                  <!-- 非编辑模式：显示操作图标 -->
                  <template v-else>
                    <van-icon
                      v-if="!item.isPrimary && item.id"
                      name="delete"
                      class="action-icon delete-icon"
                      @click="handleDelete(item.id)"
                    />
                    <van-icon
                      name="edit"
                      class="action-icon edit-icon"
                      @click="handleEditItem(item)"
                    />
                  </template>
                </div>
              </div>
              <div class="mobile-item-content">
                <!-- 关系标签选择区域（单选） -->
                <div class="relation-tag-section">
                  <div class="section-label">关系标签：</div>
                  <div v-if="tagPool.length === 0" class="tag-empty">
                    <span class="empty-text">暂无标签数据</span>
                  </div>
                  <div v-else class="tag-options">
                    <van-tag
                      v-for="tag in tagPool"
                      :key="tag.id"
                      :type="(editingItemId === item.id ? editForm.relationTagId === tag.id : (item.relationTagId === tag.id)) ? 'primary' : 'default'"
                      size="small"
                      plain
                      class="tag-option"
                      :class="{ 'tag-selected': (editingItemId === item.id ? editForm.relationTagId === tag.id : (item.relationTagId === tag.id)) }"
                      @click="editingItemId === item.id ? handleSelectRelationTag(tag.id) : toggleRelationTag(item, tag.id)"
                    >
                      {{ tag.name }}
                      <van-icon
                        v-if="(editingItemId === item.id ? editForm.relationTagId === tag.id : (item.relationTagId === tag.id))"
                        name="success"
                        class="tag-check-icon"
                      />
                    </van-tag>
                  </div>
                </div>
                <!-- 业务标签选择区域（多选） -->
                <div class="business-tag-section">
                  <div class="section-label">业务标签：</div>
                  <div class="tag-options">
                    <van-tag
                      v-for="businessTag in businessTagOptions"
                      :key="businessTag"
                      :type="(editingItemId === item.id ? editForm.businessTags?.includes(businessTag) : (item.businessTags?.includes(businessTag))) ? 'primary' : 'default'"
                      size="small"
                      plain
                      class="tag-option"
                      :class="{ 'tag-selected': (editingItemId === item.id ? editForm.businessTags?.includes(businessTag) : (item.businessTags?.includes(businessTag))) }"
                      @click="editingItemId === item.id ? toggleBusinessTag(businessTag) : toggleBusinessTagForItem(item, businessTag)"
                    >
                      {{ businessTag }}
                      <van-icon
                        v-if="(editingItemId === item.id ? editForm.businessTags?.includes(businessTag) : (item.businessTags?.includes(businessTag)))"
                        name="success"
                        class="tag-check-icon"
                      />
                    </van-tag>
                  </div>
                </div>
                <!-- 号码类型选择（仅在编辑模式显示） -->
                <div v-if="editingItemId === item.id" class="number-type-selector-inline">
                  <div class="selector-label">
                    <span>号码类型：</span>
                  </div>
                  <van-radio-group v-model="editForm.isPrimary" direction="horizontal">
                    <van-radio 
                      name="primary" 
                      :disabled="mobileItems.some(i => i.isPrimary && i.id !== item.id)"
                    >
                      <span>主号</span>
                    </van-radio>
                    <van-radio name="secondary">
                      <span>副号</span>
                    </van-radio>
                  </van-radio-group>
                </div>
                <div v-if="item.updateTime && editingItemId !== item.id" class="update-time">
                  更新时间：{{ item.updateTime }}
                </div>
              </div>
            </div>
            
            <!-- 新增号码表单（在列表底部） -->
            <div v-if="editingItemId === 'new'" class="mobile-item edit-form-new">
              <div class="mobile-item-header">
                <div class="mobile-number">
                  <van-field
                    v-model="editForm.mobile"
                    placeholder="请输入11位手机号"
                    :rules="mobileRules"
                    clearable
                    class="mobile-input-field"
                  />
                </div>
                <div class="mobile-actions">
                  <van-button
                    type="default"
                    size="mini"
                    @click="handleCancelEdit"
                  >
                    取消
                  </van-button>
                  <van-button
                    type="primary"
                    size="mini"
                    :loading="saving"
                    @click="handleSaveEdit"
                  >
                    保存
                  </van-button>
                </div>
              </div>
              <div class="mobile-item-content">
                <!-- 关系标签选择区域（单选） -->
                <div class="relation-tag-section">
                  <div class="section-label">关系标签：</div>
                  <div v-if="tagPool.length === 0" class="tag-empty">
                    <span class="empty-text">暂无标签数据</span>
                  </div>
                  <div v-else class="tag-options">
                    <van-tag
                      v-for="tag in tagPool"
                      :key="tag.id"
                      :type="editForm.relationTagId === tag.id ? 'primary' : 'default'"
                      size="small"
                      plain
                      class="tag-option"
                      :class="{ 'tag-selected': editForm.relationTagId === tag.id }"
                      @click="handleSelectRelationTag(tag.id)"
                    >
                      {{ tag.name }}
                      <van-icon
                        v-if="editForm.relationTagId === tag.id"
                        name="success"
                        class="tag-check-icon"
                      />
                    </van-tag>
                  </div>
                </div>
                <!-- 业务标签选择区域（多选） -->
                <div class="business-tag-section">
                  <div class="section-label">业务标签：</div>
                  <div class="tag-options">
                    <van-tag
                      v-for="businessTag in businessTagOptions"
                      :key="businessTag"
                      :type="editForm.businessTags?.includes(businessTag) ? 'primary' : 'default'"
                      size="small"
                      plain
                      class="tag-option"
                      :class="{ 'tag-selected': editForm.businessTags?.includes(businessTag) }"
                      @click="toggleBusinessTag(businessTag)"
                    >
                      {{ businessTag }}
                      <van-icon
                        v-if="editForm.businessTags?.includes(businessTag)"
                        name="success"
                        class="tag-check-icon"
                      />
                    </van-tag>
                  </div>
                </div>
                <!-- 号码类型选择 -->
                <div class="number-type-selector-inline">
                  <div class="selector-label">
                    <span>号码类型：</span>
                  </div>
                  <van-radio-group v-model="editForm.isPrimary" direction="horizontal">
                    <van-radio 
                      name="primary" 
                      :disabled="mobileItems.some(item => item.isPrimary)"
                    >
                      <span>主号</span>
                    </van-radio>
                    <van-radio name="secondary">
                      <span>副号</span>
                    </van-radio>
                  </van-radio-group>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <van-button
              v-if="editingItemId !== 'new'"
              type="primary"
              size="large"
              icon="plus"
              @click="handleAdd"
              block
            >
              新增号码
            </van-button>
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant'
import type { MobileItem, MobileData, TagPool } from '@/types/customer'
import { customerApi } from '@/api/customer'

interface Props {
  modelValue: boolean
  mobileData: MobileData
}

const props = defineProps<Props>()

// 关系标签池
const relationTagPool = ref<TagPool[]>([])

// 实际使用的标签池（关系标签池）
const tagPool = computed(() => relationTagPool.value)

// 获取关系标签池
const fetchRelationTagPool = async () => {
  // 如果已经有数据，直接返回
  if (relationTagPool.value.length > 0) {
    return
  }
  
  try {
    console.log('[MobileEditor] 开始获取关系标签池')
    const res = await customerApi.getRelationTagPool()
    console.log('[MobileEditor] 关系标签池响应:', res)
    if (res.code === 200 && res.data) {
      relationTagPool.value = res.data
      console.log('[MobileEditor] 关系标签池已设置:', relationTagPool.value)
    } else {
      throw new Error('获取关系标签池失败')
    }
  } catch (error: any) {
    console.warn('[MobileEditor] 获取关系标签池失败，使用默认标签:', error)
    // Fallback: 使用默认关系标签
    relationTagPool.value = [
      { id: 'relation1', name: '本人', color: '#1989fa' },
      { id: 'relation2', name: '配偶', color: '#ff6b9d' },
      { id: 'relation3', name: '父亲', color: '#52c41a' },
      { id: 'relation4', name: '母亲', color: '#52c41a' },
      { id: 'relation5', name: '儿子', color: '#1890ff' },
      { id: 'relation6', name: '女儿', color: '#eb2f96' },
      { id: 'relation7', name: '朋友', color: '#fa8c16' },
      { id: 'relation8', name: '同事', color: '#13c2c2' },
      { id: 'relation9', name: '其他', color: '#8c8c8c' },
    ]
    console.log('[MobileEditor] 使用默认关系标签池:', relationTagPool.value)
  }
}

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update': [data: MobileData]
}>()

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const mobileItems = ref<MobileItem[]>([...props.mobileData.items])
const currentView = ref<'list'>('list')
const editingItemId = ref<string | 'new' | null>(null) // null: 无编辑, 'new': 新增, string: 编辑的ID
const editingItem = ref<MobileItem | null>(null)
const saving = ref(false)

// 业务标签选项
const businessTagOptions = ['车主', '送修人']

const editForm = ref({
  mobile: '',
  relationTagId: '' as string,
  businessTags: [] as string[],
  isPrimary: 'secondary' as 'primary' | 'secondary',
})

const mobileRules = [
  { required: true, message: '请输入手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
]

// 切换关系标签（单选，列表视图）
const toggleRelationTag = async (item: MobileItem, tagId: string) => {
  const selectedTag = tagPool.value.find(t => t.id === tagId)
  if (!selectedTag) return
  
  // 如果点击的是已选中的标签，则取消选择；否则选择新标签
  const newRelationTagId = item.relationTagId === tagId ? undefined : tagId
  const newRelationTagName = newRelationTagId ? selectedTag.name : undefined
  
  // 更新本地数据
  const index = mobileItems.value.findIndex(i => i.id === item.id)
  if (index > -1) {
    mobileItems.value[index] = {
      ...mobileItems.value[index],
      relationTagId: newRelationTagId,
      relationTagName: newRelationTagName,
    }
    
    // 保存到后端
    showLoadingToast({
      message: '保存中...',
      forbidClick: true,
      duration: 0,
    })
    
    try {
      const res = await customerApi.updateMobileItem({
        id: item.id,
        mobile: item.mobile,
        relationTagId: newRelationTagId,
        relationTagName: newRelationTagName,
        businessTags: item.businessTags,
        isPrimary: item.isPrimary,
      })
      
      if (res.code === 200) {
        mobileItems.value[index] = res.data
        emitUpdate()
      }
    } catch (error: any) {
      showToast(error.message || '保存失败，请重试')
      // 回滚
      mobileItems.value[index] = item
    } finally {
      closeToast()
    }
  }
}

// 切换业务标签（多选，列表视图）
const toggleBusinessTagForItem = async (item: MobileItem, businessTag: string) => {
  const currentTags = item.businessTags || []
  const newTags = currentTags.includes(businessTag)
    ? currentTags.filter(t => t !== businessTag)
    : [...currentTags, businessTag]
  
  // 更新本地数据
  const index = mobileItems.value.findIndex(i => i.id === item.id)
  if (index > -1) {
    mobileItems.value[index] = {
      ...mobileItems.value[index],
      businessTags: newTags,
    }
    
    // 保存到后端
    showLoadingToast({
      message: '保存中...',
      forbidClick: true,
      duration: 0,
    })
    
    try {
      const res = await customerApi.updateMobileItem({
        id: item.id,
        mobile: item.mobile,
        relationTagId: item.relationTagId,
        relationTagName: item.relationTagName,
        businessTags: newTags,
        isPrimary: item.isPrimary,
      })
      
      if (res.code === 200) {
        mobileItems.value[index] = res.data
        emitUpdate()
      }
    } catch (error: any) {
      showToast(error.message || '保存失败，请重试')
      // 回滚
      mobileItems.value[index] = item
    } finally {
      closeToast()
    }
  }
}

// 选择关系标签（编辑表单，单选）
const handleSelectRelationTag = (tagId: string) => {
  // 如果点击的是已选中的标签，则取消选择；否则选择新标签
  editForm.value.relationTagId = editForm.value.relationTagId === tagId ? '' : tagId
}

// 切换业务标签（编辑表单，多选）
const toggleBusinessTag = (businessTag: string) => {
  if (!editForm.value.businessTags) {
    editForm.value.businessTags = []
  }
  const index = editForm.value.businessTags.indexOf(businessTag)
  if (index > -1) {
    editForm.value.businessTags.splice(index, 1)
  } else {
    editForm.value.businessTags.push(businessTag)
  }
}

// 监听mobileData变化
watch(
  () => props.mobileData,
  (newData) => {
    mobileItems.value = [...newData.items]
  },
  { deep: true }
)

// 监听 show 变化，当弹窗打开时如果没有关系标签池则获取
watch(
  () => show.value,
  (isShow) => {
    if (isShow && relationTagPool.value.length === 0) {
      fetchRelationTagPool()
    }
  }
)

onMounted(() => {
  // 获取关系标签池
  fetchRelationTagPool()
})

// 关闭弹窗
const handleClose = () => {
  editingItemId.value = null
  editingItem.value = null
  show.value = false
}

// 新增号码
const handleAdd = () => {
  editingItem.value = null
  const hasPrimary = mobileItems.value.some(item => item.isPrimary)
  editForm.value = {
    mobile: '',
    relationTagId: '',
    businessTags: [],
    isPrimary: hasPrimary ? 'secondary' : 'primary',
  }
  editingItemId.value = 'new'
}

// 编辑号码
const handleEditItem = (item: MobileItem) => {
  editingItem.value = item
  editForm.value = {
    mobile: item.mobile,
    relationTagId: item.relationTagId || '',
    businessTags: item.businessTags ? [...item.businessTags] : [],
    isPrimary: item.isPrimary ? 'primary' : 'secondary',
  }
  editingItemId.value = item.id
}

// 取消编辑
const handleCancelEdit = () => {
  editingItemId.value = null
  editingItem.value = null
  editForm.value = {
    mobile: '',
    relationTagId: '',
    businessTags: [],
    isPrimary: 'secondary',
  }
}

// 保存编辑
const handleSaveEdit = async () => {
  if (!editForm.value.mobile || !/^1[3-9]\d{9}$/.test(editForm.value.mobile)) {
    showToast('请输入正确的手机号')
    return
  }

  saving.value = true
  showLoadingToast({
    message: '保存中...',
    forbidClick: true,
  })

  try {
    const selectedTag = tagPool.value.find(tag => tag.id === editForm.value.relationTagId)
    const isPrimary = editForm.value.isPrimary === 'primary'
    
    // 如果设置为主号，需要先将原来的主号改为副号
    if (isPrimary) {
      const currentPrimary = mobileItems.value.find(item => item.isPrimary && item.id !== editingItem.value?.id)
      if (currentPrimary) {
        // 将原主号改为副号
        await customerApi.updateMobileItem({
          id: currentPrimary.id,
          mobile: currentPrimary.mobile,
          relationTagId: currentPrimary.relationTagId,
          relationTagName: currentPrimary.relationTagName,
          businessTags: currentPrimary.businessTags,
          isPrimary: false,
        })
      }
    }
    
    if (editingItem.value) {
      // 更新现有号码
      const res = await customerApi.updateMobileItem({
        id: editingItem.value.id,
        mobile: editForm.value.mobile,
        relationTagId: editForm.value.relationTagId || undefined,
        relationTagName: selectedTag?.name,
        businessTags: editForm.value.businessTags,
        isPrimary,
      })
      
      if (res.code === 200) {
        const index = mobileItems.value.findIndex((item) => item.id === editingItem.value!.id)
        if (index > -1) {
          mobileItems.value[index] = res.data
        }
        // 如果设置为主号，更新原主号状态
        if (isPrimary) {
          const currentPrimaryIndex = mobileItems.value.findIndex(item => item.isPrimary && item.id !== editingItem.value!.id)
          if (currentPrimaryIndex > -1) {
            mobileItems.value[currentPrimaryIndex] = {
              ...mobileItems.value[currentPrimaryIndex],
              isPrimary: false,
            }
          }
        }
        showToast('更新成功')
        editingItemId.value = null
        editingItem.value = null
        emitUpdate()
      }
    } else {
      // 新增号码
      const res = await customerApi.addMobileItem({
        mobile: editForm.value.mobile,
        relationTagId: editForm.value.relationTagId || undefined,
        relationTagName: selectedTag?.name,
        businessTags: editForm.value.businessTags,
        isPrimary,
      })
      
      if (res.code === 200) {
        mobileItems.value.push(res.data)
        // 如果设置为主号，更新原主号状态
        if (isPrimary) {
          const currentPrimaryIndex = mobileItems.value.findIndex(item => item.isPrimary && item.id !== res.data.id)
          if (currentPrimaryIndex > -1) {
            mobileItems.value[currentPrimaryIndex] = {
              ...mobileItems.value[currentPrimaryIndex],
              isPrimary: false,
            }
          }
        }
        showToast('添加成功')
        editingItemId.value = null
        editingItem.value = null
        editForm.value = {
          mobile: '',
          relationTagId: '',
          businessTags: [],
          isPrimary: 'secondary',
        }
        emitUpdate()
      }
    }
  } catch (error: any) {
    showToast(error.message || '保存失败，请重试')
  } finally {
    saving.value = false
    closeToast()
  }
}

// 删除号码
const handleDelete = async (id: string) => {
  if (!id) {
    showToast('无效的电话号码ID')
    return
  }

  const item = mobileItems.value.find((i) => i.id === id)
  if (!item) {
    showToast('电话号码不存在')
    return
  }

  if (item.isPrimary) {
    showToast('不能删除主号码')
    return
  }

  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除号码 ${item.mobile} 吗？`,
    })

    showLoadingToast({
      message: '删除中...',
      forbidClick: true,
    })

    const res = await customerApi.deleteMobileItem(id)
    if (res.code === 200) {
      mobileItems.value = mobileItems.value.filter((i) => i.id !== id)
      showToast('删除成功')
      emitUpdate()
    } else {
      showToast(res.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      showToast(error.message || '删除失败，请重试')
    }
  } finally {
    closeToast()
  }
}


// 触发更新事件
const emitUpdate = () => {
  const updatedData: MobileData = {
    items: mobileItems.value,
    isConflict: mobileItems.value.length > 1,
    editable: props.mobileData.editable,
  }
  emit('update', updatedData)
}
</script>

<style scoped lang="scss">
.mobile-editor {
  padding: 12px; // 减少内边距
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
}

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

.view-header {
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
    flex: 1;
    text-align: center;
  }

  .back-icon {
    font-size: 16px; // 统一图标大小
    color: #323233;
    cursor: pointer;
    padding: 3px; // 减少内边距
    flex-shrink: 0;
  }
}

.view-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.mobile-list {
  flex: 1;
  margin-bottom: 16px;
}

.mobile-item {
  background: white;
  border-radius: 6px; // 减小圆角
  padding: 12px 14px; // 增加内边距，突出号码显示
  margin-bottom: 8px; // 增加间距，让号码更突出

  &:last-child {
    margin-bottom: 0;
  }

  &.is-primary {
    border: 2px solid var(--van-tag-primary-color); // 加粗主号边框
    background: #f0f8ff; // 主号背景色
  }

  .mobile-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px; // 增加间距，让号码更突出

    .mobile-number {
      display: flex;
      align-items: center;
      gap: 6px; // 减少间距
      flex: 1;

      .number {
        font-size: 20px; // 放大电话号码显示
        font-weight: 700;
        color: #1a1a1a;
        letter-spacing: 0.5px; // 增加字间距，提升可读性
      }
      
      .mobile-input-field {
        flex: 1;
        padding: 0;
        
        :deep(.van-field__control) {
          font-size: 18px; // 放大输入框字体
          font-weight: 600;
        }
      }
    }

    .mobile-actions {
      display: flex;
      gap: 8px;
      align-items: center;

      .action-icon {
        font-size: 18px;
        cursor: pointer;

        &.edit-icon {
          color: var(--van-tag-primary-color);
        }

        &.delete-icon {
          color: #ee0a24;
        }
      }
      
      .van-button {
        min-width: 60px;
      }
    }
  }

  .mobile-item-content {
    .relation-tag-section,
    .business-tag-section {
      margin-bottom: 8px;
      padding: 12px;
      background: #f7f8fa;
      border-radius: 6px;

      .section-label {
        font-size: 12px; // 减小字体
        color: #323233;
        font-weight: 500;
        margin-bottom: 8px; // 减少间距
      }

      .tag-empty {
        padding: 8px 0;
        text-align: center;

        .empty-text {
          font-size: 12px;
          color: #969799;
        }
      }

      .tag-options {
        display: flex;
        flex-wrap: wrap;
        gap: 6px; // 减少间距

        .tag-option {
          cursor: pointer;
          transition: all 0.2s;
          margin: 0 !important;
          display: inline-flex;
          align-items: center;
          border-radius: 4px;
          font-size: 12px;
          padding: 2px 8px;
          border: 1px solid #ebedf0 !important;
          background: #ffffff !important;
          color: #646566 !important;

          &:hover {
            border-color: var(--van-tag-primary-color) !important;
            color: var(--van-tag-primary-color) !important;
          }

          &.tag-selected {
            background: var(--van-tag-primary-color) !important;
            border-color: var(--van-tag-primary-color) !important;
            color: #ffffff !important;
            font-weight: 500;
          }
          
          .tag-check-icon {
            margin-left: 3px;
            font-size: 12px;
          }
          
          // 覆盖 van-tag 的默认样式
          :deep(.van-tag__text) {
            color: inherit;
            font-size: 12px;
          }
        }
      }
    }

    .update-time {
      font-size: 12px;
      color: #969799;
      padding-left: 8px;
    }
  }
  
  // 新增表单
  &.edit-form-new {
    border: 2px dashed var(--van-tag-primary-color);
    background: #f0f8ff;
  }
}

.number-type-selector-inline {
  margin-top: 12px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 6px;
  
  .selector-label {
    font-size: 14px;
    color: #323233;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .van-radio-group {
    display: flex;
    gap: 24px;
  }
}

.action-buttons {
  padding-top: 16px;
  border-top: 1px solid #ebedf0;
}

.edit-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 16px;
}

.relation-selector {
  margin-top: 12px; // 减少间距
  padding: 10px 12px; // 减少内边距
  background: #f7f8fa;
  border-radius: 6px; // 减小圆角

  .selector-label {
    font-size: 12px; // 减小字体
    color: #323233;
    margin-bottom: 8px; // 减少间距
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;

    .label-hint {
      font-size: 12px;
      color: #969799;
      font-weight: normal;

      &.selected {
        color: var(--van-tag-primary-color);
      }
    }
  }

  .tag-empty {
    padding: 20px 0;
  }

  .tag-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .tag-option {
      cursor: pointer;
      transition: all 0.2s;
      margin: 0 !important;
      display: inline-flex;
      align-items: center;
      border-radius: 4px;
      font-size: 12px;
      padding: 2px 8px;
      border: 1px solid #ebedf0 !important;
      background: #ffffff !important;
      color: #646566 !important;

      &:hover {
        border-color: var(--van-tag-primary-color) !important;
        color: var(--van-tag-primary-color) !important;
      }

      &.tag-selected {
        background: var(--van-tag-primary-color) !important;
        border-color: var(--van-tag-primary-color) !important;
        color: #ffffff !important;
        font-weight: 500;
      }
      
      .tag-check-icon {
        margin-left: 3px;
        font-size: 12px;
      }
      
      // 覆盖 van-tag 的默认样式
      :deep(.van-tag__text) {
        color: inherit;
        font-size: 12px;
      }
    }
  }
}

.number-type-selector {
  margin-top: 12px; // 减少间距
  padding: 10px 12px; // 减少内边距
  background: #f7f8fa;
  border-radius: 6px; // 减小圆角

  .selector-label {
    font-size: 12px; // 减小字体
    color: #323233;
    margin-bottom: 8px; // 减少间距
    font-weight: 500;
  }

  .van-radio-group {
    display: flex;
    gap: 24px;
  }

  .type-hint {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #969799;

    .van-icon {
      font-size: 14px;
    }
  }
}

.edit-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #ebedf0;

  .van-button {
    flex: 1;
  }
}

.edit-actions-inline {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebedf0;

  .van-button {
    flex: 1;
  }
}

</style>
