import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
})

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
    (error) => {
        console.error('API Error:', error)
        return Promise.reject(error)
    }
)

export default apiClient
