<template>
  <MainLayout>
    <div class="home-view">
      <main class="main-content">
        <div class="container">
          <!-- 筛选区域 -->
          <div class="filters-section">
            <Card>
              <div class="filters-content">
                <div class="filter-group">
                  <label class="filter-label">开始日期</label>
                  <input
                    v-model="filters.startDate"
                    type="date"
                    class="date-input"
                    :max="getTodayString()"
                  />
                </div>

                <div class="filter-group">
                  <label class="filter-label">论文分类</label>
                  <Select
                    v-model="filters.category"
                    :options="categoryOptions"
                  />
                </div>

                <div class="filter-group">
                  <label class="filter-label">最大数量</label>
                  <input
                    v-model.number="filters.maxResults"
                    type="number"
                    class="number-input"
                    min="1"
                    max="2000"
                  />
                </div>

                <div class="filter-actions">
                  <button
                    class="search-button"
                    :disabled="loading"
                    @click="fetchPapers"
                  >
                    <span class="search-icon">✓</span>
                  </button>
                  <Button
                    variant="outline"
                    @click="resetFilters"
                  >
                    重置
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <!-- 统计信息 -->
          <div v-if="papers.length > 0" class="stats-section">
            <p class="stats-text">
              找到 <strong>{{ papers.length }}</strong> 篇论文
              <span v-if="filters.startDate">
                （从 {{ filters.startDate }} 起）
              </span>
              <span v-if="filters.category">
                （分类：{{ getCategoryLabel(filters.category) }}）
              </span>
            </p>
          </div>

          <!-- 论文列表 -->
          <PaperList :papers="papers" :loading="loading" />
        </div>
      </main>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getPapers } from '@/api/services/paperService'
import { getTodayString } from '@/utils/format'
import { ARXIV_CATEGORIES, DEFAULT_MAX_RESULTS } from '@/utils/constants'
import type { Paper, PaperQueryParams } from '@/types'
import { usePaperStore } from '@/store/paper'
import MainLayout from '@/components/layout/MainLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Select from '@/components/common/Select.vue'
import PaperList from '@/components/paper/PaperList.vue'

const paperStore = usePaperStore()

// 响应式数据
const papers = ref<Paper[]>([])
const loading = ref(false)
const loadingDetails = ref(false)

// 筛选条件
const filters = ref({
  startDate: getTodayString(),
  category: '',
  maxResults: DEFAULT_MAX_RESULTS
})

// 分类选项
const categoryOptions = ARXIV_CATEGORIES.map(cat => ({
  label: cat.label,
  value: cat.value
}))

// 获取分类标签
const getCategoryLabel = (value: string): string => {
  const category = ARXIV_CATEGORIES.find(cat => cat.value === value)
  return category?.label || value
}

// 获取评分值（用于排序）
const getScoreValue = (paper: Paper): number => {
  // 优先使用score，其次使用detail.total_score
  if (paper.ai_summary?.score !== null && paper.ai_summary?.score !== undefined) {
    return paper.ai_summary.score
  }
  return paper.ai_summary?.detail?.total_score ?? 0
}

// 获取各项评分值（用于排序）
const getScoreValues = (paper: Paper): {
  innovation: number
  technicalDepth: number
  practicalValue: number
  experiments: number
  writing: number
} => {
  const detail = paper.ai_summary?.detail
  return {
    innovation: detail?.innovation_score ?? 0,
    technicalDepth: detail?.technical_depth_score ?? 0,
    practicalValue: detail?.practical_value_score ?? 0,
    experiments: detail?.experiments_score ?? 0,
    writing: detail?.writing_score ?? 0
  }
}

// 对论文进行排序
const sortPapersByScore = (papersList: Paper[]): Paper[] => {
  return [...papersList].sort((a, b) => {
    const scoreA = getScoreValue(a)
    const scoreB = getScoreValue(b)
    
    // 如果两个都没有评分，保持原顺序
    if (scoreA === 0 && scoreB === 0) {
      return 0
    }
    
    // 没有评分的排在最后
    if (scoreA === 0) return 1
    if (scoreB === 0) return -1

    // 首先按总评分降序
    if (scoreB !== scoreA) {
      return scoreB - scoreA
    }

    // 总评分相同时，按各项评分依次排序
    const scoresA = getScoreValues(a)
    const scoresB = getScoreValues(b)

    // 创新性
    if (scoresB.innovation !== scoresA.innovation) {
      return scoresB.innovation - scoresA.innovation
    }
    // 技术深度
    if (scoresB.technicalDepth !== scoresA.technicalDepth) {
      return scoresB.technicalDepth - scoresA.technicalDepth
    }
    // 实用价值
    if (scoresB.practicalValue !== scoresA.practicalValue) {
      return scoresB.practicalValue - scoresA.practicalValue
    }
    // 实验充分性
    if (scoresB.experiments !== scoresA.experiments) {
      return scoresB.experiments - scoresA.experiments
    }
    // 写作质量
    if (scoresB.writing !== scoresA.writing) {
      return scoresB.writing - scoresA.writing
    }

    return 0
  })
}

// 合并论文基础信息和AI评分（从缓存中获取）
const mergePaperWithAIScore = (paper: Paper): Paper => {
  const cachedScore = paperStore.getCachedAIScore(paper.arxiv_id)
  if (cachedScore) {
    // 合并基础信息和AI评分
    return {
      ...paper,
      ai_summary: cachedScore
    }
  }
  return paper
}

// 获取论文列表
const fetchPapers = async () => {
  loading.value = true
  try {
    const params: PaperQueryParams = {
      start_date: filters.value.startDate || undefined,
      max_results: filters.value.maxResults,
      category: filters.value.category || undefined
    }

    const result = await getPapers(params)
    console.log('Fetched papers:', result)
    console.log('Result type:', typeof result, 'Is array:', Array.isArray(result))
    const papersList = Array.isArray(result) ? result : []
    console.log('Papers list length:', papersList.length)
    
    // 先显示论文列表（不等待AI评分）
    papers.value = papersList
    
    // 异步批量获取AI评分（不阻塞页面显示）
    loadingDetails.value = true
    paperStore.batchGetAIScores(papersList.map(p => p.arxiv_id))
      .then(() => {
        // AI评分加载完成后，合并信息并重新排序
        const papersWithScores = papersList.map(mergePaperWithAIScore)
        papers.value = sortPapersByScore(papersWithScores)
      })
      .catch((error) => {
        console.error('Failed to batch fetch AI scores:', error)
        // 即使获取AI评分失败，也继续显示论文列表
      })
      .finally(() => {
        loadingDetails.value = false
      })
  } catch (error) {
    console.error('Failed to fetch papers:', error)
    papers.value = []
  } finally {
    loading.value = false
  }
}

// 重置筛选条件
const resetFilters = () => {
  filters.value = {
    startDate: getTodayString(),
    category: '',
    maxResults: DEFAULT_MAX_RESULTS
  }
  papers.value = []
}

// 监听store中的AI评分缓存变化，自动更新论文列表（合并AI评分）
watch(
  () => paperStore.aiScoreCache,
  () => {
    if (papers.value.length > 0) {
      const papersWithScores = papers.value.map(mergePaperWithAIScore)
      papers.value = sortPapersByScore(papersWithScores)
    }
  },
  { deep: true }
)

// 组件挂载时自动加载
onMounted(() => {
  fetchPapers()
})
</script>

<style scoped>
.home-view {
  min-height: 100%;
}

.main-content {
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.filters-section {
  margin-bottom: 2rem;
}

.filters-section :deep(.card) {
  background: #000000 !important;
  color: #ffffff;
}

.filters-section :deep(.select) {
  border: 2px solid #333333;
  background: #1a1a1a;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5em 1.5em;
  color: #ffffff;
}

.filters-section :deep(.select:hover:not(:disabled)) {
  border-color: #555555;
}

.filters-section :deep(.select:focus) {
  border-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.filters-section :deep(.select option) {
  background: #1a1a1a;
  color: #ffffff;
}

.filters-section :deep(.btn-outline) {
  background: transparent;
  border: 2px solid #ffffff;
  color: #ffffff;
}

.filters-section :deep(.btn-outline:hover:not(:disabled)) {
  background: #1a1a1a;
  border-color: #ffffff;
  color: #ffffff;
}

.filters-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  align-items: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #ffffff;
}

.date-input,
.number-input {
  padding: 0.5rem 1rem;
  border: 2px solid #333333;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
  background: #1a1a1a;
  color: #ffffff;
}

/* 修改日期选择器的日历图标为白色 */
.date-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

.date-input::-webkit-calendar-picker-indicator:hover {
  opacity: 0.8;
}

.date-input:hover,
.number-input:hover {
  border-color: #555555;
}

.date-input:focus,
.number-input:focus {
  outline: none;
  border-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.date-input::placeholder,
.number-input::placeholder {
  color: #666666;
}

/* 美化数字输入框的spinner控件 */
.number-input {
  padding-right: 0.4rem;
}

.number-input::-webkit-inner-spin-button {
  opacity: 0;
  height: 100%;
  min-height: 2.5rem;
  width: 1.5rem;
  cursor: pointer;
  background: #1a1a1a;
  border: none;
  margin-right: 0.0625rem;
  background-image: 
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath stroke='%23ffffff' stroke-width='1.5' stroke-linecap='round' d='M2.5 7.5l2.5-2.5 2.5 2.5'/%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath stroke='%23ffffff' stroke-width='1.5' stroke-linecap='round' d='M2.5 2.5l2.5 2.5 2.5-2.5'/%3E%3C/svg%3E");
  background-size: 0.625rem 0.625rem;
  background-position: center 0.375rem, center calc(100% - 0.375rem);
  background-repeat: no-repeat;
  transition: opacity 0.2s;
}

.number-input:hover::-webkit-inner-spin-button {
  opacity: 1;
}

.number-input::-webkit-inner-spin-button:hover {
  background-color: #2a2a2a;
}

.number-input::-webkit-outer-spin-button {
  opacity: 0;
}

/* Firefox */
.number-input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.number-input::-moz-number-spin-box {
  opacity: 1;
  border: none;
  width: 1.5rem;
  background: #1a1a1a;
}

.number-input::-moz-number-spin-up,
.number-input::-moz-number-spin-down {
  background: #1a1a1a;
  border: none;
  color: #ffffff;
  opacity: 1;
  width: 100%;
  height: 50%;
  font-size: 0.5rem;
}

.number-input::-moz-number-spin-up:hover,
.number-input::-moz-number-spin-down:hover {
  background-color: #2a2a2a;
}

.filter-actions {
  display: flex;
  gap: 0.75rem;
  grid-column: 1 / -1;
  align-items: center;
  justify-content: flex-end;
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: none;
  border-radius: 0.5rem;
  background: #000000;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.25rem;
}

.search-button:hover:not(:disabled) {
  background: #1a1a1a;
}

.search-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-icon {
  display: inline-block;
}

.stats-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #000000;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-text {
  margin: 0;
  color: #ffffff;
  font-size: 0.9375rem;
}

.stats-text strong {
  color: #ffffff;
  font-weight: 600;
}

@media (min-width: 768px) {
  .filter-actions {
    grid-column: auto;
  }
}
</style>
