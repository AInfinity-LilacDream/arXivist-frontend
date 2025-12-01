import apiClient from '../index'
import type { UserLogin, UserRegister, TokenResponse, UserInfo, RefreshTokenRequest } from '@/types'

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
    const response = await apiClient.post<TokenResponse>('/auth/login', data)
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

