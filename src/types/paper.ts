export interface Paper {
    arxiv_id: string
    title: string
    authors: string[]
    summary: string
    published: string
    updated?: string
    pdf_url: string
    categories: string[]
    entry_id: string
    ai_summary?: AISummary | null // AI 生成的摘要（列表API可能返回）
}

/**
 * Token 使用情况
 */
export interface TokenUsage {
    prompt_tokens?: number | null
    completion_tokens?: number | null
    total_tokens?: number | null
    reasoning_length?: number | null
    content_length?: number | null
}

/**
 * AI 评分详情
 */
export interface AIScoreDetail {
    total_score?: number | null // 总分（0-100分）
    innovation_score?: number | null // 创新性评分（0-30分）
    technical_depth_score?: number | null // 技术深度评分（0-25分）
    practical_value_score?: number | null // 实用价值评分（0-20分）
    experiments_score?: number | null // 实验充分性评分（0-15分）
    writing_score?: number | null // 可理解性/写作质量评分（0-10分）
    summary?: string | null // 论文总结
    strengths?: string[] | null // 论文优点列表
    weaknesses?: string[] | null // 论文缺点列表
    recommendation?: '推荐' | '强烈推荐' | null // 推荐建议
    reasoning?: string | null // 评分推理过程
    paper_id?: string | null // 论文ID
    api_model?: string | null // API模型名称
    api_request_id?: string | null // API请求ID
    api_created_timestamp?: number | null // API创建时间戳
}

/**
 * AI 生成的摘要
 */
export interface AISummary {
    score?: number | null // AI 综合评分（0-100分）
    detail?: AIScoreDetail | null // AI 评分详情
    token_usage?: TokenUsage | null // Token 使用情况
}

/**
 * 论文详情（扩展 Paper 模型）
 */
export interface PaperDetail extends Paper {
    ai_summary?: AISummary | null // AI 生成的摘要
}

/**
 * 论文查询参数
 */
export interface PaperQueryParams {
    start_date?: string
    max_results?: number
    category?: string
}

/**
 * AI评分任务状态
 */
export interface AIScoreTaskStatus {
    task_id: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    result?: AISummary | null
    error?: string | null
    created_at?: string
    updated_at?: string
}

/**
 * 异步AI评分任务响应
 */
export interface AIScoreTaskResponse {
    task_id: string
    arxiv_id: string
}

/**
 * 论文列表响应
 */
export interface PaperListResponse {
    papers: Paper[]
    total: number
    date_range: string
}
