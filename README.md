# C360 客户画像插件

汽车平台 C360 客户画像插件，支持在企业微信侧边栏和第三方 CRM 系统中运行。

## 技术栈

- **框架**: Vue3 (Composition API) + TypeScript
- **构建工具**: Vite
- **UI 库**: Vant 4
- **状态管理**: Pinia
- **路由**: Vue Router 4

## 功能特性

### 1. 多端免登录鉴权
- 自动识别运行环境（企业微信 / 内部系统）
- 企业微信环境：OAuth2 静默登录
- 内部系统环境：ticket 校验登录

### 2. C360 数据展示
- 客户基础信息展示
- 业务信息展示（意向车型、维保记录等）
- **冲突数据处理**：多源数据冲突时显示最优值，点击查看所有来源详情

### 3. 字段编辑权限
- 全局字段只读
- **仅手机号字段**支持手动修改并回传 API

### 4. 标签系统
- 展示客户标签
- 从标签池添加/删除标签

## 项目结构

```
src/
├── adapters/          # 适配器层
│   └── authAdapter.ts # 多端鉴权适配器
├── api/               # API 接口
│   └── customer.ts    # 客户相关接口
├── components/        # 组件
│   └── C360Field.vue  # 冲突字段组件
├── mock/              # Mock 数据
│   └── customer.ts    # 客户数据 Mock
├── router/            # 路由配置
│   └── index.ts
├── stores/            # Pinia Store
│   └── customer.ts    # 客户状态管理
├── styles/            # 全局样式
│   └── index.css
├── views/             # 页面
│   └── Home.vue       # 主页面
├── App.vue            # 根组件
└── main.ts            # 入口文件
```

## 开发

### 安装依赖

```bash
pnpm install
# 或
npm install
```

### 环境变量配置

首次运行前，需要在项目根目录创建环境变量文件：

**`.env.development`** (开发环境)
```env
# 开发环境配置
VITE_APP_ENV=development
VITE_USE_MOCK=true
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WECHAT_APP_ID=your_wechat_app_id
VITE_WECHAT_REDIRECT_URI=http://localhost:3000
```

**`.env.production`** (生产环境)
```env
# 生产环境配置
VITE_APP_ENV=production
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://api.example.com
VITE_WECHAT_APP_ID=your_production_wechat_app_id
VITE_WECHAT_REDIRECT_URI=https://your-domain.com
```

### 启动开发服务器

```bash
pnpm dev
# 或
npm run dev
```

启动后会自动：
- 打开浏览器（默认 http://localhost:3000）
- 启用热模块替换（HMR），代码修改后自动刷新
- 启用 Mock 数据（如果 `VITE_USE_MOCK=true`）

### 构建生产版本

```bash
# 生产环境构建
pnpm build

# 开发环境构建（用于测试）
pnpm build:dev

# 类型检查
pnpm type-check
```

### 预览构建结果

```bash
pnpm preview
```

## 环境变量

项目支持多环境配置：

- `.env.development` - 开发环境（默认启用 Mock）
- `.env.production` - 生产环境

主要配置项：
- `VITE_APP_ENV` - 当前环境标识
- `VITE_USE_MOCK` - 是否启用 Mock 数据（开发环境默认 true）
- `VITE_API_BASE_URL` - API 基础地址
- `VITE_WECHAT_APP_ID` - 企业微信 AppID
- `VITE_WECHAT_REDIRECT_URI` - 企业微信回调地址

## Mock 数据

项目使用 `vite-plugin-mock` 提供 Mock 数据支持。Mock 数据位于 `src/mock/customer.ts`，包含：

- 客户画像数据（含冲突数据）
- 标签池数据
- 模拟网络延迟（500ms-1000ms）

## 核心组件说明

### C360Field.vue

冲突字段展示组件，支持：
- 显示字段值和标签
- 冲突数据弹窗展示
- 可编辑字段（手机号）的编辑功能

### authAdapter.ts

多端鉴权适配器，自动识别环境并执行相应的鉴权流程。

## 注意事项

1. 侧边栏宽度约 350px，已做响应式适配
2. 所有异步请求都使用 Vant 的 Loading 和 Toast 组件处理状态
3. 冲突数据以最优值显示在主界面，点击可查看所有来源详情

