/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_WECHAT_APP_ID: string
  readonly VITE_WECHAT_REDIRECT_URI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

