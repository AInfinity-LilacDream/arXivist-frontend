import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { useAuthStore } from '@/store/auth'

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 标记是否正在刷新token
let isRefreshing = false
// 存储等待token刷新的请求
let failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (error?: any) => void
}> = []

// 处理等待队列中的请求
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

// 请求拦截器
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 添加 token 到请求头
        const token = localStorage.getItem('access_token')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // 后端返回格式：{code, message, data: {...}}
        // 如果 response.data 有 data 字段，返回 response.data.data
        // 否则直接返回 response.data
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
            return (response.data as any).data
        }
        return response.data
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // 如果是401错误且不是刷新token的请求，尝试刷新token
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            // 如果是刷新token的请求也返回401，说明refresh_token也过期了
            if (originalRequest.url?.includes('/auth/refresh')) {
                // 清除token并跳转到登录页
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                // 触发事件通知应用需要重新登录
                window.dispatchEvent(new Event('auth:logout'))
                return Promise.reject(error)
            }

            // 如果正在刷新token，将请求加入队列
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then(token => {
                        if (originalRequest.headers && token) {
                            originalRequest.headers.Authorization = `Bearer ${token}`
                        }
                        // 重新发送原始请求，使用新的token
                        return apiClient(originalRequest)
                    })
                    .catch(err => {
                        return Promise.reject(err)
                    })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                // 获取refresh_token
                const refreshTokenValue = localStorage.getItem('refresh_token')
                if (!refreshTokenValue) {
                    throw new Error('No refresh token available')
                }

                // 调用刷新token接口
                const refreshResponse = await axios.post(
                    '/api/auth/refresh',
                    { refresh_token: refreshTokenValue },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                )

                // 处理响应数据
                let tokens: { access_token: string; refresh_token: string } | null = null
                if (refreshResponse.data && typeof refreshResponse.data === 'object' && 'data' in refreshResponse.data) {
                    tokens = (refreshResponse.data as any).data
                } else {
                    tokens = refreshResponse.data
                }

                // 验证tokens是否有效
                if (!tokens || !tokens.access_token || !tokens.refresh_token) {
                    throw new Error('Invalid token response format')
                }

                // 保存新的token
                const newAccessToken = tokens.access_token
                const newRefreshToken = tokens.refresh_token
                localStorage.setItem('access_token', newAccessToken)
                localStorage.setItem('refresh_token', newRefreshToken)

                // 更新auth store的状态
                try {
                    const authStore = useAuthStore()
                    authStore.accessToken = newAccessToken
                    authStore.refreshTokenValue = newRefreshToken
                } catch (e) {
                    // store可能还未初始化，忽略错误
                    console.warn('Failed to update auth store:', e)
                }

                // 更新请求头
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                }

                // 处理等待队列
                processQueue(null, newAccessToken)

                // 重试原始请求
                return apiClient(originalRequest)
            } catch (refreshError) {
                // 刷新token失败，清除token并处理队列
                processQueue(refreshError, null)
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                
                // 触发事件通知应用需要重新登录
                window.dispatchEvent(new Event('auth:logout'))
                
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        console.error('API Error:', error)
        return Promise.reject(error)
    }
)

export default apiClient
