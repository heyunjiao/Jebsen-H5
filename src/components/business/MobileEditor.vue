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
                  <span class="number">{{ item.mobile }}</span>
                  <van-tag v-if="item.isPrimary" type="primary">主号码</van-tag>
                  <van-tag v-if="item.source" type="default">{{ item.source }}</van-tag>
                </div>
                <div class="mobile-actions">
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
                </div>
              </div>
              <div class="mobile-item-content">
                <div class="relation-tag">
                  <span class="label">关系标签：</span>
                  <van-tag
                    v-if="item.relationTagName"
                    :style="{ 
                      backgroundColor: getTagColor(item.relationTagId),
                      color: '#fff',
                      fontWeight: '600'
                    }"
                    size="medium"
                  >
                    {{ item.relationTagName }}
                  </van-tag>
                  <span v-else class="no-tag">
                    <van-tag type="default" plain size="small">未设置</van-tag>
                  </span>
                  <van-icon
                    name="arrow"
                    class="select-icon"
                    @click="handleSelectRelation(item)"
                  />
                </div>
                <div v-if="item.updateTime" class="update-time">
                  更新时间：{{ item.updateTime }}
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <van-button
              type="primary"
              size="large"
              icon="plus"
              @click="handleAdd"
              block
            >
              新增号码
            </van-button>
            <van-button
              v-if="mobileItems.length > 1"
              type="warning"
              size="large"
              icon="setting"
              @click="handleMerge"
              block
              style="margin-top: 12px"
            >
              合并号码
            </van-button>
          </div>
        </div>

        <!-- 新增/编辑号码视图 -->
        <div v-if="currentView === 'edit'" class="view-content">
          <div class="view-header">
            <van-icon name="arrow-left" class="back-icon" @click="currentView = 'list'" />
            <h3>{{ editingItem ? '编辑号码' : '新增号码' }}</h3>
            <div style="width: 24px;"></div>
          </div>
          <div class="edit-content">
            <van-field
              v-model="editForm.mobile"
              label="电话号码"
              placeholder="请输入11位手机号"
              :rules="mobileRules"
              clearable
            />
            <div class="relation-selector">
              <div class="selector-label">
                <span>关系标签</span>
                <span v-if="!editForm.relationTagId" class="label-hint">（请选择）</span>
                <span v-else class="label-hint selected">
                  （已选择：{{ tagPool.find(t => t.id === editForm.relationTagId)?.name }}）
                </span>
              </div>
              <div v-if="tagPool.length === 0" class="tag-empty">
                <van-empty description="暂无标签数据" :image-size="60" />
              </div>
              <div v-else class="tag-options">
                <van-tag
                  v-for="tag in tagPool"
                  :key="tag.id"
                  :type="editForm.relationTagId === tag.id ? 'primary' : 'default'"
                  size="medium"
                  :style="{
                    backgroundColor:
                      editForm.relationTagId === tag.id
                        ? tag.color || '#1989fa'
                        : '#f7f8fa',
                    color: editForm.relationTagId === tag.id ? '#fff' : '#323233',
                    border: editForm.relationTagId === tag.id ? `1px solid ${tag.color || '#1989fa'}` : '1px solid #ebedf0',
                  }"
                  @click="editForm.relationTagId = editForm.relationTagId === tag.id ? '' : tag.id"
                  class="tag-option"
                  :class="{ 'tag-selected': editForm.relationTagId === tag.id }"
                >
                  {{ tag.name }}
                </van-tag>
              </div>
            </div>
            <div class="number-type-selector">
              <div class="selector-label">
                <span>号码类型</span>
              </div>
              <van-radio-group v-model="editForm.isPrimary" direction="horizontal">
                <van-radio 
                  name="primary" 
                  :disabled="mobileItems.some(item => item.isPrimary && (!editingItem || item.id !== editingItem.id))"
                >
                  <span>主号</span>
                </van-radio>
                <van-radio name="secondary">
                  <span>副号</span>
                </van-radio>
              </van-radio-group>
              <div v-if="mobileItems.some(item => item.isPrimary && (!editingItem || item.id !== editingItem.id))" class="type-hint">
                <van-icon name="info-o" />
                <span>{{ editingItem ? '已存在主号，无法设置为主号' : '已存在主号，新增号码将自动设置为副号' }}</span>
              </div>
            </div>
            <div class="edit-actions">
              <van-button
                type="default"
                size="large"
                @click="currentView = 'list'"
              >
                取消
              </van-button>
              <van-button
                type="primary"
                size="large"
                :loading="saving"
                @click="handleSaveEdit"
              >
                保存
              </van-button>
            </div>
          </div>
        </div>

        <!-- 选择关系标签视图 -->
        <div v-if="currentView === 'relation'" class="view-content">
          <div class="view-header">
            <van-icon name="arrow-left" class="back-icon" @click="currentView = 'list'" />
            <h3>选择关系标签</h3>
            <div style="width: 24px;"></div>
          </div>
          <div class="selector-content">
            <div class="number-type-section">
              <div class="section-title">号码类型</div>
              <van-radio-group v-model="selectedNumberType" direction="horizontal">
                <van-radio 
                  name="primary" 
                  :disabled="mobileItems.some(item => item.isPrimary && item.id !== currentRelationItem?.id)"
                >
                  <span>主号</span>
                </van-radio>
                <van-radio name="secondary">
                  <span>副号</span>
                </van-radio>
              </van-radio-group>
              <div v-if="mobileItems.some(item => item.isPrimary && item.id !== currentRelationItem?.id)" class="type-hint">
                <van-icon name="info-o" />
                <span>已存在主号，无法设置为主号</span>
              </div>
            </div>
            <div class="relation-tag-section">
              <div class="section-title">关系标签</div>
              <div v-if="tagPool.length === 0" class="tag-empty">
                <van-empty description="暂无标签数据" :image-size="60" />
              </div>
              <div
                v-for="tag in tagPool"
                :key="tag.id"
                class="tag-option-item"
                :class="{ active: selectedRelationTagId === tag.id }"
                @click="selectedRelationTagId = selectedRelationTagId === tag.id ? '' : tag.id"
              >
                <van-tag
                  :style="{ backgroundColor: tag.color }"
                  size="medium"
                >
                  {{ tag.name }}
                </van-tag>
                <van-icon
                  v-if="selectedRelationTagId === tag.id"
                  name="success"
                  color="#52c41a"
                />
              </div>
            </div>
            <div class="relation-actions">
              <van-button
                type="default"
                size="large"
                @click="currentView = 'list'"
              >
                取消
              </van-button>
              <van-button
                type="primary"
                size="large"
                :disabled="!selectedRelationTagId"
                @click="handleConfirmRelation"
              >
                确认
              </van-button>
            </div>
          </div>
        </div>

        <!-- 合并号码视图 -->
        <div v-if="currentView === 'merge'" class="view-content">
          <div class="view-header">
            <van-icon name="arrow-left" class="back-icon" @click="currentView = 'list'" />
            <h3>合并号码</h3>
            <div style="width: 24px;"></div>
          </div>
          <div class="merge-content">
            <div class="merge-tips">
              请选择要合并的号码，合并后将保留主号码，其他号码将被删除
            </div>
            <van-checkbox-group v-model="selectedMergeIds">
              <div
                v-for="item in mobileItems"
                :key="item.id"
                class="merge-item"
              >
                <van-checkbox :name="item.id" :disabled="item.isPrimary">
                  <div class="merge-item-content">
                    <div class="merge-number">{{ item.mobile }}</div>
                    <div class="merge-info">
                      <span v-if="item.relationTagName" class="merge-tag">
                        {{ item.relationTagName }}
                      </span>
                      <span v-if="item.isPrimary" class="merge-primary">主号码</span>
                    </div>
                  </div>
                </van-checkbox>
              </div>
            </van-checkbox-group>
            <div class="merge-actions">
              <van-button
                type="default"
                size="large"
                @click="currentView = 'list'"
              >
                取消
              </van-button>
              <van-button
                type="primary"
                size="large"
                :loading="merging"
                :disabled="selectedMergeIds.length === 0"
                @click="handleConfirmMerge"
              >
                确认合并
              </van-button>
            </div>
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
const currentView = ref<'list' | 'edit' | 'relation' | 'merge'>('list')
const editingItem = ref<MobileItem | null>(null)
const currentRelationItem = ref<MobileItem | null>(null)
const selectedRelationTagId = ref<string>('')
const selectedNumberType = ref<'primary' | 'secondary'>('secondary')
const selectedMergeIds = ref<string[]>([])
const saving = ref(false)
const merging = ref(false)

const editForm = ref({
  mobile: '',
  relationTagId: '',
  isPrimary: 'secondary' as 'primary' | 'secondary',
})

const mobileRules = [
  { required: true, message: '请输入手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
]

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

// 获取标签颜色
const getTagColor = (tagId?: string) => {
  if (!tagId) return '#f7f8fa'
  const tag = tagPool.value.find((t) => t.id === tagId)
  return tag?.color || '#1989fa'
}

// 关闭弹窗
const handleClose = () => {
  currentView.value = 'list'
  show.value = false
}

// 新增号码
const handleAdd = () => {
  editingItem.value = null
  const hasPrimary = mobileItems.value.some(item => item.isPrimary)
  editForm.value = {
    mobile: '',
    relationTagId: '',
    isPrimary: hasPrimary ? 'secondary' : 'primary',
  }
  currentView.value = 'edit'
}

// 编辑号码
const handleEditItem = (item: MobileItem) => {
  editingItem.value = item
  editForm.value = {
    mobile: item.mobile,
    relationTagId: item.relationTagId || '',
    isPrimary: item.isPrimary ? 'primary' : 'secondary',
  }
  currentView.value = 'edit'
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
    const selectedTag = tagPool.value.find((t) => t.id === editForm.value.relationTagId)
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
        currentView.value = 'list'
        emitUpdate()
      }
    } else {
      // 新增号码
      const res = await customerApi.addMobileItem({
        mobile: editForm.value.mobile,
        relationTagId: editForm.value.relationTagId || undefined,
        relationTagName: selectedTag?.name,
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
        currentView.value = 'list'
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

// 选择关系标签
const handleSelectRelation = (item: MobileItem) => {
  currentRelationItem.value = item
  selectedRelationTagId.value = item.relationTagId || ''
  selectedNumberType.value = item.isPrimary ? 'primary' : 'secondary'
  currentView.value = 'relation'
}

// 确认关系标签
const handleConfirmRelation = async () => {
  if (!currentRelationItem.value || !selectedRelationTagId.value) return

  const selectedTag = tagPool.value.find((t) => t.id === selectedRelationTagId.value)
  if (!selectedTag) return

  const isPrimary = selectedNumberType.value === 'primary'

  // 如果设置为主号，需要先将原来的主号改为副号
  if (isPrimary) {
    const currentPrimary = mobileItems.value.find(item => item.isPrimary && item.id !== currentRelationItem.value?.id)
    if (currentPrimary) {
      // 将原主号改为副号
      await customerApi.updateMobileItem({
        id: currentPrimary.id,
        mobile: currentPrimary.mobile,
        relationTagId: currentPrimary.relationTagId,
        relationTagName: currentPrimary.relationTagName,
        isPrimary: false,
      })
    }
  }

  showLoadingToast({
    message: '更新中...',
    forbidClick: true,
  })

  try {
    const res = await customerApi.updateMobileItem({
      id: currentRelationItem.value.id,
      mobile: currentRelationItem.value.mobile,
      relationTagId: selectedTag.id,
      relationTagName: selectedTag.name,
      isPrimary,
    })

    if (res.code === 200) {
      const index = mobileItems.value.findIndex(
        (item) => item.id === currentRelationItem.value!.id
      )
      if (index > -1) {
        mobileItems.value[index] = res.data
      }
      // 如果设置为主号，更新原主号状态
      if (isPrimary) {
        const currentPrimaryIndex = mobileItems.value.findIndex(item => item.isPrimary && item.id !== currentRelationItem.value!.id)
        if (currentPrimaryIndex > -1) {
          mobileItems.value[currentPrimaryIndex] = {
            ...mobileItems.value[currentPrimaryIndex],
            isPrimary: false,
          }
        }
      }
      showToast('更新成功')
      currentView.value = 'list'
      emitUpdate()
    }
  } catch (error: any) {
    showToast(error.message || '更新失败，请重试')
  } finally {
    closeToast()
  }
}

// 合并号码
const handleMerge = () => {
  selectedMergeIds.value = []
  currentView.value = 'merge'
}

// 确认合并
const handleConfirmMerge = async () => {
  if (selectedMergeIds.value.length === 0) {
    showToast('请选择要合并的号码')
    return
  }

  merging.value = true
  showLoadingToast({
    message: '合并中...',
    forbidClick: true,
  })

  try {
    const res = await customerApi.mergeMobileItems(selectedMergeIds.value)
    if (res.code === 200) {
      mobileItems.value = res.data.items
      showToast('合并成功')
      currentView.value = 'list'
      emitUpdate()
    }
  } catch (error: any) {
    showToast(error.message || '合并失败，请重试')
  } finally {
    merging.value = false
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
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebedf0;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #323233;
  }

  .van-icon {
    font-size: 20px;
    color: #969799;
    cursor: pointer;
  }
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebedf0;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #323233;
    flex: 1;
    text-align: center;
  }

  .back-icon {
    font-size: 20px;
    color: #323233;
    cursor: pointer;
    padding: 4px;
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
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  &.is-primary {
    border: 1px solid #1989fa;
  }

  .mobile-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .mobile-number {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;

      .number {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
      }
    }

    .mobile-actions {
      display: flex;
      gap: 12px;

      .action-icon {
        font-size: 18px;
        cursor: pointer;

        &.edit-icon {
          color: #1989fa;
        }

        &.delete-icon {
          color: #ee0a24;
        }
      }
    }
  }

  .mobile-item-content {
    .relation-tag {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      padding: 8px;
      background: #f7f8fa;
      border-radius: 6px;

      .label {
        font-size: 14px;
        color: #323233;
        font-weight: 500;
        flex-shrink: 0;
      }

      .no-tag {
        flex: 1;
      }

      .select-icon {
        font-size: 16px;
        color: #1989fa;
        cursor: pointer;
        margin-left: auto;
        flex-shrink: 0;
        padding: 4px;
        transition: transform 0.2s;

        &:hover {
          transform: translateX(2px);
        }
      }
    }

    .update-time {
      font-size: 12px;
      color: #969799;
      padding-left: 8px;
    }
  }
}

.action-buttons {
  padding-top: 16px;
  border-top: 1px solid #ebedf0;
}

.edit-dialog,
.relation-selector-popup,
.merge-dialog {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.edit-content,
.selector-content,
.merge-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 16px;
}

.relation-selector {
  margin-top: 16px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;

  .selector-label {
    font-size: 14px;
    color: #323233;
    margin-bottom: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;

    .label-hint {
      font-size: 12px;
      color: #969799;
      font-weight: normal;

      &.selected {
        color: #1989fa;
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
    max-height: 200px;
    overflow-y: auto;

    .tag-option {
      cursor: pointer;
      transition: all 0.2s;
      margin: 0;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      &.tag-selected {
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
    }
  }
}

.number-type-selector {
  margin-top: 16px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;

  .selector-label {
    font-size: 14px;
    color: #323233;
    margin-bottom: 12px;
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

.edit-actions,
.merge-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #ebedf0;

  .van-button {
    flex: 1;
  }
}

.tag-option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ebedf0;
  }

  &:active,
  &.active {
    background: #e8f4ff;
    border: 1px solid #1989fa;
  }
}

.tag-empty {
  padding: 40px 0;
  text-align: center;
}

.number-type-section,
.relation-tag-section {
  margin-bottom: 24px;

  .section-title {
    font-size: 14px;
    color: #323233;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .van-radio-group {
    display: flex;
    gap: 24px;
    margin-bottom: 12px;
  }

  .type-hint {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #969799;
    margin-top: 8px;

    .van-icon {
      font-size: 14px;
    }
  }
}

.relation-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #ebedf0;

  .van-button {
    flex: 1;
  }
}

.merge-tips {
  padding: 12px;
  background: #fff7e6;
  border-radius: 8px;
  font-size: 14px;
  color: #d46b08;
  margin-bottom: 16px;
}

.merge-item {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;

  .merge-item-content {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .merge-number {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
    }

    .merge-info {
      display: flex;
      gap: 8px;
      align-items: center;

      .merge-tag {
        font-size: 12px;
        color: #969799;
      }

      .merge-primary {
        font-size: 12px;
        color: #1989fa;
      }
    }
  }
}
</style>

