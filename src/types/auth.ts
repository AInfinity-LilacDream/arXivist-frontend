/**
 * 用户登录请求
 */
export interface UserLogin {
  email: string
  password: string
}

/**
 * 用户注册请求
 */
export interface UserRegister {
  email: string
  password: string
}

/**
 * Token 响应
 */
export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type?: string
}

/**
 * 用户状态枚举
 */
export type UserState = 'inactive' | 'active'

/**
 * 用户信息
 */
export interface UserInfo {
  id: number
  email: string
  state: UserState
  created_at: string
}

/**
 * 刷新 Token 请求
 */
export interface RefreshTokenRequest {
  refresh_token: string
}

