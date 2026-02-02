/**
 * 多端鉴权适配器
 * 支持企业微信 OAuth2 和内部系统 ticket 两种鉴权方式
 */

// 环境类型
export type AuthEnvironment = 'wechat' | 'internal' | 'unknown'

// 鉴权结果
export interface AuthResult {
  success: boolean
  token?: string
  userId?: string
  message?: string
}

/**
 * 检测当前运行环境
 */
export function detectEnvironment(): AuthEnvironment {
  // 检测是否在企业微信环境中
  if (typeof window !== 'undefined' && window.navigator) {
    const ua = window.navigator.userAgent.toLowerCase()
    // 企业微信 User-Agent 特征
    if (ua.includes('wxwork') || ua.includes('micromessenger')) {
      // 进一步检测是否是企业微信（而非普通微信）
      if (ua.includes('wxwork')) {
        return 'wechat'
      }
    }
    
    // 检测 URL 参数中是否有 ticket（内部系统特征）
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('ticket')) {
      return 'internal'
    }
  }
  
  return 'unknown'
}

/**
 * 企业微信 OAuth2 静默登录
 */
async function wechatOAuth2Login(): Promise<AuthResult> {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    // 如果没有 code，需要先跳转到授权页面
    if (!code) {
      const appId = import.meta.env.VITE_WECHAT_APP_ID
      const redirectUri = encodeURIComponent(
        import.meta.env.VITE_WECHAT_REDIRECT_URI || window.location.href.split('?')[0]
      )
      const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect`
      
      // 跳转到授权页面
      window.location.href = authUrl
      return { success: false, message: '跳转授权中...' }
    }
    
    // 使用 code 换取 token
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/wechat/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })
    
    const data = await response.json()
    
    if (data.code === 200 && data.data?.token) {
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('userId', data.data.userId || '')
      return {
        success: true,
        token: data.data.token,
        userId: data.data.userId,
      }
    }
    
    return {
      success: false,
      message: data.message || '获取 token 失败',
    }
  } catch (error) {
    console.error('企业微信登录失败:', error)
    return {
      success: false,
      message: '网络错误，请稍后重试',
    }
  }
}

/**
 * 内部系统 ticket 登录
 */
async function internalTicketLogin(): Promise<AuthResult> {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const ticket = urlParams.get('ticket')
    
    if (!ticket) {
      return {
        success: false,
        message: '缺少 ticket 参数',
      }
    }
    
    // 校验 ticket 并获取 token
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/internal/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticket }),
    })
    
    const data = await response.json()
    
    if (data.code === 200 && data.data?.token) {
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('userId', data.data.userId || '')
      // 清除 URL 中的 ticket 参数（可选，保护隐私）
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
      
      return {
        success: true,
        token: data.data.token,
        userId: data.data.userId,
      }
    }
    
    return {
      success: false,
      message: data.message || 'ticket 校验失败',
    }
  } catch (error) {
    console.error('内部系统登录失败:', error)
    return {
      success: false,
      message: '网络错误，请稍后重试',
    }
  }
}

/**
 * 统一鉴权入口
 */
export async function authenticate(): Promise<AuthResult> {
  // 如果已有 token，直接返回
  const existingToken = localStorage.getItem('token')
  if (existingToken) {
    return {
      success: true,
      token: existingToken,
      userId: localStorage.getItem('userId') || undefined,
    }
  }
  
  const env = detectEnvironment()
  
  switch (env) {
    case 'wechat':
      return await wechatOAuth2Login()
    case 'internal':
      return await internalTicketLogin()
    case 'unknown':
    default:
      // 开发环境或未知环境，可以使用 mock token
      if (import.meta.env.DEV) {
        const mockToken = 'mock_token_' + Date.now()
        localStorage.setItem('token', mockToken)
        localStorage.setItem('userId', 'mock_user_001')
        return {
          success: true,
          token: mockToken,
          userId: 'mock_user_001',
        }
      }
      return {
        success: false,
        message: '无法识别运行环境，请在企业微信或内部系统中打开',
      }
  }
}

/**
 * 登出
 */
export function logout(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
}

/**
 * 获取当前 token
 */
export function getToken(): string | null {
  return localStorage.getItem('token')
}

/**
 * 获取当前用户 ID
 */
export function getUserId(): string | null {
  return localStorage.getItem('userId')
}

