<template>
  <MainLayout>
    <div class="paper-detail-view">
      <div class="container">
        <!-- 返回按钮 -->
        <div class="back-section">
          <Button variant="ghost" size="sm" @click="goBack">
            ← 返回
          </Button>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-section">
          <Loading visible />
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-section">
          <Card>
            <p class="error-message">{{ error }}</p>
            <Button variant="primary" @click="fetchPaperDetail">重试</Button>
          </Card>
        </div>

        <!-- 论文详情 -->
        <div v-else-if="paper" class="paper-detail">
          <!-- 基本信息 -->
          <Card class="paper-info-card">
            <div class="paper-header">
              <h1 class="paper-title">{{ paper.title }}</h1>
              <div class="paper-meta">
                <span class="paper-date">{{ formatDate(paper.published) }}</span>
                <span v-if="paper.updated" class="paper-updated">
                  更新于 {{ formatDate(paper.updated) }}
                </span>
              </div>
            </div>

            <div class="paper-authors-section">
              <h3 class="section-title">作者</h3>
              <p class="authors-list">{{ paper.authors.join(', ') }}</p>
            </div>

            <div v-if="paper.categories.length > 0" class="paper-categories-section">
              <h3 class="section-title">分类</h3>
              <div class="categories-list">
                <span v-for="category in paper.categories" :key="category" class="category-tag">
                  {{ category }}
                </span>
              </div>
            </div>

            <div class="paper-actions">
              <Button variant="primary" @click="openLink(paper.pdf_url)">
                下载PDF
              </Button>
              <Button variant="outline" @click="openLink(`https://arxiv.org/abs/${paper.arxiv_id}`)">
                在arXiv查看
              </Button>
              <Button variant="ghost" @click="showAddToCollection">
                ⭐ 添加到收藏夹
              </Button>
            </div>
          </Card>

          <!-- 摘要 -->
          <Card class="paper-abstract-card">
            <h2 class="card-title">摘要</h2>
            <p class="paper-abstract">{{ paper.summary }}</p>
          </Card>

          <!-- AI 摘要 -->
          <Card v-if="paper.ai_summary || isLoadingAISummary" class="ai-summary-card">
            <div class="ai-summary-header">
              <h2 class="card-title">AI 智能分析</h2>
              <!-- 评分骨架图 -->
              <div v-if="isLoadingAISummary" class="ai-score-skeleton">
                <Skeleton width="120px" height="40px" />
              </div>
              <div v-else-if="paper.ai_summary?.score !== null && paper.ai_summary?.score !== undefined" class="ai-score">
                <span class="score-label">综合评分</span>
                <span class="score-value">{{ paper.ai_summary.score }}</span>
                <span class="score-unit">/ 100</span>
              </div>
            </div>

            <!-- 评分详情骨架图 -->
            <div v-if="isLoadingAISummary && !paper.ai_summary" class="ai-detail-skeleton">
              <div class="skeleton-section">
                <Skeleton width="100px" height="20px" style="margin-bottom: 1rem;" />
                <div class="skeleton-score-items">
                  <div v-for="i in 5" :key="i" class="skeleton-score-item">
                    <Skeleton width="80px" height="16px" />
                    <Skeleton width="100%" height="8px" style="flex: 1;" />
                    <Skeleton width="50px" height="16px" />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 评分详情 -->
            <div v-else-if="paper.ai_summary?.detail" class="ai-detail">
              <!-- 各项评分 -->
              <div v-if="paper.ai_summary.detail.total_score !== null && paper.ai_summary.detail.total_score !== undefined" class="score-breakdown">
                <h3 class="section-title">评分详情</h3>
                <div class="score-grid">
                  <div v-if="paper.ai_summary.detail?.innovation_score !== null && paper.ai_summary.detail?.innovation_score !== undefined" class="score-item">
                    <span class="score-name">创新性</span>
                    <span class="score-bar">
                      <span 
                        class="score-fill" 
                        :style="{ width: `${((paper.ai_summary.detail.innovation_score ?? 0) / 30) * 100}%` }"
                      ></span>
                    </span>
                    <span class="score-number">{{ paper.ai_summary.detail.innovation_score }}/30</span>
                  </div>
                  <div v-if="paper.ai_summary.detail?.technical_depth_score !== null && paper.ai_summary.detail?.technical_depth_score !== undefined" class="score-item">
                    <span class="score-name">技术深度</span>
                    <span class="score-bar">
                      <span 
                        class="score-fill" 
                        :style="{ width: `${((paper.ai_summary.detail.technical_depth_score ?? 0) / 25) * 100}%` }"
                      ></span>
                    </span>
                    <span class="score-number">{{ paper.ai_summary.detail.technical_depth_score }}/25</span>
                  </div>
                  <div v-if="paper.ai_summary.detail?.practical_value_score !== null && paper.ai_summary.detail?.practical_value_score !== undefined" class="score-item">
                    <span class="score-name">实用价值</span>
                    <span class="score-bar">
                      <span 
                        class="score-fill" 
                        :style="{ width: `${((paper.ai_summary.detail.practical_value_score ?? 0) / 20) * 100}%` }"
                      ></span>
                    </span>
                    <span class="score-number">{{ paper.ai_summary.detail.practical_value_score }}/20</span>
                  </div>
                  <div v-if="paper.ai_summary.detail?.experiments_score !== null && paper.ai_summary.detail?.experiments_score !== undefined" class="score-item">
                    <span class="score-name">实验充分性</span>
                    <span class="score-bar">
                      <span 
                        class="score-fill" 
                        :style="{ width: `${((paper.ai_summary.detail.experiments_score ?? 0) / 15) * 100}%` }"
                      ></span>
                    </span>
                    <span class="score-number">{{ paper.ai_summary.detail.experiments_score }}/15</span>
                  </div>
                  <div v-if="paper.ai_summary.detail?.writing_score !== null && paper.ai_summary.detail?.writing_score !== undefined" class="score-item">
                    <span class="score-name">写作质量</span>
                    <span class="score-bar">
                      <span 
                        class="score-fill" 
                        :style="{ width: `${((paper.ai_summary.detail.writing_score ?? 0) / 10) * 100}%` }"
                      ></span>
                    </span>
                    <span class="score-number">{{ paper.ai_summary.detail.writing_score }}/10</span>
                  </div>
                </div>
              </div>

              <!-- 论文总结 -->
              <div v-if="paper.ai_summary.detail.summary" class="summary-section">
                <h3 class="section-title">论文总结</h3>
                <p class="summary-text">{{ paper.ai_summary.detail.summary }}</p>
              </div>

              <!-- 优点 -->
              <div v-if="paper.ai_summary.detail.strengths && paper.ai_summary.detail.strengths.length > 0" class="strengths-section">
                <h3 class="section-title">优点</h3>
                <ul class="strengths-list">
                  <li v-for="(strength, index) in paper.ai_summary.detail.strengths" :key="index">
                    {{ strength }}
                  </li>
                </ul>
              </div>

              <!-- 缺点 -->
              <div v-if="paper.ai_summary.detail.weaknesses && paper.ai_summary.detail.weaknesses.length > 0" class="weaknesses-section">
                <h3 class="section-title">不足</h3>
                <ul class="weaknesses-list">
                  <li v-for="(weakness, index) in paper.ai_summary.detail.weaknesses" :key="index">
                    {{ weakness }}
                  </li>
                </ul>
              </div>

              <!-- 推荐建议 -->
              <div v-if="paper.ai_summary.detail.recommendation" class="recommendation-section">
                <h3 class="section-title">推荐建议</h3>
                <div class="recommendation-badge" :class="{
                  'recommended': paper.ai_summary.detail.recommendation === '推荐',
                  'highly-recommended': paper.ai_summary.detail.recommendation === '强烈推荐'
                }">
                  {{ paper.ai_summary.detail.recommendation }}
                </div>
              </div>

              <!-- 推理过程 -->
              <div v-if="paper.ai_summary.detail.reasoning" class="reasoning-section">
                <h3 class="section-title">评分推理</h3>
                <p class="reasoning-text">{{ paper.ai_summary.detail.reasoning }}</p>
              </div>
            </div>

            <!-- Token 使用情况 -->
            <div v-if="paper.ai_summary?.token_usage" class="token-usage-section">
              <details class="token-usage-details">
                <summary class="token-usage-summary">Token 使用情况</summary>
                <div class="token-usage-content">
                  <div v-if="paper.ai_summary.token_usage?.prompt_tokens" class="token-item">
                    <span>Prompt Tokens:</span>
                    <span>{{ paper.ai_summary.token_usage.prompt_tokens }}</span>
                  </div>
                  <div v-if="paper.ai_summary.token_usage?.completion_tokens" class="token-item">
                    <span>Completion Tokens:</span>
                    <span>{{ paper.ai_summary.token_usage.completion_tokens }}</span>
                  </div>
                  <div v-if="paper.ai_summary.token_usage?.total_tokens" class="token-item">
                    <span>Total Tokens:</span>
                    <span>{{ paper.ai_summary.token_usage.total_tokens }}</span>
                  </div>
                </div>
              </details>
            </div>
          </Card>
        </div>

        <!-- 添加到收藏夹对话框 -->
        <AddToCollectionDialog
          :visible="showCollectionDialog"
          :arxiv-id="paper?.arxiv_id || ''"
          @close="showCollectionDialog = false"
          @success="handleAddSuccess"
        />
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDate } from '@/utils/format'
import type { PaperDetail } from '@/types'
import { usePaperStore } from '@/store/paper'
import MainLayout from '@/components/layout/MainLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Loading from '@/components/common/Loading.vue'
import Skeleton from '@/components/common/Skeleton.vue'
import AddToCollectionDialog from '@/components/collection/AddToCollectionDialog.vue'

const route = useRoute()
const router = useRouter()
const paperStore = usePaperStore()

const paper = ref<PaperDetail | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const showCollectionDialog = ref(false)

// 检查AI摘要是否正在加载
const isLoadingAISummary = computed(() => {
  if (!paper.value) return false
  return paperStore.loadingAIScores.has(paper.value.arxiv_id)
})

// 获取论文详情
const fetchPaperDetail = async () => {
  const arxivId = route.params.arxiv_id as string
  if (!arxivId) {
    error.value = '缺少论文ID'
    return
  }

  // 先检查缓存
  const cached = paperStore.getCachedPaperDetail(arxivId)
  if (cached) {
    paper.value = cached
    // 检查是否有AI评分缓存
    const cachedScore = paperStore.getCachedAIScore(arxivId)
    if (cachedScore) {
      paper.value.ai_summary = cachedScore
    } else {
      // 如果没有AI评分缓存，启动异步任务
      paperStore.startAIScoreTaskAsync(arxivId)
    }
    return
  }

  // 缓存中没有，从API获取
  loading.value = true
  error.value = null
  try {
    paper.value = await paperStore.getPaperDetailCached(arxivId)
    // 启动异步AI评分任务
    paperStore.startAIScoreTaskAsync(arxivId)
  } catch (err: any) {
    error.value = err.message || '获取论文详情失败'
    console.error('Failed to fetch paper detail:', err)
  } finally {
    loading.value = false
  }
}

// 监听store中的缓存变化，自动更新paper
watch(
  () => [paperStore.paperDetailsCache, paperStore.aiScoreCache],
  () => {
    const arxivId = route.params.arxiv_id as string
    if (arxivId && paper.value) {
      const updated = paperStore.getCachedPaperDetail(arxivId)
      const updatedScore = paperStore.getCachedAIScore(arxivId)
      if (updated) {
        paper.value = { ...updated, ai_summary: updatedScore || updated.ai_summary }
      } else if (updatedScore && paper.value) {
        paper.value.ai_summary = updatedScore
      }
    }
  },
  { deep: true }
)

// 返回上一页
const goBack = () => {
  router.back()
}

// 打开链接
const openLink = (url: string) => {
  window.open(url, '_blank')
}

// 显示添加到收藏夹对话框
const showAddToCollection = () => {
  showCollectionDialog.value = true
}

// 添加到收藏夹成功
const handleAddSuccess = () => {
  showCollectionDialog.value = false
  // 可以显示成功提示
  console.log('Paper added to collection successfully')
}

// 组件挂载时获取论文详情
onMounted(() => {
  fetchPaperDetail()
})

// 监听路由参数变化，当 arxiv_id 改变时重新获取数据
watch(
  () => route.params.arxiv_id,
  () => {
    fetchPaperDetail()
  }
)
</script>

<style scoped>
.paper-detail-view {
  min-height: 100%;
  padding: 2rem 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
}

.back-section {
  margin-bottom: 1.5rem;
}

.loading-section,
.error-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-message {
  color: #ef4444;
  margin-bottom: 1rem;
}

.paper-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.paper-info-card {
  padding: 2rem;
}

.paper-header {
  margin-bottom: 2rem;
}

.paper-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem;
  line-height: 1.3;
}

.paper-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.paper-authors-section,
.paper-categories-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem;
}

.authors-list {
  color: #4b5563;
  line-height: 1.6;
}

.categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-tag {
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.paper-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.paper-abstract-card {
  padding: 2rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem;
}

.paper-abstract {
  color: #4b5563;
  line-height: 1.8;
  font-size: 1rem;
  white-space: pre-wrap;
}

.ai-summary-card {
  padding: 2rem;
}

.ai-summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.ai-score {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 0.5rem;
  font-weight: 600;
}

.score-label {
  font-size: 0.875rem;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.score-unit {
  font-size: 0.875rem;
  opacity: 0.9;
}

.ai-detail {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.score-breakdown {
  margin-bottom: 1rem;
}

.score-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.score-item {
  display: grid;
  grid-template-columns: 120px 1fr 80px;
  gap: 1rem;
  align-items: center;
}

.score-name {
  font-size: 0.9375rem;
  color: #4b5563;
  font-weight: 500;
}

.score-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.score-fill {
  display: block;
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.score-number {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: right;
  font-weight: 500;
}

.summary-section,
.reasoning-section {
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.summary-text,
.reasoning-text {
  color: #4b5563;
  line-height: 1.8;
  margin: 0;
}

.strengths-section,
.weaknesses-section {
  padding: 1.5rem;
  border-radius: 0.5rem;
}

.strengths-section {
  background: #f0fdf4;
  border-left: 4px solid #22c55e;
}

.weaknesses-section {
  background: #fef2f2;
  border-left: 4px solid #ef4444;
}

.strengths-list,
.weaknesses-list {
  margin: 0;
  padding-left: 1.5rem;
  color: #4b5563;
  line-height: 1.8;
}

.strengths-list li {
  margin-bottom: 0.5rem;
}

.weaknesses-list li {
  margin-bottom: 0.5rem;
}

.recommendation-section {
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.recommendation-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.9375rem;
}

.recommendation-badge.recommended {
  background: #dbeafe;
  color: #1e40af;
}

.recommendation-badge.highly-recommended {
  background: #dcfce7;
  color: #166534;
}

.token-usage-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.token-usage-details {
  cursor: pointer;
}

.token-usage-summary {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  list-style: none;
}

.token-usage-summary::-webkit-details-marker {
  display: none;
}

.token-usage-summary::before {
  content: '▶ ';
  display: inline-block;
  transition: transform 0.2s;
}

.token-usage-details[open] .token-usage-summary::before {
  transform: rotate(90deg);
}

.token-usage-content {
  margin-top: 0.75rem;
  padding-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.token-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #4b5563;
}

.ai-score-skeleton {
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
}

.ai-detail-skeleton {
  padding: 1rem 0;
}

.skeleton-section {
  margin-bottom: 2rem;
}

.skeleton-score-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-score-item {
  display: grid;
  grid-template-columns: 120px 1fr 80px;
  gap: 1rem;
  align-items: center;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .paper-title {
    font-size: 1.5rem;
  }

  .paper-info-card,
  .paper-abstract-card,
  .ai-summary-card {
    padding: 1.5rem;
  }

  .ai-summary-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .score-item {
    grid-template-columns: 100px 1fr 60px;
    gap: 0.75rem;
  }

  .paper-actions {
    flex-direction: column;
  }

  .paper-actions > * {
    width: 100%;
  }
}
</style>

