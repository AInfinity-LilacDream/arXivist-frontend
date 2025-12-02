import apiClient from '../index'
import type { UserLogin, UserRegister, TokenResponse, UserInfo, RefreshTokenRequest, UserUpdate } from '@/types'

/**
 * 用户注册
 */
export async function register(data: UserRegister): Promise<UserInfo> {
  try {
    const response = await apiClient.post<UserInfo>('/auth/register', data)
    return response as unknown as UserInfo
  } catch (error) {
    console.error('Failed to register:', error)
    throw error
  }
}

/**
 * 用户登录
 */
export async function login(data: UserLogin): Promise<TokenResponse> {
  try {
    const response = await apiClient.post<any>('/auth/login', data)
    
    // 检查响应是否包含错误信息（后端可能返回200但包含错误）
    // 如果响应为null或undefined，说明登录失败
    if (!response || response === null) {
      const error: any = new Error('登录失败：未返回有效数据')
      error.response = {
        data: {
          message: '登录失败：未返回有效数据'
        }
      }
      throw error
    }
    
    // 如果响应是对象
    if (typeof response === 'object') {
      // 如果响应中有message字段且没有token，说明登录失败
      if (response.message && !response.access_token && !response.refresh_token) {
        const error: any = new Error(response.message)
        error.response = {
          data: {
            message: response.message
          }
        }
        throw error
      }
      
      // 如果响应中有code字段且不是成功码，说明登录失败
      if (response.code !== undefined && response.code !== 0 && response.code !== 200) {
        const error: any = new Error(response.message || '登录失败')
        error.response = {
          data: {
            message: response.message || '登录失败'
          }
        }
        throw error
      }
      
      // 检查是否有必要的token字段
      if (!response.access_token || !response.refresh_token) {
        // 如果有错误消息，使用它；否则使用默认消息
        const errorMessage = response.message || '登录失败：邮箱或密码错误'
        const error: any = new Error(errorMessage)
        error.response = {
          data: {
            message: errorMessage
          }
        }
        throw error
      }
    } else {
      // 响应不是对象，说明格式错误
      const error: any = new Error('登录失败：响应格式错误')
      error.response = {
        data: {
          message: '登录失败：响应格式错误'
        }
      }
      throw error
    }
    
    return response as unknown as TokenResponse
  } catch (error) {
    console.error('Failed to login:', error)
    throw error
  }
}

/**
 * 用户退出登录
 */
export async function logout(data: RefreshTokenRequest): Promise<void> {
  try {
    await apiClient.post('/auth/logout', data)
  } catch (error) {
    console.error('Failed to logout:', error)
    throw error
  }
}

/**
 * 刷新访问令牌
 */
export async function refreshToken(data: RefreshTokenRequest): Promise<TokenResponse> {
  try {
    const response = await apiClient.post<TokenResponse>('/auth/refresh', data)
    return response as unknown as TokenResponse
  } catch (error) {
    console.error('Failed to refresh token:', error)
    throw error
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<UserInfo> {
  try {
    const response = await apiClient.get<UserInfo>('/auth/me')
    return response as unknown as UserInfo
  } catch (error) {
    console.error('Failed to get current user:', error)
    throw error
  }
}

/**
 * 更新当前用户信息
 */
export async function updateCurrentUser(data: UserUpdate): Promise<UserInfo> {
  try {
    const response = await apiClient.put<UserInfo>('/auth/me', data)
    return response as unknown as UserInfo
  } catch (error) {
    console.error('Failed to update current user:', error)
    throw error
  }
}

/**
 * 删除当前用户账号
 */
export async function deleteCurrentUser(): Promise<void> {
  try {
    await apiClient.delete('/auth/me')
  } catch (error) {
    console.error('Failed to delete current user:', error)
    throw error
  }
}

