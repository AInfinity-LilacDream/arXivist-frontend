<template>
  <MainLayout>
    <div class="collection-detail-view">
      <div class="collection-detail-container">
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="collection">
          <div class="collection-header">
            <div class="collection-info">
              <h2 class="collection-title">{{ collection.name }}</h2>
              <p v-if="collection.description" class="collection-description">
                {{ collection.description }}
              </p>
              <div class="collection-meta">
                <span>{{ collection.paper_count }} 篇论文</span>
                <span>更新于 {{ formatDate(collection.updated_at) }}</span>
              </div>
            </div>
            <div class="collection-header-actions">
              <Button variant="outline" @click="handleEdit">
                编辑收藏夹
              </Button>
              <Button variant="secondary" @click="handleDelete">
                删除收藏夹
              </Button>
            </div>
          </div>

          <div v-if="collection.papers.length === 0" class="empty-papers">
            <p>这个收藏夹还没有论文，去主页添加一些吧！</p>
          </div>

          <div v-else class="papers-section">
            <CollectionPaperCard
              v-for="paper in formattedPapers"
              :key="paper.arxiv_id"
              :paper="paper"
              :collection-id="collection.id"
              @remove="handleRemovePaper"
            />
          </div>
        </div>

        <div v-else class="error-container">
          <p>收藏夹不存在或加载失败</p>
          <Button variant="primary" @click="$router.push('/collections')">
            返回收藏夹列表
          </Button>
        </div>
      </div>

      <!-- 编辑对话框 -->
      <CollectionDialog
        v-if="collection"
        :visible="dialogVisible"
        :collection="collection"
        @close="handleDialogClose"
        @submit="handleDialogSubmit"
      />
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCollectionDetail, updateCollection, deleteCollection, removePaperFromCollection } from '@/api/services/collectionService'
import { formatDate } from '@/utils/format'
import type { CollectionDetail, CollectionUpdate, CollectionPaperInfo } from '@/types'
import type { Paper } from '@/types'
import MainLayout from '@/components/layout/MainLayout.vue'
import Button from '@/components/common/Button.vue'
import CollectionPaperCard from '@/components/collection/CollectionPaperCard.vue'
import CollectionDialog from '@/components/collection/CollectionDialog.vue'

const route = useRoute()
const router = useRouter()

const collection = ref<CollectionDetail | null>(null)
const loading = ref(false)
const dialogVisible = ref(false)

// 将CollectionPaperInfo转换为Paper格式
const formattedPapers = computed<Paper[]>(() => {
  if (!collection.value) return []
  return collection.value.papers.map((paper) => ({
    arxiv_id: paper.arxiv_id,
    title: paper.title,
    authors: paper.authors,
    summary: paper.summary,
    published: paper.published,
    updated: paper.updated || undefined,
    pdf_url: paper.pdf_url,
    categories: paper.categories,
    entry_id: paper.entry_id
  }))
})

// 加载收藏夹详情
const loadCollectionDetail = async () => {
  const collectionId = parseInt(route.params.id as string)
  if (isNaN(collectionId)) {
    router.push('/collections')
    return
  }

  loading.value = true
  try {
    collection.value = await getCollectionDetail(collectionId)
  } catch (error: any) {
    console.error('Failed to load collection detail:', error)
    alert(error.response?.data?.message || '加载收藏夹详情失败')
  } finally {
    loading.value = false
  }
}

// 编辑收藏夹
const handleEdit = () => {
  dialogVisible.value = true
}

// 删除收藏夹
const handleDelete = async () => {
  if (!collection.value) return

  if (!confirm(`确定要删除收藏夹"${collection.value.name}"吗？此操作不可恢复！`)) {
    return
  }

  try {
    await deleteCollection(collection.value.id)
    router.push('/collections')
  } catch (error: any) {
    console.error('Failed to delete collection:', error)
    alert(error.response?.data?.message || '删除收藏夹失败')
  }
}

// 对话框关闭
const handleDialogClose = () => {
  dialogVisible.value = false
}

// 对话框提交
const handleDialogSubmit = async (data: CollectionUpdate) => {
  if (!collection.value) return

  try {
    await updateCollection(collection.value.id, data)
    await loadCollectionDetail()
    handleDialogClose()
  } catch (error: any) {
    console.error('Failed to update collection:', error)
    alert(error.response?.data?.message || '更新收藏夹失败')
  }
}

// 从收藏夹移除论文
const handleRemovePaper = async (arxivId: string) => {
  if (!collection.value) return

  try {
    await removePaperFromCollection(collection.value.id, arxivId)
    await loadCollectionDetail()
  } catch (error: any) {
    console.error('Failed to remove paper from collection:', error)
    alert(error.response?.data?.message || '移除论文失败')
  }
}

onMounted(() => {
  loadCollectionDetail()
})
</script>

<style scoped>
.collection-detail-view {
  min-height: 100%;
}

.collection-detail-container {
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.collection-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.collection-info {
  flex: 1;
}

.collection-title {
  margin: 0 0 0.75rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
}

.collection-description {
  margin: 0 0 1rem;
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.6;
}

.collection-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.collection-header-actions {
  display: flex;
  gap: 0.75rem;
}

.empty-papers {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.papers-section {
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .collection-header {
    flex-direction: column;
    gap: 1rem;
  }

  .collection-header-actions {
    width: 100%;
    flex-direction: column;
  }
}
</style>

