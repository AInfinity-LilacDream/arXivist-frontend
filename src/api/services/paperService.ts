import apiClient from '../index'
import type { Paper, PaperQueryParams, PaperListResponse, PaperDetail, AISummary, AIScoreTaskResponse, AIScoreTaskStatus, TranslationRequest, TranslationResponse, TranslationTaskStatus, TranslationTaskCreate } from '@/types'

/**
 * 获取论文列表
 */
export async function getPapers(params?: PaperQueryParams): Promise<Paper[]> {
    try {
        // 响应拦截器已经返回了 data 字段，所以这里直接得到 PaperListResponse
        const response = await apiClient.get<PaperListResponse>('/papers/', {
            params: {
                start_date: params?.start_date,
                max_results: params?.max_results || 100,
                category: params?.category
            }
        })

        // 检查响应格式
        if (response && typeof response === 'object' && 'papers' in response) {
            return response.papers || []
        }
        
        // 如果响应格式不对，尝试直接返回（可能是数组）
        if (Array.isArray(response)) {
            return response
        }
        
        console.warn('Unexpected response format:', response)
        return []
    } catch (error) {
        console.error('Failed to fetch papers:', error)
        throw error
    }
}

/**
 * 获取论文详情（不包含AI评分）
 */
export async function getPaperDetail(arxivId: string): Promise<PaperDetail> {
    try {
        const response = await apiClient.get<PaperDetail>(`/papers/${arxivId}`)
        return response
    } catch (error) {
        console.error('Failed to fetch paper detail:', error)
        throw error
    }
}

/**
 * 启动异步AI评分任务
 */
export async function startAIScoreTask(arxivId: string): Promise<AIScoreTaskResponse> {
    try {
        const response = await apiClient.post<AIScoreTaskResponse>(`/papers/${arxivId}/ai-score/async`)
        return response
    } catch (error) {
        console.error('Failed to start AI score task:', error)
        throw error
    }
}

/**
 * 获取AI评分任务状态
 */
export async function getAIScoreTaskStatus(taskId: string): Promise<AIScoreTaskStatus> {
    try {
        const response = await apiClient.get<AIScoreTaskStatus>(`/papers/ai-score/tasks/${taskId}`)
        return response
    } catch (error) {
        console.error('Failed to get AI score task status:', error)
        throw error
    }
}

/**
 * 启动异步翻译任务
 */
export async function startTranslationTask(request: TranslationRequest): Promise<TranslationTaskCreate> {
    try {
        const response = await apiClient.post<TranslationTaskCreate>('/papers/translate/async', request)
        return response
    } catch (error) {
        console.error('Failed to start translation task:', error)
        throw error
    }
}

/**
 * 获取翻译任务状态
 */
export async function getTranslationTaskStatus(taskId: string): Promise<TranslationTaskStatus> {
    try {
        const response = await apiClient.get<TranslationTaskStatus>(`/papers/translate/tasks/${taskId}`)
        return response
    } catch (error) {
        console.error('Failed to get translation task status:', error)
        throw error
    }
}
