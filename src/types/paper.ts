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
 * 论文列表响应
 */
export interface PaperListResponse {
    papers: Paper[]
    total: number
    date_range: string
}
