import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, TokenResponse } from '@/types'
import { login, logout, refreshToken, getCurrentUser, register, deleteCurrentUser as deleteUser } from '@/api/services/authService'
import type { UserLogin, UserRegister } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<UserInfo | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshTokenValue = ref<string | null>(null)

  // 计算属性
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  // 初始化：从 localStorage 恢复 token
  const initAuth = () => {
    const storedAccessToken = localStorage.getItem('access_token')
    const storedRefreshToken = localStorage.getItem('refresh_token')
    
    if (storedAccessToken && storedRefreshToken) {
      accessToken.value = storedAccessToken
      refreshTokenValue.value = storedRefreshToken
      // 尝试获取用户信息
      loadUser()
    }
  }

  // 保存 token 到 localStorage
  const saveTokens = (tokens: TokenResponse) => {
    if (!tokens || !tokens.access_token || !tokens.refresh_token) {
      throw new Error('Invalid token response: missing access_token or refresh_token')
    }
    accessToken.value = tokens.access_token
    refreshTokenValue.value = tokens.refresh_token
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
  }

  // 清除 token
  const clearTokens = () => {
    accessToken.value = null
    refreshTokenValue.value = null
    user.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  // 注册
  const registerUser = async (data: UserRegister) => {
    const userInfo = await register(data)
    user.value = userInfo
    return userInfo
  }

  // 登录
  const loginUser = async (data: UserLogin) => {
    const tokens = await login(data)
    saveTokens(tokens)
    await loadUser()
    return tokens
  }

  // 退出登录
  const logoutUser = async () => {
    if (refreshTokenValue.value) {
      try {
        await logout({ refresh_token: refreshTokenValue.value })
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
    clearTokens()
  }

  // 刷新 token
  const refreshAccessToken = async () => {
    if (!refreshTokenValue.value) {
      throw new Error('No refresh token available')
    }
    const tokens = await refreshToken({ refresh_token: refreshTokenValue.value })
    saveTokens(tokens)
    return tokens
  }

  // 加载用户信息
  const loadUser = async () => {
    try {
      const userInfo = await getCurrentUser()
      user.value = userInfo
      return userInfo
    } catch (error) {
      console.error('Failed to load user:', error)
      // 如果获取用户信息失败，清除 token
      clearTokens()
      throw error
    }
  }

  // 删除当前用户账号
  const deleteCurrentUser = async () => {
    try {
      await deleteUser()
      clearTokens()
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
  }

  return {
    // 状态
    user,
    accessToken,
    refreshTokenValue,
    // 计算属性
    isAuthenticated,
    // 方法
    initAuth,
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    loadUser,
    clearTokens,
    deleteCurrentUser
  }
})

