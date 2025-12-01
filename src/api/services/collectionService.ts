import apiClient from '../index'
import type {
  CollectionInfo,
  CollectionDetail,
  CollectionCreate,
  CollectionUpdate
} from '@/types'

/**
 * 获取当前用户的所有收藏夹
 */
export async function getCollections(): Promise<CollectionInfo[]> {
  try {
    const response = await apiClient.get<CollectionInfo[]>('/collections')
    return Array.isArray(response) ? response : []
  } catch (error) {
    console.error('Failed to fetch collections:', error)
    throw error
  }
}

/**
 * 创建收藏夹
 */
export async function createCollection(data: CollectionCreate): Promise<CollectionInfo> {
  try {
    const response = await apiClient.post<CollectionInfo>('/collections', data)
    return response as unknown as CollectionInfo
  } catch (error) {
    console.error('Failed to create collection:', error)
    throw error
  }
}

/**
 * 获取收藏夹详情（包含论文列表）
 */
export async function getCollectionDetail(collectionId: number): Promise<CollectionDetail> {
  try {
    const response = await apiClient.get<CollectionDetail>(`/collections/${collectionId}`)
    return response as unknown as CollectionDetail
  } catch (error) {
    console.error('Failed to fetch collection detail:', error)
    throw error
  }
}

/**
 * 更新收藏夹信息
 */
export async function updateCollection(
  collectionId: number,
  data: CollectionUpdate
): Promise<CollectionInfo> {
  try {
    const response = await apiClient.put<CollectionInfo>(`/collections/${collectionId}`, data)
    return response as unknown as CollectionInfo
  } catch (error) {
    console.error('Failed to update collection:', error)
    throw error
  }
}

/**
 * 删除收藏夹
 */
export async function deleteCollection(collectionId: number): Promise<void> {
  try {
    await apiClient.delete(`/collections/${collectionId}`)
  } catch (error) {
    console.error('Failed to delete collection:', error)
    throw error
  }
}

/**
 * 添加论文到收藏夹
 */
export async function addPaperToCollection(
  collectionId: number,
  arxivId: string
): Promise<void> {
  try {
    await apiClient.post(`/collections/${collectionId}/papers/${arxivId}`)
  } catch (error) {
    console.error('Failed to add paper to collection:', error)
    throw error
  }
}

/**
 * 从收藏夹删除论文
 */
export async function removePaperFromCollection(
  collectionId: number,
  arxivId: string
): Promise<void> {
  try {
    await apiClient.delete(`/collections/${collectionId}/papers/${arxivId}`)
  } catch (error) {
    console.error('Failed to remove paper from collection:', error)
    throw error
  }
}

