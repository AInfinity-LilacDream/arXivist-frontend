<template>
  <div v-if="visible" class="dialog-overlay" @click="handleOverlayClick">
    <div class="dialog-container" @click.stop>
      <div class="dialog-header">
        <h3 class="dialog-title">添加到收藏夹</h3>
        <button class="dialog-close" @click="handleClose">×</button>
      </div>

      <div class="dialog-content">
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>加载收藏夹中...</p>
        </div>

        <div v-else-if="collections.length === 0" class="empty-collections">
          <p>还没有收藏夹，先创建一个吧！</p>
          <Button variant="primary" @click="handleCreateCollection">
            创建收藏夹
          </Button>
        </div>

        <div v-else class="collections-list">
          <div
            v-for="collection in collections"
            :key="collection.id"
            class="collection-item"
            :class="{ 'collection-item-selected': selectedCollectionId === collection.id }"
            @click="selectCollection(collection.id)"
          >
            <div class="collection-item-info">
              <h4 class="collection-item-name">{{ collection.name }}</h4>
              <p v-if="collection.description" class="collection-item-description">
                {{ collection.description }}
              </p>
              <span class="collection-item-count">{{ collection.paper_count }} 篇论文</span>
            </div>
            <div v-if="selectedCollectionId === collection.id" class="collection-item-check">
              ✓
            </div>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="dialog-actions">
          <Button variant="outline" @click="handleClose" :disabled="loading || adding">
            取消
          </Button>
          <Button
            variant="primary"
            @click="handleAdd"
            :loading="adding"
            :disabled="!selectedCollectionId || loading || adding"
          >
            添加
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCollections, addPaperToCollection } from '@/api/services/collectionService'
import type { CollectionInfo } from '@/types'
import Button from '@/components/common/Button.vue'

interface Props {
  visible: boolean
  arxivId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const router = useRouter()
const collections = ref<CollectionInfo[]>([])
const selectedCollectionId = ref<number | null>(null)
const loading = ref(false)
const adding = ref(false)
const error = ref('')

// 加载收藏夹列表
const loadCollections = async () => {
  loading.value = true
  error.value = ''
  try {
    collections.value = await getCollections()
  } catch (err: any) {
    console.error('Failed to load collections:', err)
    error.value = err.response?.data?.message || '加载收藏夹失败'
  } finally {
    loading.value = false
  }
}

// 监听visible变化
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      selectedCollectionId.value = null
      error.value = ''
      loadCollections()
    }
  }
)

// 选择收藏夹
const selectCollection = (collectionId: number) => {
  selectedCollectionId.value = collectionId
  error.value = ''
}

// 创建收藏夹
const handleCreateCollection = () => {
  handleClose()
  router.push('/collections')
}

// 添加到收藏夹
const handleAdd = async () => {
  if (!selectedCollectionId.value) return

  adding.value = true
  error.value = ''
  try {
    await addPaperToCollection(selectedCollectionId.value, props.arxivId)
    emit('success')
    handleClose()
  } catch (err: any) {
    console.error('Failed to add paper to collection:', err)
    error.value = err.response?.data?.message || '添加到收藏夹失败'
  } finally {
    adding.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  emit('close')
}

// 点击遮罩层
const handleOverlayClick = () => {
  if (!loading.value && !adding.value) {
    handleClose()
  }
}

onMounted(() => {
  if (props.visible) {
    loadCollections()
  }
})
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog-container {
  background: white;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.dialog-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.dialog-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.dialog-content {
  padding: 1.5rem;
}

.loading-container,
.empty-collections {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
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

.collections-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1.5rem;
}

.collection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.collection-item:hover {
  border-color: #667eea;
  background: #f9fafb;
}

.collection-item-selected {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.collection-item-info {
  flex: 1;
}

.collection-item-name {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.collection-item-description {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.collection-item-count {
  font-size: 0.75rem;
  color: #9ca3af;
}

.collection-item-check {
  font-size: 1.5rem;
  color: #667eea;
  font-weight: bold;
}

.error-message {
  padding: 0.75rem 1rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.dialog-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
</style>

