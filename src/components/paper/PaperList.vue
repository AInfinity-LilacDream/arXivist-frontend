<template>
  <div class="paper-list">
    <div v-if="loading" class="paper-list-loading">
      <div class="spinner"></div>
      <p>加载论文中...</p>
    </div>

    <div v-else-if="papers.length === 0" class="paper-list-empty">
      <p>暂无论文数据</p>
    </div>

    <TransitionGroup
      v-else
      name="paper-list"
      tag="div"
      class="paper-list-content"
      :css="true"
    >
      <PaperCard
        v-for="(paper, index) in papers"
        :key="paper.arxiv_id"
        :paper="paper"
        :rank="(paper as any)._displayRank ?? index + 1"
      />
    </TransitionGroup>
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

.paper-list-content {
  column-count: 2;
  column-gap: 1.5rem;
  position: relative;
}

/* 重新排序动画 - 移动动画 */
.paper-list-move {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 进入和离开动画 */
.paper-list-enter-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.paper-list-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: calc(50% - 0.75rem);
  z-index: 0;
  break-inside: avoid;
}

.paper-list-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}

.paper-list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

/* 确保卡片在动画过程中有正确的定位和层级 */
.paper-list-content > * {
  position: relative;
  z-index: 1;
  break-inside: avoid;
  margin-bottom: 1.5rem;
  display: inline-block;
  width: 100%;
}

/* 响应式设计：小屏幕单列 */
@media (max-width: 768px) {
  .paper-list-content {
    column-count: 1;
  }
  
  .paper-list-leave-active {
    width: 100%;
  }
}
</style>
