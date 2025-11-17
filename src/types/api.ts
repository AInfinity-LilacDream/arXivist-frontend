/**
 * API响应基础结构
 */
export interface ApiResponse<T = any> {
    code: number
    message: string
    data: T
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    pageSize: number
}
