<template>
  <Card class="paper-card">
    <template #header>
      <div class="paper-header">
        <h3 class="paper-title">{{ paper.title }}</h3>
        <div class="paper-meta">
          <span class="paper-date">{{ formatDate(paper.published) }}</span>
          <span v-if="paper.categories.length > 0" class="paper-category">
            {{ paper.categories[0] }}
          </span>
        </div>
      </div>
    </template>

    <div class="paper-content">
      <div class="paper-authors">
        <span class="authors-label">作者：</span>
        <span class="authors-list">{{ paper.authors.join(', ') }}</span>
      </div>

      <p class="paper-abstract">{{ truncateText(paper.summary, 300) }}</p>

      <div v-if="paper.categories.length > 0" class="paper-categories">
        <span v-for="category in paper.categories" :key="category" class="category-tag">
          {{ category }}
        </span>
      </div>
    </div>

    <template #footer>
      <div class="paper-footer">
        <Button variant="ghost" size="sm" @click="handleRemove">
          从收藏夹移除
        </Button>
        <Button v-if="paper.entry_id" variant="outline" size="sm" @click="openLink(paper.entry_id)">
          查看详情
        </Button>
        <Button variant="primary" size="sm" @click="openLink(paper.pdf_url)">
          下载PDF
        </Button>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { formatDate, truncateText } from '@/utils/format'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import type { Paper } from '@/types'

interface Props {
  paper: Paper
  collectionId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  remove: [arxivId: string]
}>()

const openLink = (url: string) => {
  window.open(url, '_blank')
}

const handleRemove = () => {
  if (confirm('确定要从收藏夹中移除这篇论文吗？')) {
    emit('remove', props.paper.arxiv_id)
  }
}
</script>

<style scoped>
.paper-card {
  margin-bottom: 1.5rem;
}

.paper-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.paper-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem;
  line-height: 1.5;
}

.paper-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.paper-category {
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  font-weight: 500;
}

.paper-content {
  padding: 1rem 1.5rem;
}

.paper-authors {
  margin-bottom: 1rem;
  font-size: 0.9375rem;
  color: #4b5563;
}

.authors-label {
  font-weight: 500;
  color: #6b7280;
}

.authors-list {
  color: #1f2937;
}

.paper-abstract {
  color: #4b5563;
  line-height: 1.7;
  margin: 0 0 1rem;
  font-size: 0.9375rem;
}

.paper-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.category-tag {
  padding: 0.25rem 0.625rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.paper-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
</style>

