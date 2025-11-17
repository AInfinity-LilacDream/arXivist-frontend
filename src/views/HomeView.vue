<template>
  <div class="home-view">
    <Header />

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
                  placeholder="选择分类"
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
                <Button
                  variant="primary"
                  :loading="loading"
                  @click="fetchPapers"
                >
                  查询论文
                </Button>
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPapers } from '@/api/services/paperService'
import { getTodayString } from '@/utils/format'
import { ARXIV_CATEGORIES, DEFAULT_MAX_RESULTS } from '@/utils/constants'
import type { Paper, PaperQueryParams } from '@/types'
import Header from '@/components/layout/Header.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Select from '@/components/common/Select.vue'
import PaperList from '@/components/paper/PaperList.vue'

// 响应式数据
const papers = ref<Paper[]>([])
const loading = ref(false)

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
    papers.value = Array.isArray(result) ? result : []
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

// 组件挂载时自动加载
onMounted(() => {
  fetchPapers()
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: #f9fafb;
}

.main-content {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.filters-section {
  margin-bottom: 2rem;
}

.filters-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.date-input,
.number-input {
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.date-input:hover,
.number-input:hover {
  border-color: #667eea;
}

.date-input:focus,
.number-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-actions {
  display: flex;
  gap: 0.75rem;
  grid-column: 1 / -1;
}

.stats-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-text {
  margin: 0;
  color: #4b5563;
  font-size: 0.9375rem;
}

.stats-text strong {
  color: #667eea;
  font-weight: 600;
}

@media (min-width: 768px) {
  .filter-actions {
    grid-column: auto;
  }
}
</style>
