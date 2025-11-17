import apiClient from '../index'
import type { Paper, PaperQueryParams, PaperListResponse } from '@/types'

/**
 * 获取论文列表
 */
export async function getPapers(params?: PaperQueryParams): Promise<Paper[]> {
    try {
        const response = await apiClient.get<PaperListResponse>('/papers/', {
            params: {
                start_date: params?.start_date,
                max_results: params?.max_results || 100,
                category: params?.category
            }
        })

        return response.papers
    } catch (error) {
        console.error('Failed to fetch papers:', error)
        throw error
    }
}
