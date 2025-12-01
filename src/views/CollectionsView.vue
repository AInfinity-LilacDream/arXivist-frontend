<template>
  <MainLayout>
    <div class="collections-view">
      <div class="collections-container">
        <div class="collections-header">
          <h2 class="page-title">我的收藏夹</h2>
          <Button variant="primary" @click="showCreateDialog">
            + 新建收藏夹
          </Button>
        </div>

        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="collections.length === 0" class="empty-container">
          <p class="empty-text">还没有收藏夹，创建一个吧！</p>
        </div>

        <div v-else class="collections-grid">
          <Card
            v-for="collection in collections"
            :key="collection.id"
            class="collection-card"
            @click="goToCollectionDetail(collection.id)"
          >
            <div class="collection-card-content">
              <h3 class="collection-name">{{ collection.name }}</h3>
              <p v-if="collection.description" class="collection-description">
                {{ collection.description }}
              </p>
              <div class="collection-meta">
                <span class="collection-count">{{ collection.paper_count }} 篇论文</span>
                <span class="collection-date">
                  {{ formatDate(collection.updated_at) }}
                </span>
              </div>
              <div class="collection-actions" @click.stop>
                <Button
                  variant="ghost"
                  size="sm"
                  @click.stop="handleEdit(collection)"
                >
                  编辑
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click.stop="handleDelete(collection)"
                >
                  删除
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- 创建/编辑对话框 -->
      <CollectionDialog
        :visible="dialogVisible"
        :collection="editingCollection"
        @close="handleDialogClose"
        @submit="handleDialogSubmit"
      />
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCollections, createCollection, updateCollection, deleteCollection } from '@/api/services/collectionService'
import { formatDate } from '@/utils/format'
import type { CollectionInfo, CollectionCreate, CollectionUpdate } from '@/types'
import MainLayout from '@/components/layout/MainLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import CollectionDialog from '@/components/collection/CollectionDialog.vue'

const router = useRouter()

const collections = ref<CollectionInfo[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingCollection = ref<CollectionInfo | null>(null)

// 加载收藏夹列表
const loadCollections = async () => {
  loading.value = true
  try {
    collections.value = await getCollections()
  } catch (error: any) {
    console.error('Failed to load collections:', error)
    alert(error.response?.data?.message || '加载收藏夹失败')
  } finally {
    loading.value = false
  }
}

// 显示创建对话框
const showCreateDialog = () => {
  editingCollection.value = null
  dialogVisible.value = true
}

// 编辑收藏夹
const handleEdit = (collection: CollectionInfo) => {
  editingCollection.value = collection
  dialogVisible.value = true
}

// 删除收藏夹
const handleDelete = async (collection: CollectionInfo) => {
  if (!confirm(`确定要删除收藏夹"${collection.name}"吗？此操作不可恢复！`)) {
    return
  }

  try {
    await deleteCollection(collection.id)
    await loadCollections()
  } catch (error: any) {
    console.error('Failed to delete collection:', error)
    alert(error.response?.data?.message || '删除收藏夹失败')
  }
}

// 跳转到收藏夹详情
const goToCollectionDetail = (collectionId: number) => {
  router.push(`/collections/${collectionId}`)
}

// 对话框关闭
const handleDialogClose = () => {
  dialogVisible.value = false
  editingCollection.value = null
}

// 对话框提交
const handleDialogSubmit = async (data: CollectionCreate | CollectionUpdate) => {
  try {
    if (editingCollection.value) {
      // 编辑
      await updateCollection(editingCollection.value.id, data as CollectionUpdate)
    } else {
      // 创建
      await createCollection(data as CollectionCreate)
    }
    await loadCollections()
    handleDialogClose()
  } catch (error: any) {
    console.error('Failed to save collection:', error)
    alert(error.response?.data?.message || '保存收藏夹失败')
  }
}

onMounted(() => {
  loadCollections()
})
</script>

<style scoped>
.collections-view {
  min-height: 100%;
}

.collections-container {
  max-width: 1200px;
  margin: 0 auto;
}

.collections-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #a0a0a0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #333333;
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-text {
  font-size: 1rem;
  margin: 0;
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.collection-card {
  cursor: pointer;
  transition: all 0.2s;
}

.collection-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.collection-card-content {
  padding: 1.5rem;
}

.collection-name {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
}

.collection-description {
  margin: 0 0 1rem;
  color: #c0c0c0;
  font-size: 0.9375rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.collection-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #333;
  font-size: 0.875rem;
  color: #a0a0a0;
}

.collection-count {
  font-weight: 500;
  color: #ffffff;
}

.collection-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
  padding-top: 1rem;
}

.collections-header :deep(.btn-primary) {
  background: transparent !important;
  color: #ffffff !important;
  border: 2px solid #ffffff !important;
}

.collections-header :deep(.btn-primary:hover:not(:disabled)) {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: #ffffff !important;
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .collections-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .collections-grid {
    grid-template-columns: 1fr;
  }
}
</style>

