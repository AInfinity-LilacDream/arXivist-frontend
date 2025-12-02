<template>
  <MainLayout>
    <template #filter-bar>
      <FilterBar
        :filters="filters"
        :loading="loading"
        @update:filters="handleFiltersUpdate"
        @search="fetchPapers"
        @reset="resetFilters"
      />
    </template>
    <div class="home-view">
      <main class="main-content">
        <div class="container">

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
import { getTodayString, getWeekAgoString } from '@/utils/format'
import { ARXIV_CATEGORIES, DEFAULT_MAX_RESULTS } from '@/utils/constants'
import type { Paper, PaperQueryParams } from '@/types'
import { usePaperStore } from '@/store/paper'
import { usePreferencesStore } from '@/store/preferences'
import MainLayout from '@/components/layout/MainLayout.vue'
import FilterBar from '@/components/layout/FilterBar.vue'
import PaperList from '@/components/paper/PaperList.vue'

const paperStore = usePaperStore()
const preferencesStore = usePreferencesStore()

// 响应式数据
const papers = ref<Paper[]>([])
const loading = ref(false)
const loadingDetails = ref(false)

// 筛选条件
const filters = ref({
  startDate: getWeekAgoString(),
  category: '',
  maxResults: DEFAULT_MAX_RESULTS,
  scoreDimension: 'total' // 默认综合排序
})

// 保存上一次的筛选条件（用于判断是否需要重新拉取数据）
const previousFilters = ref({
  startDate: getWeekAgoString(),
  category: '',
  maxResults: DEFAULT_MAX_RESULTS
})

// 处理筛选条件更新
const handleFiltersUpdate = (newFilters: { startDate: string; category: string; maxResults: number; scoreDimension: string }) => {
  const oldScoreDimension = filters.value.scoreDimension
  filters.value = newFilters
  
  // 如果只是评分维度变化，且其他条件没变，只重排论文（不重新拉取）
  const otherFiltersChanged = 
    previousFilters.value.startDate !== newFilters.startDate ||
    previousFilters.value.category !== newFilters.category ||
    previousFilters.value.maxResults !== newFilters.maxResults
  
  if (!otherFiltersChanged && oldScoreDimension !== newFilters.scoreDimension && papers.value.length > 0) {
    // 只重排论文，不重新拉取
    reorderPapers()
  } else if (otherFiltersChanged) {
    // 其他条件变化，更新 previousFilters，等待 fetchPapers 调用
    previousFilters.value = {
      startDate: newFilters.startDate,
      category: newFilters.category,
      maxResults: newFilters.maxResults
    }
  }
}

// 获取分类标签
const getCategoryLabel = (value: string): string => {
  const category = ARXIV_CATEGORIES.find(cat => cat.value === value)
  return category?.label || value
}

// 获取评分值（用于排序）
const getScoreValue = (paper: Paper, dimension: string = 'total'): number => {
  const detail = paper.ai_summary?.detail
  
  switch (dimension) {
    case 'innovation':
      return detail?.innovation_score ?? 0
    case 'technical_depth':
      return detail?.technical_depth_score ?? 0
    case 'practical_value':
      return detail?.practical_value_score ?? 0
    case 'experiments':
      return detail?.experiments_score ?? 0
    case 'writing':
      return detail?.writing_score ?? 0
    case 'total':
    default:
      // 优先使用score，其次使用detail.total_score
      if (paper.ai_summary?.score !== null && paper.ai_summary?.score !== undefined) {
        return paper.ai_summary.score
      }
      return detail?.total_score ?? 0
  }
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
const sortPapersByScore = (papersList: Paper[], dimension: string = 'total'): Paper[] => {
  return [...papersList].sort((a, b) => {
    const scoreA = getScoreValue(a, dimension)
    const scoreB = getScoreValue(b, dimension)
    
    // 如果两个都没有评分，保持原顺序
    if (scoreA === 0 && scoreB === 0) {
      return 0
    }
    
    // 没有评分的排在最后
    if (scoreA === 0) return 1
    if (scoreB === 0) return -1

    // 按选中的维度评分降序
    if (scoreB !== scoreA) {
      return scoreB - scoreA
    }

    // 如果选中的维度评分相同，按综合评分作为次要排序
    if (dimension !== 'total') {
      const totalA = getScoreValue(a, 'total')
      const totalB = getScoreValue(b, 'total')
      if (totalB !== totalA) {
        return totalB - totalA
      }
    }

    // 如果综合评分也相同，按各项评分依次排序
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

// 重排论文（不重新拉取数据）
function reorderPapers() {
  if (papers.value.length === 0) return
  
  const papersWithScores = papers.value.map(mergePaperWithAIScore)
  const sorted = sortPapersByScore(papersWithScores, filters.value.scoreDimension)
  papers.value = arrangeByColumns(sorted, 2)
}

// 按照行优先的方式重新排列论文（用于双列布局）
// 排序后：第一行第一个最高，第一行第二个次高，第二行第一个第三高...
// 注意：CSS columns 是从上到下（列优先）填充的，所以数组需要按列优先排列，这样显示才是行优先
const arrangeByColumns = (sortedPapers: Paper[], numColumns: number = 2): Paper[] => {
  if (sortedPapers.length === 0) return []
  
  const result: Paper[] = []
  const numRows = Math.ceil(sortedPapers.length / numColumns)
  
  // CSS columns 是列优先填充的（第一列从上到下，然后第二列从上到下）
  // 要让显示结果是行优先（第一行从左到右，然后第二行从左到右）
  // 数组需要按列优先排列：外层循环列，内层循环行
  // 索引计算：第一列第一个是 rank1，第二列第一个是 rank2，第一列第二个是 rank3...
  // 所以 originalIndex = row * numColumns + col
  // 但这样会导致：第一列是 rank1, rank3, rank5...，第二列是 rank2, rank4, rank6...
  // 显示为：第一行 rank1, rank2，第二行 rank3, rank4，第三行 rank5, rank6
  // 这正是我们想要的行优先！
  for (let col = 0; col < numColumns; col++) {
    for (let row = 0; row < numRows; row++) {
      // 计算原始排序数组中的索引（行优先索引）
      const originalIndex = row * numColumns + col
      if (originalIndex < sortedPapers.length) {
        const paper = { ...sortedPapers[originalIndex] }
        // 保存原始排名（行优先排名）
        ;(paper as any)._displayRank = originalIndex + 1
        result.push(paper)
      }
    }
  }
  
  return result
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
    
    // 更新 previousFilters
    previousFilters.value = {
      startDate: filters.value.startDate,
      category: filters.value.category,
      maxResults: filters.value.maxResults
    }
    
    // 先显示论文列表（不等待AI评分和翻译）
    papers.value = papersList
    
    // 异步批量获取AI评分和翻译（不阻塞页面显示）
    loadingDetails.value = true
    
    // 批量获取AI评分
    paperStore.batchGetAIScores(papersList.map(p => p.arxiv_id))
      .then(() => {
        // AI评分加载完成后，合并信息并重新排序
        const papersWithScores = papersList.map(mergePaperWithAIScore)
        const sorted = sortPapersByScore(papersWithScores, filters.value.scoreDimension)
        papers.value = arrangeByColumns(sorted, 2)
      })
      .catch((error) => {
        console.error('Failed to batch fetch AI scores:', error)
        // 即使获取AI评分失败，也继续显示论文列表
      })
    
    // 批量启动翻译任务
    const targetLanguage = preferencesStore.preferredLanguage
    paperStore.batchGetTranslations(
      papersList.map(p => ({ arxiv_id: p.arxiv_id, summary: p.summary })),
      targetLanguage
    ).catch((error) => {
      console.error('Failed to batch start translations:', error)
    })
    
    loadingDetails.value = false
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
    startDate: getWeekAgoString(),
    category: '',
    maxResults: DEFAULT_MAX_RESULTS,
    scoreDimension: 'total'
  }
  previousFilters.value = {
    startDate: getWeekAgoString(),
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
      const sorted = sortPapersByScore(papersWithScores, filters.value.scoreDimension)
      papers.value = arrangeByColumns(sorted, 2)
    }
  },
  { deep: true }
)

// 监听偏好语言变化，重新启动翻译任务
watch(
  () => preferencesStore.preferredLanguage,
  (newLanguage) => {
    if (papers.value.length > 0) {
      // 重新启动翻译任务
      paperStore.batchGetTranslations(
        papers.value.map(p => ({ arxiv_id: p.arxiv_id, summary: p.summary })),
        newLanguage
      ).catch((error) => {
        console.error('Failed to batch start translations:', error)
      })
    }
  }
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
