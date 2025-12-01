<template>
  <Card class="paper-card">
    <template #header>
      <div class="paper-header">
        <h3 class="paper-title" v-html="renderLatex(paper.title)"></h3>
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

      <p class="paper-abstract" v-html="renderLatex(truncateText(paper.summary, 300))"></p>

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
        <Button variant="outline" size="sm" @click="viewDetail">
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
import { useRouter } from 'vue-router'
import { formatDate, truncateText } from '@/utils/format'
import { renderLatex } from '@/utils/latex'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import type { Paper } from '@/types'

interface Props {
  paper: Paper
  collectionId: number
}

const props = defineProps<Props>()
const router = useRouter()

const emit = defineEmits<{
  remove: [arxivId: string]
}>()

const openLink = (url: string) => {
  window.open(url, '_blank')
}

const viewDetail = () => {
  router.push({ name: 'paper-detail', params: { arxiv_id: props.paper.arxiv_id } })
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
  background: #000000 !important;
  color: #ffffff;
}

.paper-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #333333;
}

.paper-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.75rem;
  line-height: 1.5;
}

.paper-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.875rem;
  color: #ffffff;
  opacity: 0.8;
  flex-wrap: wrap;
}

.paper-category {
  padding: 0.25rem 0.75rem;
  background: #1a1a1a;
  border-radius: 0.25rem;
  font-weight: 500;
  color: #ffffff;
}

.paper-content {
  padding: 1rem 1.5rem;
}

.paper-authors {
  margin-bottom: 1rem;
  font-size: 0.9375rem;
  color: #ffffff;
  opacity: 0.9;
}

.authors-label {
  font-weight: 500;
  color: #ffffff;
  opacity: 0.7;
}

.authors-list {
  color: #ffffff;
}

.paper-abstract {
  color: #ffffff;
  opacity: 0.8;
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
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.paper-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #333333;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.paper-footer .btn-ghost {
  color: #ffffff !important;
}

.paper-footer .btn-ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

.paper-footer .btn-outline {
  background: transparent !important;
  border: 2px solid #ffffff !important;
  color: #ffffff !important;
}

.paper-footer .btn-outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: #ffffff !important;
  color: #ffffff !important;
}

.paper-footer .btn-primary {
  background: #ffffff !important;
  color: #000000 !important;
  border: 2px solid #ffffff !important;
}

.paper-footer .btn-primary:hover:not(:disabled) {
  background: #f0f0f0 !important;
  color: #000000 !important;
  border-color: #ffffff !important;
}
</style>

