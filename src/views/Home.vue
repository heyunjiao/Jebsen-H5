<template>
  <div class="home-container">
    <!-- 顶部状态栏系统 -->
    <div class="alert-system">
      <!-- 冲突提示（最顶部优先显示）- 弹幕滚动 -->
      <van-notice-bar
        v-if="customerStore.profile?.nameMobileConflict && customerStore.profile.nameMobileConflict.length > 0"
        left-icon="warning-o"
        color="#B45309"
        background="#FFFBEB"
        scrollable
        class="alert-bar conflict-alert-bar"
        @click="showConflictResolver = true"
      >
        ⚠️ 该顾客疑似存在多条记录冲突，请核实身份信息
      </van-notice-bar>

      <!-- 最新操作这个客户的信息提示，点击弹窗显示操作日志 - 弹幕滚动 -->
      <van-notice-bar
        v-if="latestOperationText || customerStore.profile?.latestOperation"
        left-icon="info-o"
        color="#94724A"
        background="#FEF9F3"
        scrollable
        class="alert-bar operation-alert-bar"
        @click="showOperationLogDialog = true"
      >
        {{ latestOperationText || '该顾客已被 Rebecca Z. 人工更新' }}<span v-if="customerStore.profile?.latestOperation?.operationTime" class="operation-time"> {{ formatOperationTime(customerStore.profile.latestOperation.operationTime) }} ›</span>
      </van-notice-bar>
    </div>



    <!-- <span
          class="source-link"
          @click="showPlatformFlow = true"
        >
          查看溯源信息
        </span> -->
    <!-- 首屏内容 -->
    <div v-if="!customerStore.loading && customerStore.profile" class="first-screen">
      <!-- 沉浸式头部：参考图片排版，带多个Jebsen水印 -->
      <div class="premium-header">
        <!-- 多个Jebsen水印背景 - 铺满背景 -->
        <div class="watermark-bg"></div>
        <div class="header-main">
          <!-- 左侧头像 -->
          <div class="avatar-wrapper">
            <div class="avatar-circle">
              <span class="avatar-text">{{ String(customerStore.profile.name?.value || 'XX').charAt(0) }}</span>
            </div>
          </div>
          <!-- 右侧信息 -->
          <div class="header-info-wrapper">
            <div class="user-name-row">
              <div class="name-left">
                <h1>{{ customerStore.profile.name?.value || 'XX' }}</h1>
                <!-- 溯源追踪 icon：点击查看原平台溯源信息 -->
                <van-icon
                  name="cluster-o"
                  class="trace-icon"
                  @click="showPlatformFlow = true"
                />
              </div>
              <div class="meta-right">
                <span class="oneid-pill">ONEID：{{ customerStore.profile.id }}</span>
                <span v-if="customerStore.profile?.customerType?.value" class="customer-type-badge">
                  <van-icon :name="customerTypeIcon" />
                  {{ customerStore.profile.customerType.value === '个人' ? '个人' : customerStore.profile.customerType.value === '公司' ? '公司' : String(customerStore.profile.customerType.value) }}
                </span>
              </div>
            </div>
            <div class="header-tags">
              <span 
                v-for="(tag, index) in displayedHeaderTags" 
                :key="index"
                :class="getHeaderTagClass(tag)"
                :style="{ cursor: isOpportunityTag(tag) ? 'pointer' : 'default' }"
                @click="isOpportunityTag(tag) ? (showOpportunityDialog = true) : undefined"
              >
                <van-icon v-if="getTagIcon(tag)" :name="getTagIcon(tag)" class="tag-icon" />
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 手机号区域：极致负边距嵌入头部 -->
      <div class="phone-card">
        <div class="phone-entry">
          <div
            v-for="(item, index) in displayedPhones"
            :key="item.id"
          >
            <div class="phone-row">
              <span class="num-val" :class="{ 'is-secondary': !item.isPrimary }">
                {{ item.formattedMobile || formatMobile(item.mobile) }}
              </span>
              <div class="num-tags">
                <span v-if="item.isPrimary" class="n-tag active">主号</span>
                <template v-if="item.businessTags && item.businessTags.length > 0">
                  <span
                    v-for="(businessTag, tagIndex) in item.businessTags"
                    :key="tagIndex"
                    class="n-tag"
                    :class="{ 'active': businessTag === '车主' }"
                  >
                    {{ businessTag }}
                  </span>
                </template>
                <!-- 显示关系标签（如"送"、"送修人"、"配偶"） -->
                <span v-if="item.relationTagName && !item.isPrimary" class="n-tag">
                  {{ item.relationTagName }}
                </span>
              </div>
              <span 
                v-if="item.isPrimary && customerStore.profile.mobile && 'items' in customerStore.profile.mobile && customerStore.profile.mobile.editable"
                class="edit-icon"
                @click="showMobileManager = true"
              >✏️</span>
            </div>
            <!-- 分隔线：在两个手机号之间显示 -->
            <div v-if="index < displayedPhones.length - 1" class="phone-divider"></div>
          </div>
        </div>
      </div>

      <!-- 资产档案（车辆信息） -->
      <div class="container">
        <div class="block-h">
          <span class="title-text">车辆信息 ({{ customerStore.vehicles.length }})</span>
          <span class="block-more" @click="showVehicleDialog = true">查看更多 ›</span>
        </div>
        <div class="asset-box">
          <div
            v-for="vehicle in displayedVehicles"
            :key="vehicle.id"
            class="asset-row"
          >
            <span class="model-name ellipsis">{{ vehicle.vehicleModel }}</span>
            <span class="plate-val ellipsis">{{ vehicle.licensePlate || '未知' }}</span>
            <span class="vin-val ellipsis">{{ vehicle.vin || '未知' }}</span>
            <span 
              class="status-text"
              @click="openVehicleStatusSheet(vehicle.id)"
            >{{ vehicle.status }}</span>
            <van-action-sheet
              v-model:show="vehicleStatusSheets[vehicle.id]"
              :actions="vehicleStatusOptions"
              @select="(action: any) => handleVehicleStatusChange(vehicle.id, action.value)"
              cancel-text="取消"
            />
          </div>
        </div>
      </div>

      <!-- 账户权益 -->
      <div class="container" v-if="nearestExpiringAsset">
        <div class="block-h">
          <span class="title-text">资产信息</span>
          <span class="block-more" @click="handleCouponCardClick">查看更多 ›</span>
        </div>
        <div class="asset-coupon-box">
          <div class="asset-coupon-name">{{ nearestExpiringAsset.name }} <small>至 {{ nearestExpiringAsset.validTo }}</small></div>
          <div class="asset-coupon-amount">¥{{ formatAmount(nearestExpiringAsset.amount || 0) }}</div>
        </div>
      </div>

      <!-- 画像标签 -->
      <div class="container">
        <div class="block-h">
          <span class="title-text">画像标签</span>
          <span class="block-more" @click="showTagManager = true">编辑标签 ›</span>
        </div>
        <div class="tags-list-container">
          <span
            v-for="(tag, index) in customerStore.profile.tags"
            :key="index"
            class="tag-item-custom"
            :class="getTagCustomClass(tag)"
            :style="getTagStyle(tag)"
            @click="showTagManager = true"
          >
            {{ tag }}
          </span>
          <span v-if="customerStore.profile.tags.length === 0" class="empty-tags-text">暂无标签</span>
        </div>
      </div>

      <!-- 基础档案 -->
      <div class="container">
        <div class="block-h">
          <span class="title-text">基础档案</span>
          <span class="block-more" @click="showPlatformFlow = true">查看更多 ›</span>
        </div>
        <div class="info-grid">
          <div class="info-node">
            <div class="node-l">姓名</div>
            <div class="node-v">{{ customerStore.profile.name.value || '未知' }}</div>
          </div>
          <div class="info-node">
            <div class="node-l">年龄</div>
            <div class="node-v">{{ customerStore.profile.age.value || '未知' }}</div>
          </div>
          <div class="info-node">
            <div class="node-l">性别</div>
            <div class="node-v">{{ customerStore.profile.gender.value || '未知' }}</div>
          </div>
          <div class="info-node">
            <div class="node-l">城市</div>
            <div class="node-v">{{ customerStore.profile.city.value || '未知' }}</div>
          </div>
        </div>
      </div>

      <!-- Tab 切换（维保、保险、沟通记录） -->
      <div class="container tab-container">
        <div class="tab-nav-wrapper">
          <div 
            class="tab-nav-item" 
            :class="{ active: activeTab === 'maintenance' }"
            @click="activeTab = 'maintenance'"
          >
            维保记录
          </div>
          <div 
            class="tab-nav-item" 
            :class="{ active: activeTab === 'insurance' }"
            @click="activeTab = 'insurance'"
          >
            保险合同
          </div>
          <div 
            class="tab-nav-item" 
            :class="{ active: activeTab === 'communication' }"
            @click="activeTab = 'communication'"
          >
            沟通记录
          </div>
        </div>
        
        <!-- Tab 内容 -->
        <div class="tab-content-wrapper">
          <div v-if="activeTab === 'maintenance'" class="tab-content">
            <MaintenanceRecords />
          </div>
          <div v-if="activeTab === 'insurance'" class="tab-content">
            <Maintenance />
          </div>
          <div v-if="activeTab === 'communication'" class="tab-content">
            <CommunicationRecords />
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <van-loading
      v-if="customerStore.loading"
      type="spinner"
      vertical
      class="loading"
    >
      加载中...
    </van-loading>

    <!-- 预约信息卡片（提前显示，业务人员重点关注） -->
    <!-- <div v-if="customerStore.appointments && customerStore.appointments.length > 0 && !customerStore.loading" class="appointment-card-top">
      <div class="card-header">
        <div class="card-title">预约信息</div>
      </div>
      <div class="card-content">
        <div
          v-for="appointment in customerStore.appointments"
          :key="appointment.id"
          class="appointment-item"
        >
          <div class="appointment-header">
            <div class="appointment-type">{{ appointment.type }}</div>
            <van-tag
              :type="getAppointmentStatusType(appointment.status)"
              :size="'small' as any"
            >
              {{ appointment.status }}
            </van-tag>
          </div>
          <div class="appointment-info">
            <div class="info-row">
              <span class="label">预约时间：</span>
              <span class="value">{{ appointment.date }} {{ appointment.time }}</span>
            </div>
            <div class="info-row">
              <span class="label">预约门店：</span>
              <span class="value">{{ appointment.store }}</span>
            </div>
            <div v-if="appointment.vehicleModel" class="info-row">
              <span class="label">相关车型：</span>
              <span class="value">{{ appointment.vehicleModel }}</span>
            </div>
            <div v-if="appointment.description" class="info-row">
              <span class="label">预约描述：</span>
              <span class="value">{{ appointment.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div> -->




    <!-- 客户标签选择器弹窗 -->
    <van-popup
      v-model:show="showTagSelector"
      position="bottom"
      :style="{ height: '60%' }"
      round
    >
      <div class="tag-selector">
        <div class="popup-header">
          <h3>选择标签</h3>
          <van-icon name="cross" @click="showTagSelector = false" />
        </div>
        <div class="popup-content">
          <div
            v-for="tag in availableTags"
            :key="tag.id"
            class="tag-option"
            @click="handleAddTag(tag.id)"
          >
            <van-tag
              :type="getTagType(tag.name)"
              size="medium"
              :style="{ backgroundColor: tag.color }"
            >
              {{ tag.name }}
            </van-tag>
            <van-icon
              v-if="isTagSelected(tag.name)"
              name="success"
              color="#52c41a"
            />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 用户偏好标签选择器弹窗（多选） -->
    <van-popup
      v-model:show="showPreferredCarTagSelector"
      position="bottom"
      :style="{ height: '60%' }"
      round
    >
      <div class="tag-selector">
        <div class="popup-header">
          <h3>选择标签（可多选）</h3>
          <van-icon name="cross" @click="closePreferredCarTagSelector" />
        </div>
        <div class="popup-content">
          <div
            v-for="tag in customerStore.tagPool"
            :key="tag.id"
            class="tag-option"
            :class="{ 'is-selected': isPreferredCarTagSelected(tag.name) }"
            @click="togglePreferredCarTag(tag.name)"
          >
            <van-tag
              :type="getTagType(tag.name)"
              size="medium"
              :style="{ backgroundColor: tag.color }"
            >
              {{ tag.name }}
            </van-tag>
            <van-icon
              v-if="isPreferredCarTagSelected(tag.name)"
              name="success"
              color="#52c41a"
            />
          </div>
        </div>
        <div class="popup-footer">
          <van-button
            type="default"
            size="large"
            @click="closePreferredCarTagSelector"
          >
            取消
          </van-button>
          <van-button
            type="primary"
            size="large"
            :loading="savingPreferredCarTags"
            @click="handleSavePreferredCarTags"
          >
            确定
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 冲突处理弹窗 -->
    <ConflictResolver
      v-if="customerStore.profile?.nameMobileConflict"
      v-model:show="showConflictResolver"
      :conflicts="customerStore.profile.nameMobileConflict"
      @submitted="handleConflictSubmitted"
    />

    <!-- 平台溯源流程图 -->
    <PlatformFlow
      v-model:show="showPlatformFlow"
      :sources="customerStore.platformSources"
      :customer-id="customerStore.profile?.id"
    />

    <!-- 电话号码管理弹窗 -->
    <MobileEditor
      v-if="customerStore.profile?.mobile && 'items' in customerStore.profile.mobile"
      v-model="showMobileManager"
      :mobile-data="customerStore.profile.mobile as MobileData"
      @update="handleMobileUpdate"
    />

    <!-- 操作日志弹窗 -->
    <OperationLogDialog
      v-model:show="showOperationLogDialog"
      :logs="customerStore.operationLogs"
      :loading="operationLogsLoading"
    />

    <!-- 商机信息弹窗 -->
    <van-popup
      v-model:show="showOpportunityDialog"
      position="bottom"
      :style="{ height: '70%' }"
      round
      lock-scroll
    >
      <div class="opportunity-dialog">
        <div class="popup-header">
          <h3>商机信息</h3>
          <van-icon name="cross" @click="showOpportunityDialog = false" />
        </div>
        <div class="popup-content">
          <div
            v-for="opportunity in customerStore.opportunities"
            :key="opportunity.id"
            class="opportunity-item"
          >
            <div class="opportunity-header">
              <div class="opportunity-type-wrapper">
                <van-tag
                  :type="getOpportunityTypeTagType(opportunity.type)"
                  :size="'small' as any"
                  class="opportunity-type-tag"
                >
                  {{ opportunity.type }}
                </van-tag>
              </div>
              <div class="opportunity-status-wrapper">
                <van-tag
                  :type="getOpportunityStatusType(opportunity.status)"
                  :size="'small' as any"
                >
                  {{ opportunity.status }}
                </van-tag>
                <van-tag
                  v-if="opportunity.pushStatus"
                  :type="getPushStatusType(opportunity.pushStatus)"
                  :size="'small' as any"
                  class="push-status-tag"
                >
                  {{ opportunity.pushStatus }}
                </van-tag>
              </div>
            </div>
            <div class="opportunity-info">
              <div class="info-row">
                <span class="label">触发规则：</span>
                <span class="value">{{ opportunity.triggerRule }}</span>
              </div>
              <div class="info-row">
                <span class="label">优先级：</span>
                <van-tag
                  :type="getPriorityType(opportunity.priority)"
                  :size="'small' as any"
                  class="priority-tag"
                >
                  {{ opportunity.priority }}
                </van-tag>
              </div>
              <div v-if="opportunity.pushTarget" class="info-row">
                <span class="label">推送目标：</span>
                <span class="value">{{ formatPushTarget(opportunity.pushTarget) }}</span>
              </div>
              <div class="info-row">
                <span class="label">创建时间：</span>
                <span class="value">{{ opportunity.createTime }}</span>
              </div>
              <template v-if="opportunity.description">
                <div
                  v-for="(item, index) in parseOpportunityDescription(opportunity.description)"
                  :key="index"
                  class="info-row"
                >
                  <span class="label">{{ item.label }}：</span>
                  <span class="value">{{ item.value }}</span>
                </div>
              </template>
            </div>
          </div>
          <div v-if="!customerStore.opportunities || customerStore.opportunities.length === 0" class="empty-state">
            <van-empty description="暂无商机信息" />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 车辆信息弹窗 -->
    <van-popup
      v-model:show="showVehicleDialog"
      position="bottom"
      :style="{ height: '70%' }"
      round
      lock-scroll
    >
      <div class="vehicle-dialog">
        <div class="popup-header">
          <h3>车辆信息</h3>
          <van-icon name="cross" @click="showVehicleDialog = false" />
        </div>
        <div class="popup-content">
          <div
            v-for="vehicle in customerStore.vehicles"
            :key="vehicle.id"
            class="vehicle-item-full"
          >
            <div class="vehicle-header">
              <div class="vehicle-model">{{ vehicle.vehicleModel }}</div>
              <div class="vehicle-status-wrapper" @click="openVehicleStatusSheet(vehicle.id)">
                <van-tag
                  :type="getVehicleStatusType(vehicle.status)"
                  :size="'small' as any"
                  class="status-tag-clickable"
                >
                  {{ vehicle.status }}
                </van-tag>
                <van-icon name="arrow-down" class="status-arrow-icon" />
              </div>
              <van-action-sheet
                v-model:show="vehicleStatusSheets[vehicle.id]"
                :actions="vehicleStatusOptions"
                @select="(action: any) => handleVehicleStatusChange(vehicle.id, action.value)"
                cancel-text="取消"
              />
            </div>
            <div class="vehicle-info">
              <div v-if="vehicle.licensePlate" class="info-item">
                <span class="label">车牌号：</span>
                <span class="value">{{ vehicle.licensePlate }}</span>
              </div>
              <div v-if="vehicle.vin" class="info-item">
                <span class="label">车架号：</span>
                <span class="value">{{ vehicle.vin }}</span>
              </div>
              <div v-if="vehicle.purchaseDate" class="info-item">
                <span class="label">购买日期：</span>
                <span class="value">{{ vehicle.purchaseDate }}</span>
              </div>
              <div v-if="vehicle.source" class="info-item">
                <span class="label">来源：</span>
                <span class="value">{{ vehicle.source }}</span>
              </div>
            </div>
          </div>
          <div v-if="!customerStore.vehicles || customerStore.vehicles.length === 0" class="empty-state">
            <van-empty description="暂无车辆信息" />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 资产信息弹窗 -->
    <van-popup
      v-model:show="showAssetDialog"
      position="bottom"
      :style="{ height: '70%' }"
      round
      lock-scroll
    >
      <div class="asset-dialog">
        <div class="popup-header">
          <h3>资产信息</h3>
          <van-icon name="cross" @click="showAssetDialog = false" />
        </div>
        <div class="popup-content">
          <div
            v-for="asset in customerStore.assets"
            :key="asset.id"
            class="asset-item"
          >
            <div class="card-header">
              <div class="record-title">{{ asset.name }}</div>
              <van-tag
                :type="getAssetStatusType(asset.status)"
                :size="'small' as any"
              >
                {{ asset.status }}
              </van-tag>
            </div>
            <div class="card-content">
              <div class="info-row">
                <span class="label">类型：</span>
                <span class="value">{{ asset.type === 'coupon' ? '优惠券' : '代金券' }}</span>
              </div>
              <div v-if="asset.amount" class="info-row">
                <span class="label">面额：</span>
                <span class="value amount">¥{{ formatAmount(asset.amount) }}</span>
              </div>
              <div v-if="asset.discount" class="info-row">
                <span class="label">折扣：</span>
                <span class="value">{{ (asset.discount * 10).toFixed(1) }}折</span>
              </div>
              <div class="info-row">
                <span class="label">有效期：</span>
                <span class="value">{{ asset.validFrom }} 至 {{ asset.validTo }}</span>
              </div>
              <div v-if="asset.source" class="info-row">
                <span class="label">来源：</span>
                <span class="value">{{ asset.source }}</span>
              </div>
            </div>
          </div>
          <div v-if="!customerStore.assets || customerStore.assets.length === 0" class="empty-state">
            <van-empty description="暂无资产信息" />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 标签管理弹窗（点击任意标签可操作所有标签） -->
    <van-popup
      v-model:show="showTagManager"
      position="bottom"
      :style="{ height: '70%' }"
      round
      lock-scroll
    >
      <div class="tag-manager">
        <div class="popup-header">
          <h3>管理标签</h3>
          <van-icon name="cross" @click="showTagManager = false" />
        </div>
        <div class="popup-content">
          <!-- 空状态 -->
          <div v-if="customerStore.tagPool.length === 0" class="empty-state">
            <van-empty description="标签数据加载中..." />
          </div>
          
          <div v-else-if="Object.keys(groupedTags).length === 0" class="empty-state">
            <van-empty description="暂无标签分类数据" />
            <div style="padding: 16px; font-size: 12px; color: #969799;">
              标签池数据: {{ customerStore.tagPool.length }} 条
            </div>
          </div>
          
          <!-- 按分类展示标签 -->
          <div
            v-else
            v-for="(tags, category) in groupedTags"
            :key="category"
            class="tag-category-section"
          >
            <div class="tag-category-title">
              <span class="category-name">{{ category }}</span>
              <span v-if="tags.some(t => t.required)" class="required-badge">必选</span>
              <span v-if="tags.some(t => t.minSelect)" class="min-select-badge">
                至少{{ tags.find(t => t.minSelect)?.minSelect }}项
              </span>
              <span class="selected-count">
                (已选{{ getSelectedCountInCategory(category) }}/{{ tags.length }})
              </span>
            </div>
            <div class="tag-list">
              <van-tag
                v-for="tag in tags"
                :key="tag.id"
                :type="isTagSelectedInManager(tag.name) ? 'primary' : 'default'"
                size="medium"
                class="tag-item"
                :class="{ 'is-selected': isTagSelectedInManager(tag.name) }"
                @click="toggleTag(tag.name)"
              >
                {{ tag.name }}
              </van-tag>
            </div>
          </div>
        </div>
        <div class="popup-footer">
          <van-button
            type="default"
            size="large"
            @click="showTagManager = false"
          >
            取消
          </van-button>
          <van-button
            type="primary"
            size="large"
            :loading="savingTags"
            @click="handleSaveTags"
          >
            确定
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 基础信息编辑弹窗 -->
    <van-popup
      v-model:show="showBasicInfoEditor"
      position="bottom"
      :style="{ height: '70%' }"
      round
      lock-scroll
    >
      <div class="basic-info-editor">
        <div class="popup-header">
          <h3>编辑基础信息</h3>
          <van-icon name="cross" @click="showBasicInfoEditor = false" />
        </div>
        <div class="popup-content">
          <van-form ref="basicInfoFormRef" @submit="handleSaveBasicInfo">
            <van-field
              v-model="basicInfoForm.name"
              name="name"
              label="姓名"
              placeholder="请输入姓名"
              clearable
            />
            <van-field
              v-model="basicInfoForm.age"
              name="age"
              label="年龄"
              type="number"
              placeholder="请输入年龄"
              clearable
            />
            <!-- 手机号已在姓名卡片中管理，这里不再显示 -->
            <van-field
              v-model="basicInfoForm.gender"
              name="gender"
              label="性别"
              placeholder="请输入性别"
              clearable
            />
            <van-field
              v-model="basicInfoForm.city"
              name="city"
              label="城市"
              placeholder="请输入城市"
              clearable
            />
            <van-field
              v-if="customerStore.profile?.customerType"
              v-model="basicInfoForm.customerType"
              name="customerType"
              label="客户类型"
              placeholder="请输入客户类型"
              clearable
            />
            <van-field
              v-model="basicInfoForm.reason"
              name="reason"
              label="更改理由"
              type="textarea"
              placeholder="请输入更改理由（必填）"
              rows="3"
              maxlength="200"
              show-word-limit
              :rules="[{ required: true, message: '请输入更改理由' }]"
            />
            <div class="edit-actions">
              <van-button
                type="default"
                size="large"
                native-type="button"
                @click="showBasicInfoEditor = false"
              >
                取消
              </van-button>
              <van-button
                type="primary"
                size="large"
                native-type="submit"
                :loading="savingBasicInfo"
                :disabled="savingBasicInfo"
              >
                提交
              </van-button>
            </div>
          </van-form>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCustomerStore } from '@/stores/customer'
import C360Field from '@/components/C360Field.vue'
import Maintenance from '@/views/Maintenance.vue'
import MaintenanceRecords from '@/views/MaintenanceRecords.vue'
import CommunicationRecords from '@/views/CommunicationRecords.vue'
import ConflictResolver from '@/components/business/ConflictResolver.vue'
import PlatformFlow from '@/components/business/PlatformFlow.vue'
import MobileEditor from '@/components/business/MobileEditor.vue'
import OperationLogDialog from '@/components/business/OperationLogDialog.vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { customerApi } from '@/api/customer'
import type { TagPool, MobileData } from '@/api/customer'
// 导入 Lucide 图标
import { Phone, CarFront, Ticket, Tag, UserCircle, Edit2 } from 'lucide-vue-next'

const customerStore = useCustomerStore()
const activeTab = ref('maintenance')
const showTagSelector = ref(false)
const showTagManager = ref(false)
const showPreferredCarTagSelector = ref(false)
const selectedPreferredCarTags = ref<string[]>([])
const savingPreferredCarTags = ref(false)
const showConflictResolver = ref(false)
const showPlatformFlow = ref(false)
const showMobileManager = ref(false)
const showBasicInfoEditor = ref(false)
const savingBasicInfo = ref(false)
const showOperationLogDialog = ref(false)
const operationLogsLoading = ref(false)
const showOpportunityDialog = ref(false)
const showVehicleDialog = ref(false)
const showAssetDialog = ref(false)
const basicInfoFormRef = ref()
const basicInfoForm = ref({
  name: '',
  age: '',
  mobile: '',
  gender: '',
  city: '',
  customerType: '',
  reason: '',
})

const mobileRules = [
  { required: true, message: '请输入手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
]

// 客户类型相关
const isCompany = computed(() => {
  return customerStore.profile?.customerType?.value === '公司'
})

const customerTypeText = computed(() => {
  return customerStore.profile?.customerType?.value === '公司' ? '公司' : '个人'
})

const customerTypeIcon = computed(() => {
  return isCompany.value ? 'shop-o' : 'user-o'
})

// 格式化手机号：13800138000 -> 138 0013 8000
const formatMobile = (mobile: string): string => {
  if (!mobile) return ''
  // 移除所有空格
  const cleaned = mobile.replace(/\s/g, '')
  // 如果是11位数字，格式化为 138 0013 8000
  if (/^\d{11}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`
  }
  // 否则保持原样
  return mobile
}

// 电话相关
const displayedPhones = computed(() => {
  if (!customerStore.profile?.mobile || !('items' in customerStore.profile.mobile)) {
    return []
  }
  const items = (customerStore.profile.mobile as MobileData).items
  return items.slice(0, 2).map(item => ({
    ...item,
    formattedMobile: formatMobile(item.mobile)
  })) // 只显示前2个，并格式化手机号
})

const hasMorePhones = computed(() => {
  if (!customerStore.profile?.mobile || !('items' in customerStore.profile.mobile)) {
    return false
  }
  const items = (customerStore.profile.mobile as MobileData).items
  // 只要有电话号码就显示"更多"按钮，让用户可以管理号码
  return items.length > 0
})

// 商机类型列表（从opportunities中提取所有类型）
const opportunityTypeList = computed(() => {
  if (!customerStore.opportunities || customerStore.opportunities.length === 0) {
    return []
  }
  const types = customerStore.opportunities.map(opp => opp.type)
  return Array.from(new Set(types)) // 去重
})

// 商机列表（支持多条，从 sources 中提取或使用 value）
const opportunityList = computed(() => {
  const opportunityType = customerStore.profile?.opportunityType
  if (!opportunityType) return []
  
  // 如果有 sources，提取所有不同的值
  if (opportunityType.sources && opportunityType.sources.length > 0) {
    const values = opportunityType.sources.map(s => String(s.value))
    // 去重并保持顺序
    return Array.from(new Set(values))
  }
  
  // 否则使用主值
  return opportunityType.value ? [String(opportunityType.value)] : []
})

// 最近到期的优惠券
const nearestExpiringAsset = computed(() => {
  if (!customerStore.assets || customerStore.assets.length === 0) {
    return null
  }
  // 按到期日期排序，取最近的一个
  const sorted = [...customerStore.assets].sort((a, b) => {
    const dateA = new Date(a.validTo).getTime()
    const dateB = new Date(b.validTo).getTime()
    return dateA - dateB
  })
  return sorted[0]
})

// 显示的车辆（最多2辆）
const displayedVehicles = computed(() => {
  if (!customerStore.vehicles || customerStore.vehicles.length === 0) {
    return []
  }
  return customerStore.vehicles.slice(0, 2)
})

// 头部标签：显示客户类型 + 钻石客户 + VIP 车主 + 所有商机类型
const displayedHeaderTags = computed(() => {
  const tags: string[] = []
  
  // 1. 添加 VIP 车主（如果 tags 中存在）
  if (customerStore.profile?.tags?.some(tag => tag.includes('VIP') && tag.includes('车主'))) {
    tags.push('VIP 车主')
  }
  
  // 2. 添加所有商机类型（包括钻石客户）
  if (customerStore.opportunities && customerStore.opportunities.length > 0) {
    const opportunityTypes = customerStore.opportunities.map(opp => opp.type)
    tags.push(...opportunityTypes)
  }
  
  // 去重，确保每个标签只显示一次
  return Array.from(new Set(tags))
})

// 获取头部标签的样式类（商机类型）
const getHeaderTagClass = (tag: string) => {
  // VIP 车主和钻石客户使用 vip-tag 样式（琥珀金实色背景，黑色文字）
  if ((tag.includes('VIP') && tag.includes('车主')) || tag === '钻石客户') {
    return 'vip-tag'
  }
  // 客户类型（个人客户、公司客户）和其他所有商机类型使用 biz-badge 样式（深灰半透明背景，白色文字）
  return 'biz-badge'
}

// 判断是否为商机标签
const isOpportunityTag = (tag: string): boolean => {
  // VIP 车主不是商机标签（从 profile.tags 中提取的）
  if (tag.includes('VIP') && tag.includes('车主')) {
    return false
  }
  // 其他标签都是商机标签（从 opportunities 中提取的，包括钻石客户）
  return true
}

// 获取标签图标
const getTagIcon = (tag: string): string | null => {
  // 钻石客户显示钻石图标
  if (tag === '钻石客户') {
    return 'gem-o'
  }
  // VIP 车主显示皇冠图标
  if (tag.includes('VIP') && tag.includes('车主')) {
    return 'medal-o'
  }
  return null
}

// 获取标签的自定义样式类
// 将颜色转换为浅色背景和深色文字
const getTagColors = (color: string) => {
  if (!color) {
    return {
      background: 'white',
      color: 'var(--text-main)',
      border: '1px solid var(--border-color)'
    }
  }
  
  // 将hex颜色转换为RGB
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // 计算亮度（使用相对亮度公式）
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  // 标签池中的颜色已经是浅色，直接使用作为背景
  const background = color
  // 根据背景亮度决定文字颜色（阈值调整为140，因为标签颜色都比较浅）
  const textColor = brightness > 140 ? '#1E293B' : '#FFFFFF'
  // 边框使用原色，如果太浅则加深
  let borderColor = color
  if (brightness > 200) {
    // 如果颜色太浅，边框稍微加深
    const darkerR = Math.max(0, r - 20)
    const darkerG = Math.max(0, g - 20)
    const darkerB = Math.max(0, b - 20)
    borderColor = `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`
  }
  
  return {
    background,
    color: textColor,
    border: `1px solid ${borderColor}`
  }
}

const getTagCustomClass = (tag: string) => {
  const tagInfo = customerStore.tagPool.find(t => t.name === tag)
  
  // 热度极高：红色背景和边框
  if (tag.includes('热度极高') || tag.includes('热度')) {
    return 'tag-hot'
  }
  
  // 根据分类返回不同的样式类
  if (tagInfo?.category) {
    const category = tagInfo.category
    if (category.includes('意向级别')) return 'tag-intent'
    if (category.includes('SC')) return 'tag-sc'
    if (category.includes('SA')) return 'tag-sa'
    if (category.includes('续保')) return 'tag-insurance'
    if (category.includes('POC')) return 'tag-poc'
    if (category.includes('免打扰')) return 'tag-dnd'
    if (category.includes('线上活动')) return 'tag-online'
    if (category.includes('爱好')) return 'tag-hobby'
  }
  
  // 其他标签：默认样式
  return 'tag-normal'
}

// 获取标签的样式对象（用于内联样式）
const getTagStyle = (tag: string) => {
  // 热度极高：红色样式
  if (tag.includes('热度极高') || tag.includes('热度')) {
    return {
      background: '#FFF5F5',
      color: '#E53E3E',
      border: '1px solid #FEB2B2'
    }
  }
  
  // 从标签池中获取标签信息
  const tagInfo = customerStore.tagPool.find(t => t.name === tag)
  
  if (tagInfo?.color) {
    // 使用标签池中定义的颜色
    return getTagColors(tagInfo.color)
  }
  
  // 默认样式：白色背景，灰色边框
  return {
    background: 'white',
    color: 'var(--text-main)',
    border: '1px solid var(--border-color)'
  }
}

// 车辆状态选项
const vehicleStatusOptions = [
  { name: '已售', value: '已售' },
  { name: '自用', value: '自用' },
  { name: '维修中', value: '维修中' },
]

// 车辆状态选择器显示状态
const vehicleStatusSheets = ref<Record<string, boolean>>({})

// 分群列表（支持多条，从 sources 中提取或使用 value）
const segmentList = computed(() => {
  const segmentType = customerStore.profile?.segmentType
  if (!segmentType) return []
  
  // 如果有 sources，提取所有不同的值
  if (segmentType.sources && segmentType.sources.length > 0) {
    const values = segmentType.sources.map(s => String(s.value))
    // 去重并保持顺序
    return Array.from(new Set(values))
  }
  
  // 否则使用主值
  return segmentType.value ? [String(segmentType.value)] : []
})

// 格式化操作时间
const formatOperationTime = (time: string): string => {
  try {
    const date = new Date(time)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
  } catch (e) {
    return time
  }
}

// 最新操作信息文本
const latestOperationText = computed(() => {
  const profile = customerStore.profile
  if (!profile) {
    return ''
  }
  
  const latestOperation = profile.latestOperation
  if (!latestOperation) {
    return ''
  }
  
  return `该顾客已被 ${latestOperation.operator} ${latestOperation.operationType}`
})

// 可用标签（排除已选标签）
const availableTags = computed(() => {
  const selectedTags = customerStore.profile?.tags || []
  return customerStore.tagPool.filter(
    (tag) => !selectedTags.includes(tag.name)
  )
})

// 检查标签是否已选
const isTagSelected = (tagName: string) => {
  return customerStore.profile?.tags.includes(tagName) || false
}

// 将颜色转换为浅色系的辅助函数
const convertToLightColor = (color: string): string => {
  if (!color) return color
  
  // 如果是 hex 颜色
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    
    // 转换为 HSL
    const rNorm = r / 255
    const gNorm = g / 255
    const bNorm = b / 255
    
    const max = Math.max(rNorm, gNorm, bNorm)
    const min = Math.min(rNorm, gNorm, bNorm)
    const delta = max - min
    
    let h = 0
    let s = 0
    let l = (max + min) / 2
    
    if (delta !== 0) {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
      
      if (max === rNorm) {
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) / 6
      } else if (max === gNorm) {
        h = ((bNorm - rNorm) / delta + 2) / 6
      } else {
        h = ((rNorm - gNorm) / delta + 4) / 6
      }
    }
    
    // 转换为浅色系：提高亮度到 0.88-0.92，降低饱和度到 0.25-0.35
    l = Math.max(0.88, Math.min(0.92, l * 1.2)) // 提高亮度
    s = Math.max(0.25, Math.min(0.35, s * 0.6)) // 降低饱和度但保持一定色彩
    
    // 转换回 RGB
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
    const m = l - c / 2
    
    let rNew = 0, gNew = 0, bNew = 0
    
    if (h < 1/6) {
      rNew = c; gNew = x; bNew = 0
    } else if (h < 2/6) {
      rNew = x; gNew = c; bNew = 0
    } else if (h < 3/6) {
      rNew = 0; gNew = c; bNew = x
    } else if (h < 4/6) {
      rNew = 0; gNew = x; bNew = c
    } else if (h < 5/6) {
      rNew = x; gNew = 0; bNew = c
    } else {
      rNew = c; gNew = 0; bNew = x
    }
    
    rNew = Math.round((rNew + m) * 255)
    gNew = Math.round((gNew + m) * 255)
    bNew = Math.round((bNew + m) * 255)
    
    return `#${rNew.toString(16).padStart(2, '0')}${gNew.toString(16).padStart(2, '0')}${bNew.toString(16).padStart(2, '0')}`
  }
  
  return color
}

// 获取标签信息（用于颜色和样式）
const getTagInfo = (tagName: string) => {
  const tag = customerStore.tagPool.find((t) => t.name === tagName)
  if (!tag) {
    return {
      type: 'default' as const,
      color: undefined,
      className: '',
    }
  }
  
  // 特殊标签处理："首保流失15个月"和"PCN售后"
  const specialTags = ['首保流失15个月', 'PCN售后']
  const isSpecialTag = specialTags.includes(tagName)
  
  // 如果标签有color属性，使用自定义颜色（转换为浅色系）
  if (tag.color) {
    return {
      type: 'default' as const,
      color: convertToLightColor(tag.color),
      className: isSpecialTag ? 'special-tag' : '',
    }
  }
  
  // 否则使用默认类型
  return {
    type: 'default' as const,
    color: undefined,
    className: isSpecialTag ? 'special-tag' : '',
  }
}

// 获取标签类型（用于向后兼容）
const getTagType = (tagName: string): any => {
  return getTagInfo(tagName).type
}

// 获取业务标签类型（车主、送修人等）
const getBusinessTagType = (tagName: string): any => {
  const typeMap: Record<string, any> = {
    '车主': 'success',
    '送修人': 'primary',
  }
  return typeMap[tagName] || 'primary'
}

// 获取关系标签类型
const getRelationTagType = (tagName: string): any => {
  const typeMap: Record<string, any> = {
    '车主': 'success',
    '送修人': 'primary',
    '联系人': 'default',
  }
  return typeMap[tagName] || 'default'
}

// 处理字段更新
const handleFieldUpdate = (data: { field: string; value: string | number }) => {
  if (customerStore.profile) {
    // 字段已通过 API 更新，这里只需要更新本地状态（如果需要）
    console.log('字段已更新:', data)
  }
}

// 添加标签
const handleAddTag = async (tagId: string) => {
  await customerStore.addTag(tagId)
  // 如果标签已添加，可以关闭弹窗
  if (customerStore.profile?.tags.includes(
    customerStore.tagPool.find((t) => t.id === tagId)?.name || ''
  )) {
    showTagSelector.value = false
  }
}

// 删除标签
const handleRemoveTag = async (tagName: string) => {
  await customerStore.removeTag(tagName)
}

// 标签管理相关
const selectedTags = ref<string[]>([])
const savingTags = ref(false)

// 初始化选中的标签
watch(
  () => customerStore.profile?.tags,
  (tags) => {
    if (tags) {
      selectedTags.value = [...tags]
    }
  },
  { immediate: true }
)

// 当打开标签管理弹窗时，同步标签数据
watch(
  () => showTagManager.value,
  (isOpen) => {
    if (isOpen && customerStore.profile?.tags) {
      selectedTags.value = [...customerStore.profile.tags]
    }
  }
)

// 切换标签选中状态
const toggleTag = (tagName: string) => {
  const index = selectedTags.value.indexOf(tagName)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tagName)
  }
}

// 标签管理弹窗中判断标签是否选中（使用 selectedTags）
const isTagSelectedInManager = (tagName: string) => {
  return selectedTags.value.includes(tagName)
}

// 已选标签列表（用于标签管理弹窗）
const selectedTagsInManager = computed(() => {
  return selectedTags.value
})

// 未选标签列表（用于标签管理弹窗）
const unselectedTagsInManager = computed(() => {
  return customerStore.tagPool.filter(tag => !selectedTags.value.includes(tag.name))
})

// 按分类分组的标签（用于标签管理弹窗）
const groupedTags = computed(() => {
  const groups: Record<string, typeof customerStore.tagPool> = {}
  
  // 调试信息
  console.log('[标签管理] tagPool数据:', customerStore.tagPool)
  console.log('[标签管理] tagPool数量:', customerStore.tagPool.length)
  
  customerStore.tagPool.forEach(tag => {
    const category = tag.category || '其他'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(tag)
  })
  
  // 按分类名称排序
  const sortedGroups: Record<string, typeof customerStore.tagPool> = {}
  const categoryOrder = [
    '意向级别',
    'SC【必选】',
    'SA【必选】',
    '续保【必选】',
    'POC【必选】',
    '免打扰车主',
    '线上活动',
    '爱好(≥1项)',
  ]
  
  // 先按顺序添加已知分类
  categoryOrder.forEach(category => {
    if (groups[category]) {
      sortedGroups[category] = groups[category]
    }
  })
  
  // 再添加其他分类
  Object.keys(groups).forEach(category => {
    if (!categoryOrder.includes(category)) {
      sortedGroups[category] = groups[category]
    }
  })
  
  console.log('[标签管理] 分组后的数据:', sortedGroups)
  console.log('[标签管理] 分类数量:', Object.keys(sortedGroups).length)
  
  return sortedGroups
})

// 获取分类中已选标签数量
const getSelectedCountInCategory = (category: string) => {
  const categoryTags = groupedTags.value[category] || []
  return categoryTags.filter(tag => selectedTags.value.includes(tag.name)).length
}

// 验证必选标签
const validateRequiredTags = (): string | null => {
  const requiredCategories: string[] = []
  
  // 检查所有必选分类
  Object.keys(groupedTags.value).forEach(category => {
    const categoryTags = groupedTags.value[category]
    const requiredTags = categoryTags.filter(tag => tag.required)
    
    if (requiredTags.length > 0) {
      const selectedInCategory = categoryTags.filter(tag => 
        selectedTags.value.includes(tag.name)
      )
      
      if (selectedInCategory.length === 0) {
        requiredCategories.push(category)
      }
    }
    
    // 检查最少选择数量要求
    const minSelectTag = categoryTags.find(tag => tag.minSelect)
    if (minSelectTag && minSelectTag.minSelect) {
      const selectedInCategory = categoryTags.filter(tag => 
        selectedTags.value.includes(tag.name)
      )
      
      if (selectedInCategory.length < minSelectTag.minSelect) {
        return `${category}至少需要选择${minSelectTag.minSelect}项`
      }
    }
  })
  
  if (requiredCategories.length > 0) {
    return `请至少选择一项：${requiredCategories.join('、')}`
  }
  
  return null
}

// 保存标签（一次性提交）
const handleSaveTags = async () => {
  // 验证必选标签
  const validationError = validateRequiredTags()
  if (validationError) {
    showToast(validationError)
    return
  }
  
  savingTags.value = true
  showLoadingToast({
    message: '保存中...',
    forbidClick: true,
  })

  try {
    // 一次性提交所有选中的标签
    await customerStore.updateTags(selectedTags.value)
    showTagManager.value = false
  } catch (error: any) {
    // 错误已在store中处理
  } finally {
    savingTags.value = false
    closeToast()
  }
}

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 格式化总消费字段（将数字转换为带货币符号的字符串）
const formattedTotalConsumption = computed(() => {
  if (!customerStore.profile?.totalConsumption) return null
  const consumption = customerStore.profile.totalConsumption
  return {
    ...consumption,
    value: `¥${formatAmount(consumption.value as number)}`,
  }
})

// 获取交易状态类型
const getTransactionStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '已完成': 'success',
    '待支付': 'warning',
    '已取消': 'default',
  }
  return typeMap[status] || 'default'
}

// 获取车辆状态类型（使用颜色标识）
const getVehicleStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '已售': 'default',
    '自用': 'success',
    '维修中': 'warning',
  }
  return typeMap[status] || 'default'
}

// 获取资产状态类型
const getAssetStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '未使用': 'success',
    '已使用': 'default',
    '已过期': 'danger',
  }
  return typeMap[status] || 'default'
}

// 用户偏好标签相关
const preferredCarTags = computed(() => {
  return customerStore.profile?.preferredCarModel?.tags || []
})

const openPreferredCarTagSelector = () => {
  selectedPreferredCarTags.value = [...preferredCarTags.value]
  showPreferredCarTagSelector.value = true
}

const closePreferredCarTagSelector = () => {
  showPreferredCarTagSelector.value = false
  selectedPreferredCarTags.value = []
}

const isPreferredCarTagSelected = (tagName: string) => {
  return selectedPreferredCarTags.value.includes(tagName)
}

const togglePreferredCarTag = (tagName: string) => {
  const index = selectedPreferredCarTags.value.indexOf(tagName)
  if (index > -1) {
    selectedPreferredCarTags.value.splice(index, 1)
  } else {
    selectedPreferredCarTags.value.push(tagName)
  }
}

const handleSavePreferredCarTags = async () => {
  savingPreferredCarTags.value = true
  showLoadingToast({
    message: '保存中...',
    forbidClick: true,
  })

  try {
    await customerStore.updatePreferredCarModelTags(selectedPreferredCarTags.value)
    closePreferredCarTagSelector()
  } catch (error: any) {
    showToast(error.message || '保存失败，请重试')
  } finally {
    savingPreferredCarTags.value = false
    closeToast()
  }
}

const handleRemovePreferredCarTag = async (tagName: string) => {
  const newTags = preferredCarTags.value.filter((t) => t !== tagName)
  
  showLoadingToast({
    message: '删除中...',
    forbidClick: true,
  })

  try {
    // 传递 false 参数，避免 store 中显示 toast（由这里统一处理）
    await customerStore.updatePreferredCarModelTags(newTags, false)
    showToast('删除成功')
  } catch (error: any) {
    showToast(error.message || '删除失败，请重试')
  } finally {
    closeToast()
  }
}

// 获取预约状态类型
const getAppointmentStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '待确认': 'warning',
    '已确认': 'primary',
    '已完成': 'success',
    '已取消': 'default',
  }
  return typeMap[status] || 'default'
}

// 获取商机类型标签类型（使用颜色标识）
const getOpportunityTypeTagType = (type: string): any => {
  const typeMap: Record<string, any> = {
    '维保到期': 'warning',
    '代金券到期': 'warning',
    '高价值客户': 'danger',
    '流失预警': 'danger',
    '复购机会': 'success',
    '升级机会': 'primary',
  }
  return typeMap[type] || 'primary'
}

// 获取商机状态类型
const getOpportunityStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '待处理': 'warning',
    '处理中': 'primary',
    '已推送': 'primary',
    '已完成': 'success',
  }
  return typeMap[status] || 'default'
}

// 获取推送状态类型
const getPushStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '待推送': 'warning',
    '成功': 'success',
    '失败': 'danger',
  }
  return typeMap[status] || 'default'
}

// 解析商机详情描述，将 "label：value\nlabel：value" 格式解析为数组
const parseOpportunityDescription = (description: string): Array<{ label: string; value: string }> => {
  if (!description) return []
  
  const lines = description.split('\n').filter(line => line.trim())
  return lines.map(line => {
    // 匹配 "label：value" 或 "label:value" 格式
    const match = line.match(/^(.+?)[：:](.+)$/)
    if (match) {
      return {
        label: match[1].trim(),
        value: match[2].trim(),
      }
    }
    // 如果没有匹配到，返回整行作为 value
    return {
      label: '',
      value: line.trim(),
    }
  })
}

// 获取优先级类型
const getPriorityType = (priority: string): any => {
  const typeMap: Record<string, any> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'default',
  }
  return typeMap[priority] || 'default'
}

// 格式化推送目标
const formatPushTarget = (target: string): string => {
  const targetMap: Record<string, string> = {
    'bdc': 'BDC系统',
    'wechat': '微信',
    'crm': 'CRM系统',
  }
  return targetMap[target] || target
}

// 处理冲突提交完成
const handleConflictSubmitted = () => {
  // 可以在这里刷新数据或做其他处理
  console.log('冲突处理已提交')
}

// 处理电话号码更新
const handleMobileUpdate = async (data: MobileData) => {
  // 更新本地数据
  if (customerStore.profile && 'items' in customerStore.profile.mobile) {
    Object.assign(customerStore.profile.mobile as MobileData, data)
  }
  // 可以在这里刷新数据
  await customerStore.fetchProfile()
}

// 打开基础信息编辑弹窗
const openBasicInfoEditor = () => {
  if (customerStore.profile) {
    basicInfoForm.value = {
      name: String(customerStore.profile.name.value || ''),
      age: String(customerStore.profile.age.value || ''),
      mobile: '', // 手机号已在MobileEditor中管理，这里不再使用
      gender: String(customerStore.profile.gender.value || ''),
      city: String(customerStore.profile.city.value || ''),
      customerType: customerStore.profile.customerType ? String(customerStore.profile.customerType.value || '') : '',
      reason: '',
    }
  }
}

// 提交基础信息修改
const handleSaveBasicInfo = async () => {
  console.log('[Home] 开始提交基础信息', {
    profile: customerStore.profile,
    form: basicInfoForm.value,
  })

  if (!customerStore.profile) {
    console.warn('[Home] customerStore.profile 不存在')
    showToast('客户信息不存在')
    return
  }

  // 验证更改理由
  if (!basicInfoForm.value.reason || !basicInfoForm.value.reason.trim()) {
    console.warn('[Home] 更改理由为空')
    showToast('请输入更改理由')
    return
  }

  // 手机号已在MobileEditor中管理，这里不再验证

  // 先检查是否有字段变更（在显示 loading 之前）
  const updateData: Record<string, any> = {}
  
  // 收集所有变更的字段
  if (basicInfoForm.value.name !== String(customerStore.profile.name.value || '')) {
    updateData.name = basicInfoForm.value.name
  }
  if (basicInfoForm.value.age !== String(customerStore.profile.age.value || '')) {
    updateData.age = basicInfoForm.value.age ? Number(basicInfoForm.value.age) : null
  }
  // 手机号已在MobileEditor中管理，这里不再处理
  if (basicInfoForm.value.gender !== String(customerStore.profile.gender.value || '')) {
    updateData.gender = basicInfoForm.value.gender
  }
  if (basicInfoForm.value.city !== String(customerStore.profile.city.value || '')) {
    updateData.city = basicInfoForm.value.city
  }
  if (customerStore.profile.customerType && basicInfoForm.value.customerType !== String(customerStore.profile.customerType.value || '')) {
    updateData.customerType = basicInfoForm.value.customerType
  }

  // 检查是否有需要更新的字段（除了reason）
  const fieldsToUpdate = Object.keys(updateData).filter(key => key !== 'reason')
  if (fieldsToUpdate.length === 0) {
    console.warn('[Home] 没有需要更新的字段')
    showToast('请至少修改一个字段后再提交')
    return
  }

  console.log('[Home] 验证通过，开始提交')

  savingBasicInfo.value = true
  showLoadingToast({
    message: '提交中...',
    forbidClick: true,
  })

  try {

    // 添加更改理由（必填）
    updateData.reason = basicInfoForm.value.reason.trim()

    console.log('[Home] 准备提交的数据:', updateData)
    console.log('[Home] 调用 API updateBasicInfo')
    const res = await customerApi.updateBasicInfo(updateData as { reason: string } & typeof updateData)
    
    console.log('[Home] API 响应:', res)
    
    if (res.code === 200) {
      showToast('提交成功，等待后台审核')
      showBasicInfoEditor.value = false
      // 重置表单
      basicInfoForm.value.reason = ''
      // 不刷新数据，因为需要等待审核
    } else {
      showToast(res.message || '提交失败，请重试')
    }
  } catch (error: any) {
    console.error('[Home] 提交失败:', error)
    showToast(error.message || '提交失败，请重试')
  } finally {
    savingBasicInfo.value = false
    closeToast()
  }
}

// 打开基础信息编辑弹窗（处理函数）
const handleOpenBasicInfoEditor = () => {
  openBasicInfoEditor()
  showBasicInfoEditor.value = true
}

// 加载操作日志
const loadOperationLogs = async () => {
  operationLogsLoading.value = true
  try {
    await customerStore.fetchOperationLogs()
  } catch (error) {
    console.error('加载操作日志失败:', error)
  } finally {
    operationLogsLoading.value = false
  }
}

// 处理优惠券卡片点击
const handleCouponCardClick = () => {
  if (customerStore.assets && customerStore.assets.length > 1) {
    showAssetDialog.value = true
  }
}

// 打开车辆状态选择器
const openVehicleStatusSheet = (vehicleId: string) => {
  vehicleStatusSheets.value[vehicleId] = true
}

// 处理车辆状态变更
const handleVehicleStatusChange = async (vehicleId: string, status: string) => {
  vehicleStatusSheets.value[vehicleId] = false
  showLoadingToast({
    message: '更新中...',
    forbidClick: true,
  })
  try {
    const res = await customerApi.updateVehicleStatus(vehicleId, status)
    if (res.code === 200) {
      // 更新本地数据
      const vehicle = customerStore.vehicles.find(v => v.id === vehicleId)
      if (vehicle) {
        vehicle.status = status
      }
      showToast('更新成功')
    } else {
      showToast(res.message || '更新失败，请重试')
    }
  } catch (error: any) {
    showToast(error.message || '更新失败，请重试')
  } finally {
    closeToast()
  }
}

// 初始化
onMounted(async () => {
  console.log('Home 组件 mounted，开始加载数据')
  await customerStore.fetchProfile()
  await customerStore.fetchTagPool()
  // 并行加载交易记录、车辆关联、资产中心、预约信息、平台溯源、商机信息、操作日志
  // 注意：保险记录使用滚动加载，不在初始化时加载
  await Promise.all([
    customerStore.fetchTransactions(),
    customerStore.fetchVehicles(),
    customerStore.fetchAssets(),
    customerStore.fetchAppointments(),
    customerStore.fetchPlatformSources(),
    customerStore.fetchOpportunities(),
    loadOperationLogs(),
  ])
  console.log('数据加载完成，profile:', customerStore.profile)
  console.log('数据加载完成，customerType:', customerStore.profile?.customerType)
  console.log('数据加载完成，opportunityType:', customerStore.profile?.opportunityType)
  console.log('数据加载完成，segmentType:', customerStore.profile?.segmentType)
  console.log('数据加载完成，totalConsumption:', customerStore.profile?.totalConsumption)
  console.log('数据加载完成，tagPool:', customerStore.tagPool)
  console.log('数据加载完成，transactions:', customerStore.transactions)
  console.log('数据加载完成，vehicles:', customerStore.vehicles)
  console.log('数据加载完成，assets:', customerStore.assets)
  console.log('数据加载完成，appointments:', customerStore.appointments)
  console.log('数据加载完成，platformSources:', customerStore.platformSources)
})
</script>

<style scoped lang="scss">
.home-container {
  min-height: 100vh;
  background: var(--bg-slate);
  padding: 12px;
  max-width: 100%;
  box-sizing: border-box;
  padding-bottom: 50px; // 为底部 Tab 留出空间
  overflow-y: auto;
  font-family: "Porsche Next", -apple-system, "PingFang SC", sans-serif;
  color: var(--text-main);
  line-height: 1.5;
  letter-spacing: -0.01em;
}

// 首屏内容：紧凑布局，确保tab可见
.first-screen {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 0;
  padding: 0;
  background: transparent;
}

// 简洁头部：参考图片排版，带多个Jebsen水印
.premium-header {
  background-color: var(--porsche-black);
  padding: 14px 16px;
  padding-bottom: 50px; // 为悬浮的手机号卡片留出空间
  color: white;
  position: relative;
  border-radius: 6px;
  margin-bottom: 0;
  z-index: 1;
  overflow: hidden;
}

// 多个Jebsen水印背景 - 铺满背景，不重叠（增强可见度）
.watermark-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  // 使用SVG创建重复的JEBSEN水印图案（增强透明度）
  background-image: url("data:image/svg+xml,%3Csvg width='180' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='50' font-family='Arial, sans-serif' font-size='28' font-weight='900' fill='rgba(255,255,255,0.08)' transform='rotate(-15 10 50)' letter-spacing='4'%3EJEBSEN%3C/text%3E%3Ctext x='100' y='50' font-family='Arial, sans-serif' font-size='28' font-weight='900' fill='rgba(255,255,255,0.08)' transform='rotate(-15 100 50)' letter-spacing='4'%3EJEBSEN%3C/text%3E%3Ctext x='10' y='90' font-family='Arial, sans-serif' font-size='28' font-weight='900' fill='rgba(255,255,255,0.08)' transform='rotate(-15 10 90)' letter-spacing='4'%3EJEBSEN%3C/text%3E%3Ctext x='100' y='90' font-family='Arial, sans-serif' font-size='28' font-weight='900' fill='rgba(255,255,255,0.08)' transform='rotate(-15 100 90)' letter-spacing='4'%3EJEBSEN%3C/text%3E%3C/svg%3E");
  background-repeat: repeat;
  background-position: 0 0;
  background-size: 160px 80px;
}

.header-main {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  z-index: 2; // 确保在水印之上
}

// 头像区域
.avatar-wrapper {
  flex-shrink: 0;
}

.avatar-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.avatar-text {
  font-size: 20px;
  font-weight: 600;
  color: white;
}

// 右侧信息区域
.header-info-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;

  .name-left {
    display: flex;
    align-items: center;

    h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: white;
      line-height: 1.2;
    }

    .trace-icon {
      margin-left: 6px;
      font-size: 18px;
      color: rgba(255, 255, 255, 0.9);
      cursor: pointer;
      flex-shrink: 0;
      transition: opacity 0.2s, transform 0.2s;

      &:active {
        opacity: 0.7;
        transform: scale(0.9);
      }
    }
  }

  .meta-right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
}

.oneid-pill {
  background: rgba(148, 114, 74, 0.1);
  border: 1px solid var(--accent-gold);
  color: var(--accent-gold);
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 2px;
  flex-shrink: 0;
}

.customer-type-badge {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 2px;
  flex-shrink: 0;
  // margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  
  :deep(.van-icon) {
    font-size: 12px;
  }
}

.header-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  position: relative;
  z-index: 1;
  margin-top: 2px;
}

.header-tags span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.header-tags .tag-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.vip-tag {
  background: var(--accent-gold);
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 2px;
  color: #000;
}

.vip-tag .tag-icon {
  color: #000;
}

.biz-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: white;
}

.biz-badge .tag-icon {
  color: white;
}

// 手机号区域：悬浮在黑色头部之上（紧凑版）
.phone-card {
  margin: -40px 16px 0px; // 负边距向上移动，悬浮在头部底部
  background: white;
  border-radius: 6px;
  border: none;
  padding: 8px 12px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1); // 阴影，突出悬浮效果
  position: relative;
  z-index: 10; // 确保在头部之上
}

.phone-entry {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.phone-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.num-val {
  font-size: 14px;
  font-weight: 700;
  color: var(--porsche-black);
  font-family: ui-monospace, monospace;
  letter-spacing: 0.3px;
  line-height: 1.2;
  min-width: 110px; // 固定最小宽度，确保号码列对齐
  flex-shrink: 0;

  &.is-secondary {
    color: var(--text-sub);
    font-size: 14px;
  }
}

.num-tags {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  flex: 1;
  align-items: center;
}

.n-tag {
  font-size: 7px;
  padding: 1px 3px;
  border-radius: 2px;
  border: 1px solid var(--border-color);
  color: var(--text-sub);
  white-space: nowrap;
  line-height: 1.1;

  &.active {
    color: var(--accent-gold);
    border-color: var(--accent-gold);
    background: rgba(148, 114, 74, 0.08);
  }
}

.edit-icon {
  font-size: 12px;
  cursor: pointer;
  padding: 2px;
  opacity: 0.7;
  color: #1989fa;
  transition: opacity 0.2s;
  flex-shrink: 0;
  
  &:active {
    opacity: 1;
  }
}

.phone-divider {
  height: 1px;
  background: #F1F5F9;
  margin: 4px 0;
}

// 内容板块：统一间距和分隔（紧凑版）
.container {
  padding: 0;
  margin-bottom: 8px;
  background: white;
  border-radius: 6px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.block-h {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  padding: 8px 14px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
}

.block-h .title-text {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  font-weight: 600;
}

.block-more {
  font-size: 12px;
  color: var(--text-sub);
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  text-transform: none;
  transition: color 0.2s;
  
  &:active {
    color: var(--accent-gold);
  }
}

// 资产档案：简化样式
.asset-box {
  background: transparent;
  border: none;
  border-radius: 0;
  overflow: hidden;
}

.asset-row {
  display: grid;
  grid-template-columns: 1fr 1.3fr 1.8fr 40px;
  align-items: center;
  padding: 8px 14px;
  gap: 10px;

  &:not(:last-child) {
    margin-bottom: 4px;
  }
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.model-name {
  font-weight: 400;
  font-size: 12px;
  color: var(--text-main);
}

.plate-val {
  font-size: 12px;
  font-weight: 700;
  color: var(--accent-gold);
  letter-spacing: 0.5px;
}

.vin-val {
  font-size: 10px;
  color: var(--text-sub);
  font-family: ui-monospace, monospace;
}

.status-text {
  font-size: 10px;
  color: var(--text-sub);
  text-align: right;
  cursor: pointer;
}

// 账户权益：简化样式（紧凑版）
.asset-coupon-box {
  background: #fff;
  border: none;
  padding: 8px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0;
  margin: 0;
}

.asset-coupon-name {
  font-size: 11px;
  font-weight: 700;

  small {
    font-weight: normal;
    color: var(--text-sub);
    margin-left: 3px;
    font-size: 10px;
  }
}

.asset-coupon-amount {
  font-size: 14px;
  font-weight: 800;
  color: var(--accent-gold);
}

// 画像标签：统一间距（紧凑版）
.tags-list-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 14px;
}

.tag-item-custom {
  padding: 3px 10px;
  font-size: 11px;
  border-radius: 2px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.8;
  }
}

.empty-tags-text {
  color: var(--text-sub);
  font-size: 11px;
}

// 基础档案网格：简化样式
.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: none;
  border-radius: 0;
  overflow: hidden;
  padding: 0;
  gap: 0;
}

.info-node {
  background: transparent;
  padding: 8px 6px;
  text-align: center;
}

.node-l {
  font-size: 10px;
  color: var(--text-sub);
  margin-bottom: 2px;
}

.node-v {
  font-size: 12px;
  font-weight: 700;
}

// 底部 Tab 固定栏
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: white;
  border-top: none;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0;
  z-index: 100;
}

.nav-item {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-sub);

  &.active {
    color: var(--accent-gold);
  }
}

// 姓名卡片（简化样式）
.info-card.name-card {
  background: #ffffff !important;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: none;
  position: relative;
  
  .name-section {
    padding: 12px 16px;
    padding-bottom: 12px;
    position: relative;
    
    .name-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: nowrap;
      
      .name-with-icon {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        
        .name-text {
          font-size: 20px; // 稍微减小字体
          font-weight: 600;
          color: #1a1a1a;
          letter-spacing: 0.2px;
          line-height: 1.2;
          white-space: nowrap;
        }
        
        .source-icon {
          font-size: 16px; // 减小图标
          color: var(--van-tag-primary-color);
          cursor: pointer;
          transition: all 0.2s;
          padding: 3px; // 减少内边距
          border-radius: 50%;
          flex-shrink: 0;
          
          &:hover {
            background: #FCFAF6;
            transform: scale(1.1);
          }
          
          &:active {
            transform: scale(0.95);
          }
        }
      }
      
      .name-row-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        flex-wrap: nowrap;
      }
      
      .customer-id {
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        
        .id-label {
          font-size: 12px;
          color: #969799;
          font-weight: 400;
          letter-spacing: 0.2px;
        }
        
        .id-value {
          font-size: 11px; // 减小字体
          color: #646566;
          font-weight: 500;
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
          letter-spacing: 0.3px; // 减少字间距
          padding: 2px 5px; // 减少内边距
          background: #f7f8fa;
          border-radius: 3px; // 减小圆角
        }
      }
      
        .identity-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px; // 减少间距
          padding: 4px 10px; // 减少内边距
          background: #f0f7ff;
          border-radius: 12px; // 减小圆角
          border: none;
          flex-shrink: 0;
          white-space: nowrap;
          
          .identity-icon {
            font-size: 12px; // 减小图标
            color: var(--van-tag-primary-color);
            
            &.is-company {
              color: var(--van-tag-primary-color);
            }
          }
          
          .identity-text {
            font-size: 11px; // 减小字体
            color: var(--van-tag-primary-color);
            font-weight: 500;
            letter-spacing: 0.2px;
          }
        }
    }
  }
  
  .card-content-wrapper {
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    
    .phone-section {
      .phone-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: nowrap;
        
        .phone-icon {
          flex-shrink: 0;
          color: #646566;
        }
        
        .section-title {
          font-size: 11px; // 使用弱化样式，类似客户ID
          font-weight: 400; // 弱化字重
          color: #969799; // 弱化颜色，类似客户ID标签
          flex-shrink: 0;
          white-space: nowrap;
          letter-spacing: 0.2px; // 与客户ID保持一致
        }
      }
      
      .phone-list {
        display: flex;
        flex-wrap: nowrap;
        gap: 4px;
        align-items: center;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        flex: 1;
        min-width: 0;
        
        &::-webkit-scrollbar {
          display: none;
        }
        
        .phone-item {
          display: flex;
          align-items: center;
          gap: 4px; // 增加间距，让号码更突出
          padding: 4px 8px; // 增加内边距，让号码更突出
          background: #f7f8fa;
          border-radius: 4px; // 稍微增加圆角
          border: 1px solid #ebedf0;
          white-space: nowrap;
          flex-shrink: 0;
          
          
          
          .phone-number {
            font-size: 14px; // 增大字体，突出重要信息
            font-weight: 700; // 加粗，突出重要信息
            color: #1a1a1a; // 使用更深的颜色，增强对比度
            white-space: nowrap;
            line-height: 1.4;
            letter-spacing: 0.3px; // 增加字间距，提升可读性
          }
          
          .tag-primary,
          .tag-business {
            margin: 0;
            flex-shrink: 0;
          }
        }
        
        .more-phone-btn {
          flex-shrink: 0;
        }
      }
    }
    
    .opportunity-section {
      .opportunity-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: nowrap;
        
        .section-title {
          font-size: 11px; // 使用弱化样式，类似客户ID
          font-weight: 400; // 弱化字重
          color: #969799; // 弱化颜色，类似客户ID标签
          flex-shrink: 0;
          white-space: nowrap;
          letter-spacing: 0.2px; // 与客户ID保持一致
        }
      }
      
      .opportunity-types {
        display: flex;
        flex-wrap: nowrap;
        gap: 4px;
        cursor: pointer;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        flex: 1;
        min-width: 0;
        
        &::-webkit-scrollbar {
          display: none;
        }
        
        .opportunity-tag {
          cursor: pointer;
          flex-shrink: 0;
          white-space: nowrap;
        }
      }
    }
  }
}


// 优惠券卡片：简化样式
.coupon-card {
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:active {
    opacity: 0.8;
  }
  
  .coupon-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fafafa;
    
    .coupon-title {
      font-size: 12px; // 减小字体
      font-weight: 600;
      color: #323233;
    }
    
    .arrow-icon {
      font-size: 12px;
      color: #969799;
    }
  }
  
  .coupon-info {
    padding: 12px 16px;
    display: flex;
    gap: 12px;
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    
    &::-webkit-scrollbar {
      display: none;
    }
    
    .coupon-row {
      display: flex;
      font-size: 11px; // 减小字体
      white-space: nowrap;
      flex-shrink: 0;
      line-height: 1.3; // 优化行高
      
      .label {
        color: #969799;
        margin-right: 3px;
      }
      
      .value {
        color: #323233;
        
        &.amount {
          color: #323233;
          font-weight: 600;
        }
      }
    }
  }
}

// 车辆卡片：统一样式
.vehicle-card {
  .card-header {
    padding: 12px 16px;
    background: #fafafa;
  }
  
  .vehicle-list {
    padding: 12px 16px;
    
    .vehicle-item {
      padding: 6px 8px; // 减少内边距
      background: #f7f8fa;
      border-radius: 4px;
      margin-bottom: 4px; // 减少间距
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .vehicle-header {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        flex-wrap: nowrap;
        
        .vehicle-main-info {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          flex: 1;
          min-width: 0;
          flex-wrap: nowrap;
          overflow: hidden;
          
          .vehicle-icon {
            flex-shrink: 0;
            color: #646566;
          }
          
          .vehicle-info-wrapper {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          
          .vehicle-info-row {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 6px;
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            flex: 1;
            min-width: 0;
            
            &::-webkit-scrollbar {
              display: none;
            }
            
            .vehicle-model {
              font-size: 12px; // 减小字体
              font-weight: 600;
              color: #323233;
              flex-shrink: 0;
              white-space: nowrap;
              line-height: 1.3;
            }
            
            .info-value {
              font-size: 11px; // 减小字体
              color: #646566;
              line-height: 1.3; // 优化行高
              white-space: nowrap;
              flex-shrink: 0;
              
              &.plate-number {
                font-weight: 500;
                color: #323233;
              }
            }
            
            .vehicle-status-wrapper {
              display: flex;
              align-items: center;
              gap: 2px; // 减少间距
              cursor: pointer;
              padding: 2px 5px; // 减少内边距
              border-radius: 3px; // 减小圆角
              transition: background-color 0.2s;
              flex-shrink: 0;
              margin-left: auto; // 状态标签靠右对齐
              
              &:hover {
                background-color: #ebedf0;
              }
              
              &:active {
                background-color: #dcdee0;
              }
              
              .status-tag-clickable {
                margin: 0;
              }
              
              .status-arrow-icon {
                font-size: 10px; // 减小图标
                color: #969799;
                transition: transform 0.2s;
              }
              
              &:active .status-arrow-icon {
                transform: rotate(180deg);
              }
            }
          }
        }
      }
    }
  }
}

// 标签卡片：统一样式
.tags-card {
  .card-header {
    padding: 12px 16px;
    background: #fafafa;
  }
  
  .tags-content {
    padding: 12px 16px;
    
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      
      .clickable-tag {
        cursor: pointer;
        transition: all 0.2s;
        margin: 0;
        
        &:active {
          transform: scale(0.95);
        }
        
        // 特殊标签样式："首保流失15个月"和"PCN售后"
        &.special-tag {
          opacity: 0.85;
          font-weight: 500;
        }
      }
    }
    
    .empty-tags {
      color: #969799;
      font-size: 11px; // 减小字体
      padding: 2px 0;
    }
  }
}

// 弹窗样式（统一设计规范 - 紧凑版）
.opportunity-dialog,
.vehicle-dialog,
.asset-dialog,
.tag-manager {
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
    padding-top: 10px;
    min-height: 0;
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
  
  .opportunity-item {
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    padding: 10px 12px;
    margin-bottom: 6px;
    border: 1px solid var(--border-color);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .opportunity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      flex-wrap: wrap;
      gap: 6px;
      
      .opportunity-type-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
        
        .opportunity-type-tag {
          margin: 0;
          font-weight: 500;
        }
      }
      
      .opportunity-status-wrapper {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
        
        .push-status-tag {
          margin: 0;
        }
      }
    }
    
    .opportunity-info {
      .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 6px;
        font-size: 12px;
        min-height: 20px;
        line-height: 1.3;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          color: var(--text-sub);
          min-width: 70px;
          flex-shrink: 0;
          font-size: 12px;
        }
        
        .value {
          color: var(--text-main);
          flex: 1;
          word-break: break-all;
          font-size: 12px;
        }
        
        .priority-tag {
          margin: 0;
        }
      }
    }
  }
  
  .asset-item {
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    margin-bottom: 6px;
    border: 1px solid var(--border-color);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .card-header {
      padding: 8px 12px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .record-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-main);
      }
    }
    
    .card-content {
      padding: 8px 12px;
      
      .info-row {
        display: flex;
        margin-bottom: 6px;
        font-size: 12px;
        line-height: 1.3;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          color: var(--text-sub);
          min-width: 70px;
          flex-shrink: 0;
          font-size: 12px;
        }
        
        .value {
          color: var(--text-main);
          flex: 1;
          word-break: break-all;
          font-size: 12px;
          
          &.amount {
            color: var(--accent-gold);
            font-weight: 700;
            font-size: 13px;
          }
        }
      }
    }
  }
  
  .vehicle-item-full {
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    padding: 10px 12px;
    margin-bottom: 6px;
    border: 1px solid var(--border-color);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .vehicle-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .vehicle-model {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-main);
      }
      
      .vehicle-status-wrapper {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
        
        &:hover {
          background-color: var(--bg-slate);
        }
        
        &:active {
          background-color: var(--border-color);
        }
        
        .status-tag-clickable {
          margin: 0;
        }
        
        .status-arrow-icon {
          font-size: 12px;
          color: var(--text-sub);
          transition: transform 0.2s;
        }
        
        &:active .status-arrow-icon {
          transform: rotate(180deg);
        }
      }
    }
    
    .vehicle-info {
      .info-item {
        display: flex;
        margin-bottom: 6px;
        font-size: 12px;
        line-height: 1.3;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          color: var(--text-sub);
          min-width: 70px;
          flex-shrink: 0;
          font-size: 12px;
        }
        
        .value {
          color: var(--text-main);
          flex: 1;
          font-size: 12px;
        }
      }
    }
  }
  
  // 标签管理弹窗特殊样式
  &.tag-manager {
    .tag-category-section {
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .tag-category-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-main);
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--border-color);
        
        .category-name {
          flex: 1;
        }
        
        .required-badge {
          padding: 2px 6px;
          background: #FFF5F5;
          color: #E53E3E;
          border: 1px solid #FEB2B2;
          border-radius: 2px;
          font-size: 10px;
          font-weight: 600;
        }
        
        .min-select-badge {
          padding: 2px 6px;
          background: #FCFAF6;
          color: var(--accent-gold);
          border: 1px solid #E8DCC8;
          border-radius: 2px;
          font-size: 10px;
          font-weight: 600;
        }
        
        .selected-count {
          font-size: 11px;
          color: var(--text-sub);
          font-weight: 400;
        }
      }
      
      .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 8px 0;
        
        .tag-item {
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
          margin: 0;
          
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          &:active {
            transform: scale(0.95);
            opacity: 0.8;
          }
          
          &.is-selected {
            box-shadow: 0 2px 4px rgba(148, 114, 74, 0.2);
          }
        }
      }
    }
  }
  
  // 空状态样式
  .empty-state {
    padding: 40px 0;
    text-align: center;
  }
}

// Tab 容器（统一tab和内容的视觉连接）
.tab-container {
  margin-top: 0;
  margin-bottom: 8px;
  background: white;
  border: none;
  border-radius: 6px;
  overflow: hidden;
  padding: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

// Tab 导航样式（与内容区域统一）
.tab-nav-wrapper {
  display: flex;
  align-items: stretch;
  background: #fafafa;
  border-bottom: none;
  margin: 0;
  
  .tab-nav-item {
    flex: 1;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-sub);
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
    padding: 8px 6px;
    user-select: none;
    position: relative;
    background: transparent;
    min-width: 0;
    
    // 底部指示线
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: transparent;
      transition: background 0.2s;
    }
    
    &.active {
      color: var(--accent-gold);
      background: white;
      font-weight: 700;
      
      // 激活状态的底部指示线
      &::after {
        background: var(--accent-gold);
      }
    }
    
    &:active {
      opacity: 0.8;
    }
  }
}

.tab-content-wrapper {
  margin: 0;
  background: white;
  
  .tab-content {
    min-height: 200px;
    
    // 确保内容区域与tab无缝连接
    :deep(.maintenance-container),
    :deep(.insurance-container) {
      background: transparent;
      padding: 12px;
      padding-top: 8px;
      margin: 0;
    }
    
    // 确保内容区域有合适的间距
    :deep(.container) {
      padding: 0;
    }
  }
}

.header {
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 12px;
  color: white;

  .title {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
  }

  .customer-id {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 8px;
  }

  .header-info {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: column;
    gap: 8px;

    .header-info-item {
      display: flex;
      align-items: flex-start;
      font-size: 14px;
      line-height: 1.5;

      .header-info-icon {
        font-size: 16px;
        margin-right: 6px;
        margin-top: 2px;
        flex-shrink: 0;
        opacity: 0.9;

        &.opportunity-icon {
          color: #ffd700;
        }

        &.consumption-icon {
          color: #ffeb3b;
        }

        &.tag-icon {
          color: #4fc3f7;
        }

        &.segment-icon {
          color: #81c784;
        }
      }

      .header-info-label {
        font-weight: 500;
        opacity: 0.95;
        flex-shrink: 0;
        margin-right: 4px;
      }

      .header-info-values {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
      }

      .header-info-value {
        opacity: 0.95;

        &.consumption-value {
          font-weight: 600;
          color: #ffeb3b;
        }
      }

      .separator {
        margin: 0 2px;
        opacity: 0.8;
      }
    }
  }
}

.appointment-card-top {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  border: 2px solid var(--van-tag-primary-color);

  .card-header {
    padding: 16px;
    border-bottom: 1px solid #ebedf0;
    background: linear-gradient(135deg, #FCFAF6 0%, #F5F0E8 100%);
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--van-tag-primary-color);
  }

  .card-content {
    padding: 0;
  }
}

// 顶部状态栏系统
.alert-system {
  border-bottom: 1px solid var(--border-color);
  overflow: hidden;
  width: 100%;
  background: white;
}

.alert-bar {
  width: 100%;
  cursor: pointer;
  transition: opacity 0.2s;
  --van-notice-bar-height: 20px;
  --van-notice-bar-font-size: 10px;

  &:active {
    opacity: 0.8;
  }

  :deep(.van-notice-bar) {
    width: 100%;
    padding: 2px 8px;
    font-size: var(--van-notice-bar-font-size);
    font-weight: 600;
    min-height: auto;
    height: 20px;
    line-height: 1.2;
  }

  :deep(.van-notice-bar__content) {
    width: 100%;
    line-height: 1.2;
    height: 100%;
    display: flex;
    align-items: center;
    font-size: var(--van-notice-bar-font-size);
  }

  :deep(.van-notice-bar__left-icon) {
    font-size: 10px;
    margin-right: 3px;
  }
}

// 冲突提示样式 - 橙色背景
.conflict-alert-bar {
  border-bottom: 1px solid var(--border-color);

  :deep(.van-notice-bar) {
    background: #FFFBEB;
    color: #B45309;
  }

  :deep(.van-notice-bar__left-icon) {
    color: #B45309;
  }
}

// 操作提示样式 - 琥珀金浅色背景，与冲突提示区分
.operation-alert-bar {
  border-top: 1px solid #F5E6D3;
  border-bottom: 1px solid var(--border-color);

  :deep(.van-notice-bar) {
    background: #FEF9F3;
    color: #94724A;
  }

  :deep(.van-notice-bar__left-icon) {
    color: #94724A;
  }

  .operation-text {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .operation-time {
    margin-left: 4px;
    font-weight: 500;
  }
}

.multi-source-alert {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.2);

  :deep(.van-notice-bar) {
    padding: 12px 16px;
    
    .van-notice-bar__content {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
    }
  }

  .source-link {
    color: var(--van-tag-primary-color);
    text-decoration: underline;
    cursor: pointer;
    margin-left: 4px;
    white-space: nowrap;
    flex-shrink: 0;
  }
}

.important-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-bottom: 16px;

  .info-item {
    background: white;
    border-radius: 10px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
    border: 1px solid rgba(0, 0, 0, 0.04);

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transform: translateY(-1px);
    }

    .info-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .info-content {
      flex: 1;
      min-width: 0;

      .info-label {
        font-size: 11px;
        color: #969799;
        margin-bottom: 4px;
        font-weight: 400;
      }

      .info-value {
        font-size: 14px;
        font-weight: 600;
        color: #323233;
        word-break: break-all;
        line-height: 1.4;

        &.consumption-value {
          font-size: 15px;
          font-weight: 700;
          color: #ee0a24;
        }
      }
    }

    &.opportunity-type {
      .info-icon {
        background: linear-gradient(135deg, #e8f8f0 0%, #d0f0e0 100%);
        color: #07c160;
      }
    }

    &.segment-type {
      .info-icon {
        background: linear-gradient(135deg, #fff4e8 0%, #ffe8d0 100%);
        color: #ff976a;
      }
    }

    &.consumption-type {
      .info-icon {
        background: linear-gradient(135deg, #ffe8e8 0%, #ffd0d0 100%);
        color: #ee0a24;
      }
    }
  }
}

.loading {
  padding: 40px 0;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-card {
  background: white;
  border-radius: 8px; // 减小圆角，更紧凑
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06); // 减小阴影
  margin-top: 0;
  
  // 排除名片卡片，名片卡片使用特殊样式
  &:not(.name-card) {
    background: white;
  }

  &.mobile-manager-card {
    border: 2px solid var(--van-tag-primary-color);
    
    .card-header {
      background: linear-gradient(135deg, #FCFAF6 0%, #F5F0E8 100%);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .card-header {
    padding: 5px 10px; // 减少内边距
    border-bottom: 1px solid #ebedf0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    font-size: 12px; // 减小字体
    font-weight: 600;
    color: #323233;
    display: flex;
    align-items: center;
    gap: 6px;
    
    .title-icon {
      flex-shrink: 0;
      color: #646566;
    }
  }
  
  .edit-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .edit-icon {
      flex-shrink: 0;
    }
  }

  .card-content {
    padding: 0;
    
    // 基本信息卡片样式优化 - 两列布局
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    
    :deep(.van-cell) {
      padding: 5px 10px; // 减少内边距
      font-size: 11px; // 减小字体
      border-bottom: 1px solid #f7f8fa;
      border-right: 1px solid #f7f8fa;
      line-height: 1.3; // 优化行高
      
      &:nth-child(2n) {
        border-right: none;
      }
      
      &:nth-last-child(-n+2) {
        border-bottom: none;
      }
      
      .van-cell__title {
        font-size: 11px; // 减小字体
        color: #969799;
        min-width: auto;
      }
      
      .van-cell__value {
        font-size: 11px; // 减小字体
        color: #323233;
      }
    }
  }
  
  // 基本信息网格布局
  &.basic-info-card {
    .card-content {
      // 基本信息卡片不使用 card-content 的网格布局
      display: block;
      padding: 0;
    }
    
    .basic-info-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr); // 改为5列
      gap: 0;
      padding: 0;
      
      .info-grid-item {
        padding: 6px 3px; // 进一步减少内边距，适应5列布局
        display: flex;
        flex-direction: column;
        align-items: center; // 水平居中
        justify-content: center; // 垂直居中
        gap: 2px; // 减少标签和值之间的间距
        border-bottom: 1px solid #f7f8fa;
        border-right: 1px solid #f7f8fa;
        text-align: center; // 文本居中
        
        &:nth-child(5n) {
          border-right: none;
        }
        
        &:nth-last-child(-n+5) {
          border-bottom: none;
        }
        
        // 跨列显示（客户类型）
        &[style*="grid-column"] {
          grid-column: 1 / -1;
          border-right: none;
          border-bottom: 1px solid #f7f8fa;
          padding: 6px 3px; // 保持一致的紧凑内边距
          
          &:last-child {
            border-bottom: none;
          }
        }
        
        .info-label {
          font-size: 10px; // 减小字体
          color: #969799;
          font-weight: 400;
          line-height: 1.2;
          text-align: center; // 文本居中
        }
        
        .info-value {
          font-size: 11px; // 减小字体
          color: #323233;
          font-weight: 500;
          line-height: 1.3;
          text-align: center; // 文本居中
        }
      }
    }
  }
}

.basic-info-editor {
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
    padding-top: 10px;
    
    :deep(.van-field) {
      background: white;
      border-radius: 4px;
      margin-bottom: 10px;
      
      .van-field__label {
        color: var(--text-sub);
        font-size: 12px;
      }
      
      .van-field__control {
        color: var(--text-main);
        font-size: 13px;
      }
    }
  }

  .edit-actions {
    display: flex;
    gap: 8px;
    margin-top: auto;
    padding-top: 10px;
    border-top: 1px solid var(--border-color);
    flex-shrink: 0;

    .van-button {
      flex: 1;
      font-size: 14px !important;
      height: 40px;
    }
  }
}

.mobile-preview {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .mobile-preview-item {
    padding: 12px;
    background: #f7f8fa;
    border-radius: 8px;
    border: 1px solid #ebedf0;

    &.is-primary {
      background: #FCFAF6;
      border-color: var(--accent-gold);
    }

    .mobile-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .mobile-number {
        font-size: 16px;
        font-weight: 500;
        color: #323233;
        flex: 1;
      }
    }
  }
}

.tags-section {
  padding: 16px;

  .selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .tag-item {
    margin: 0;
  }

  .empty-tags {
    color: #969799;
    font-size: 14px;
    margin-bottom: 12px;
  }

  .add-tag-btn {
    width: 100%;
  }
}

.preferred-car-field {
  .preferred-car-tags {
    padding: 12px 16px;
    border-top: 1px solid #ebedf0;

    .tags-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .tags-label {
        font-size: 14px;
        color: #323233;
        font-weight: 500;
      }
    }

    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag-item {
      margin: 0;
    }

    .empty-tags {
      color: #969799;
      font-size: 14px;
    }
  }
}

.tab-content {
  min-height: 200px;
  background: #f7f8fa;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .maintenance-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .card-header {
      padding: 16px;
      border-bottom: 1px solid #ebedf0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .record-title {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
      }
    }

    .card-content {
      padding: 16px;

      .info-row {
        display: flex;
        margin-bottom: 12px;
        font-size: 14px;

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

          &.amount {
            color: #ee0a24;
            font-weight: 600;
          }
        }
      }
    }
  }
  
  .empty-state {
    padding: 40px 0;
    text-align: center;
  }
}

.list-section {
  padding: 16px;

  .list-item {
    padding: 12px;
    background: #f7f8fa;
    border-radius: 8px;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .item-title {
        font-size: 16px;
        font-weight: 600;
        color: #323233;
        flex: 1;
      }
    }

    .item-content {
      .item-row {
        display: flex;
        margin-bottom: 8px;
        font-size: 14px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          color: #969799;
          min-width: 70px;
          flex-shrink: 0;
        }

        .value {
          color: #323233;
          flex: 1;
          word-break: break-all;

          &.amount {
            color: #ee0a24;
            font-weight: 600;
          }
        }
      }
    }
  }
}

.tag-selector {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px; // 减少内边距
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
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &.is-selected {
    background: #FCFAF6;
    border: 1px solid var(--accent-gold);
  }

  &:active {
    background: #ebedf0;
  }
}

.popup-footer {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #ebedf0;
  flex-shrink: 0;

  .van-button {
    flex: 1;
  }
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

// 响应式适配（侧边栏宽度约 350px）
@media (max-width: 400px) {
  .home-container {
    padding: 8px;
  }

  .header {
    padding: 12px;

    .title {
      font-size: 18px;
    }

    .customer-id {
      font-size: 13px;
    }

    .header-info {
      margin-top: 10px;
      padding-top: 10px;
      gap: 6px;

      .header-info-item {
        font-size: 13px;
        line-height: 1.4;

        .header-info-icon {
          font-size: 14px;
          margin-right: 5px;
        }
      }
    }
  }

  .appointment-card-top {
    margin-bottom: 12px;

    .card-header {
      padding: 12px;
    }

    .card-title {
      font-size: 15px;
    }
  }

  .conflict-alert-top {
    :deep(.van-notice-bar) {
      padding: 3px 10px;
      font-size: 12px;
    }
  }

  .multi-source-alert {
    :deep(.van-notice-bar) {
      padding: 3px 10px;
      font-size: 12px;
    }
  }

  .operation-alert {
    :deep(.van-notice-bar) {
      padding: 3px 10px;
      font-size: 12px;
    }
  }

  .important-info {
    grid-template-columns: 1fr;
    gap: 8px;

    .info-item {
      padding: 10px 12px;

      .info-icon {
        width: 32px;
        height: 32px;
        font-size: 16px;
      }

      .info-content {
        .info-label {
          font-size: 10px;
          margin-bottom: 3px;
        }

        .info-value {
          font-size: 13px;

          &.consumption-value {
            font-size: 14px;
          }
        }
      }
    }
  }

  .info-card {
    :deep(.van-card__header) {
      padding: 12px;
    }
  }

  .tags-section {
    padding: 12px;
  }
}

.appointment-item {
  padding: 16px;
  border-bottom: 1px solid #ebedf0;

  &:last-child {
    border-bottom: none;
  }

  .appointment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .appointment-type {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
    }
  }

  .appointment-info {
    .info-row {
      display: flex;
      margin-bottom: 8px;
      font-size: 14px;

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

.opportunity-card {
  border: 2px solid #ff976a;
  
  .card-header {
    background: linear-gradient(135deg, #fff4e8 0%, #ffe8d0 100%);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .opportunity-header-icon {
      font-size: 20px;
      color: #ff976a;
    }
  }
}

.opportunity-item {
  padding: 16px;
  border-bottom: 1px solid #ebedf0;

  &:last-child {
    border-bottom: none;
  }

  .opportunity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;

    .opportunity-type-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;

      .opportunity-type-tag {
        margin: 0;
        font-weight: 500;
      }
    }

    .opportunity-status-wrapper {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;

      .push-status-tag {
        margin: 0;
      }
    }
  }

  .opportunity-info {
    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
      min-height: 24px;

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

      .priority-tag {
        margin: 0;
      }
    }
  }
}
</style>

