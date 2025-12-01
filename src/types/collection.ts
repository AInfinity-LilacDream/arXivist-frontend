/**
 * 收藏夹基本信息
 */
export interface CollectionInfo {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
  paper_count: number
}

/**
 * 收藏夹详情（包含论文列表）
 */
export interface CollectionDetail extends CollectionInfo {
  papers: CollectionPaperInfo[]
}

/**
 * 收藏夹中的论文信息
 */
export interface CollectionPaperInfo {
  arxiv_id: string
  title: string
  authors: string[]
  summary: string
  published: string
  updated?: string | null
  pdf_url: string
  categories: string[]
  entry_id: string
  added_at: string
}

/**
 * 创建收藏夹请求
 */
export interface CollectionCreate {
  name: string
  description?: string | null
}

/**
 * 更新收藏夹请求
 */
export interface CollectionUpdate {
  name?: string | null
  description?: string | null
}

