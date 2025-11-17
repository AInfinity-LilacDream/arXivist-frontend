import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

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
    (config: AxiosRequestConfig) => {
        // 可以在这里添加token等
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // 如果后端返回的数据结构是 { code, message, data }
        if (response.data && typeof response.data === 'object') {
            return response.data
        }
        return response
    },
    (error) => {
        // 错误处理
        console.error('API Error:', error)
        return Promise.reject(error)
    }
)

export default apiClient
