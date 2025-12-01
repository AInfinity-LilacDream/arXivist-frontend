<template>
  <div v-if="visible" class="dialog-overlay" @click="handleOverlayClick">
    <div class="dialog-container" @click.stop>
      <div class="dialog-header">
        <h3 class="dialog-title">{{ isEdit ? '编辑收藏夹' : '创建收藏夹' }}</h3>
        <button class="dialog-close" @click="handleClose">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="dialog-content">
        <div class="form-group">
          <label class="form-label" for="name">收藏夹名称 *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="请输入收藏夹名称"
            required
            maxlength="255"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="description">描述</label>
          <textarea
            id="description"
            v-model="form.description"
            class="form-textarea"
            placeholder="请输入收藏夹描述（可选）"
            rows="4"
            maxlength="2000"
            :disabled="loading"
          ></textarea>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="dialog-actions">
          <Button variant="outline" @click="handleClose" :disabled="loading">
            取消
          </Button>
          <Button type="submit" variant="primary" :loading="loading" :disabled="loading">
            {{ isEdit ? '保存' : '创建' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { CollectionInfo, CollectionCreate, CollectionUpdate } from '@/types'
import Button from '@/components/common/Button.vue'

interface Props {
  visible: boolean
  collection?: CollectionInfo | null
}

const props = withDefaults(defineProps<Props>(), {
  collection: null
})

const emit = defineEmits<{
  close: []
  submit: [data: CollectionCreate | CollectionUpdate]
}>()

const isEdit = computed(() => !!props.collection)
const loading = ref(false)
const error = ref('')

const form = ref<{ name: string; description: string }>({
  name: '',
  description: ''
})

// 监听collection变化，填充表单
watch(
  () => props.collection,
  (collection) => {
    if (collection) {
      form.value = {
        name: collection.name,
        description: collection.description || ''
      }
    } else {
      form.value = {
        name: '',
        description: ''
      }
    }
    error.value = ''
  },
  { immediate: true }
)

// 监听visible变化，重置表单
watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      form.value = {
        name: '',
        description: ''
      }
      error.value = ''
      loading.value = false
    } else if (props.collection) {
      form.value = {
        name: props.collection.name,
        description: props.collection.description || ''
      }
    }
  }
)

const handleClose = () => {
  emit('close')
}

const handleOverlayClick = () => {
  if (!loading.value) {
    handleClose()
  }
}

const handleSubmit = () => {
  error.value = ''
  loading.value = true

  const data = {
    name: form.value.name.trim(),
    description: form.value.description.trim() || null
  }

  emit('submit', data)
  loading.value = false
}
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
  max-width: 500px;
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

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:hover:not(:disabled),
.form-textarea:hover:not(:disabled) {
  border-color: #667eea;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled,
.form-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
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

