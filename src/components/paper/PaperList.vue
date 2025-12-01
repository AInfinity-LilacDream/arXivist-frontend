<template>
  <div class="paper-list">
    <div v-if="loading" class="paper-list-loading">
      <div class="spinner"></div>
      <p>加载论文中...</p>
    </div>

    <div v-else-if="papers.length === 0" class="paper-list-empty">
      <p>暂无论文数据</p>
    </div>

    <div v-else class="paper-list-content">
      <PaperCard
        v-for="(paper, index) in papers"
        :key="paper.arxiv_id"
        :paper="paper"
        :rank="index + 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import PaperCard from './PaperCard.vue'
import type { Paper } from '@/types'

interface Props {
  papers: Paper[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false
})
</script>

<style scoped>
.paper-list {
  min-height: 400px;
}

.paper-list-loading,
.paper-list-empty {
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

.paper-list-content {
  display: flex;
  flex-direction: column;
}
</style>
