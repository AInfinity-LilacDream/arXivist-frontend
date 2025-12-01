<template>
  <Card class="paper-card" :class="{ 'rank-gold': rank === 1, 'rank-silver': rank === 2, 'rank-bronze': rank === 3 }">
    <template #header>
      <div class="paper-header">
        <div class="paper-header-top">
          <h3 class="paper-title" v-html="renderLatex(paper.title)"></h3>
          <!-- 排名徽章 -->
          <div v-if="rank && rank <= 3" class="rank-badge" :class="{
            'rank-badge-gold': rank === 1,
            'rank-badge-silver': rank === 2,
            'rank-badge-bronze': rank === 3
          }">
            <span v-if="rank === 1">🥇</span>
            <span v-else-if="rank === 2">🥈</span>
            <span v-else-if="rank === 3">🥉</span>
          </div>
        </div>
        <div class="paper-meta">
          <span class="paper-date">{{ formatDate(paper.published) }}</span>
          <span v-if="paper.categories.length > 0" class="paper-category">
            {{ paper.categories[0] }}
          </span>
          <!-- 评分显示 -->
          <span v-if="getDisplayScore(paper) !== null" class="paper-score">
            ⭐ {{ getDisplayScore(paper) }}/100
          </span>
          <!-- 评分骨架图 -->
          <span v-else-if="isLoadingScore" class="paper-score-skeleton">
            <Skeleton width="60px" height="24px" />
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
        <Button variant="ghost" size="sm" class="paper-footer-btn" @click="showAddToCollection">
          ⭐ 收藏
        </Button>
        <Button variant="outline" size="sm" class="paper-footer-btn" @click="viewDetail">
          查看详情
        </Button>
        <Button variant="primary" size="sm" class="paper-footer-btn" @click="openLink(paper.pdf_url)">
          下载PDF
        </Button>
      </div>
    </template>

    <!-- 添加到收藏夹对话框 -->
    <AddToCollectionDialog
      :visible="showCollectionDialog"
      :arxiv-id="paper.arxiv_id"
      @close="showCollectionDialog = false"
      @success="handleAddSuccess"
    />
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate, truncateText } from '@/utils/format'
import { renderLatex } from '@/utils/latex'
import { usePaperStore } from '@/store/paper'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Skeleton from '@/components/common/Skeleton.vue'
import AddToCollectionDialog from '@/components/collection/AddToCollectionDialog.vue'
import type { Paper } from '@/types'

interface Props {
  paper: Paper
  rank?: number // 排名（1, 2, 3...）
}

const props = withDefaults(defineProps<Props>(), {
  rank: undefined
})
const router = useRouter()
const paperStore = usePaperStore()
const showCollectionDialog = ref(false)

// 检查评分是否正在加载
const isLoadingScore = computed(() => {
  return paperStore.loadingAIScores.has(props.paper.arxiv_id)
})

// 获取显示的评分（优先使用score，其次使用detail.total_score）
const getDisplayScore = (paper: Paper): number | null => {
  if (paper.ai_summary?.score !== null && paper.ai_summary?.score !== undefined) {
    return paper.ai_summary.score
  }
  if (paper.ai_summary?.detail?.total_score !== null && paper.ai_summary?.detail?.total_score !== undefined) {
    return paper.ai_summary.detail.total_score
  }
  return null
}

const openLink = (url: string) => {
  window.open(url, '_blank')
}

const viewDetail = () => {
  router.push({ name: 'paper-detail', params: { arxiv_id: props.paper.arxiv_id } })
}

const showAddToCollection = () => {
  showCollectionDialog.value = true
}

const handleAddSuccess = () => {
  // 可以在这里显示成功提示
  console.log('Paper added to collection successfully')
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

.paper-header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.paper-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  line-height: 1.5;
  flex: 1;
}

.rank-badge {
  flex-shrink: 0;
  font-size: 1.5rem;
  line-height: 1;
}

.paper-card.rank-gold {
  border: 2px solid #ffffff;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

.paper-card.rank-silver {
  border: 2px solid #ffffff;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

.paper-card.rank-bronze {
  border: 2px solid #ffffff;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
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

.paper-score {
  padding: 0.25rem 0.75rem;
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 0.8125rem;
}

.paper-score-skeleton {
  display: inline-block;
  border-radius: 0.25rem;
  overflow: hidden;
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

.paper-footer-btn {
  color: #ffffff;
}

.paper-footer-btn :hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.paper-footer-btn.btn-outline {
  background: transparent !important;
  border: 2px solid #ffffff !important;
  color: #ffffff !important;
}

.paper-footer-btn.btn-outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: #ffffff !important;
  color: #ffffff !important;
}

.paper-footer-btn.btn-primary {
  background: #ffffff !important;
  color: #000000 !important;
  border: 2px solid #ffffff !important;
}

.paper-footer-btn.btn-primary:hover:not(:disabled) {
  background: #f0f0f0 !important;
  color: #000000 !important;
  border-color: #ffffff !important;
}
</style>
