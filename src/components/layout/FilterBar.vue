<template>
  <div class="filter-bar">
    <div class="filter-bar-container">
      <!-- 开始日期 -->
      <div class="filter-item" ref="dateItemRef">
        <button 
          class="filter-button" 
          :class="{ 'filter-button-active': showDateMenu }"
          @click="toggleDateMenu"
        >
          <span class="filter-label">开始日期</span>
        </button>
        <div v-if="showDateMenu" class="filter-dropdown date-dropdown">
          <DatePicker
            :model-value="filters.startDate"
            :max-date="getTodayString()"
            @update:model-value="handleDateUpdate"
          />
        </div>
      </div>

      <!-- 论文分类 -->
      <div class="filter-item" ref="categoryItemRef">
        <button 
          class="filter-button" 
          :class="{ 'filter-button-active': showCategoryMenu }"
          @click="toggleCategoryMenu"
        >
          <span class="filter-label">论文分类</span>
        </button>
        <div v-if="showCategoryMenu" class="filter-dropdown category-dropdown">
          <div
            v-for="option in categoryOptions"
            :key="option.value"
            class="dropdown-option"
            :class="{ 'dropdown-option-selected': filters.category === option.value }"
            @click="selectCategory(option.value)"
          >
            <span>{{ option.label }}</span>
          </div>
        </div>
      </div>

      <!-- 最大数量 -->
      <div class="filter-item" ref="maxResultsItemRef">
        <button 
          class="filter-button" 
          :class="{ 'filter-button-active': showMaxResultsMenu }"
          @click="toggleMaxResultsMenu"
        >
          <span class="filter-label">最大数量</span>
        </button>
        <div v-if="showMaxResultsMenu" class="filter-dropdown max-results-dropdown">
          <input
            v-model.number="filters.maxResults"
            type="number"
            class="number-input"
            min="1"
            max="2000"
            @change="handleMaxResultsChange"
          />
        </div>
      </div>

      <!-- 评分维度 -->
      <div class="filter-item" ref="scoreDimensionItemRef">
        <button 
          class="filter-button" 
          :class="{ 'filter-button-active': showScoreDimensionMenu }"
          @click="toggleScoreDimensionMenu"
        >
          <span class="filter-label">评分维度</span>
        </button>
        <div v-if="showScoreDimensionMenu" class="filter-dropdown score-dimension-dropdown">
          <div
            v-for="option in scoreDimensionOptions"
            :key="option.value"
            class="dropdown-option"
            :class="{ 'dropdown-option-selected': filters.scoreDimension === option.value }"
            @click="selectScoreDimension(option.value)"
          >
            <span>{{ option.label }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="filter-actions">
        <button
          class="search-button"
          :disabled="loading"
          @click="handleSearch"
        >
          <span class="search-icon">✓</span>
        </button>
        <button class="reset-button" @click="handleReset">
          重置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getTodayString, getWeekAgoString } from '@/utils/format'
import { ARXIV_CATEGORIES, DEFAULT_MAX_RESULTS } from '@/utils/constants'
import DatePicker from '@/components/common/DatePicker.vue'

interface Props {
  filters: {
    startDate: string
    category: string
    maxResults: number
    scoreDimension: string
  }
  loading?: boolean
}

interface Emits {
  (e: 'update:filters', filters: { startDate: string; category: string; maxResults: number; scoreDimension: string }): void
  (e: 'search'): void
  (e: 'reset'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const showDateMenu = ref(false)
const showCategoryMenu = ref(false)
const showMaxResultsMenu = ref(false)
const showScoreDimensionMenu = ref(false)

const dateItemRef = ref<HTMLElement | null>(null)
const categoryItemRef = ref<HTMLElement | null>(null)
const maxResultsItemRef = ref<HTMLElement | null>(null)
const scoreDimensionItemRef = ref<HTMLElement | null>(null)

// 分类选项
const categoryOptions = ARXIV_CATEGORIES.map(cat => ({
  label: cat.label,
  value: cat.value
}))

// 评分维度选项
const scoreDimensionOptions = [
  { label: '综合排序', value: 'total' },
  { label: '创新性', value: 'innovation' },
  { label: '技术深度', value: 'technical_depth' },
  { label: '实用价值', value: 'practical_value' },
  { label: '实验充分性', value: 'experiments' },
  { label: '写作质量', value: 'writing' }
]


// 切换日期菜单
const toggleDateMenu = () => {
  showDateMenu.value = !showDateMenu.value
  if (showDateMenu.value) {
    showCategoryMenu.value = false
    showMaxResultsMenu.value = false
    showScoreDimensionMenu.value = false
  }
}

// 切换分类菜单
const toggleCategoryMenu = () => {
  showCategoryMenu.value = !showCategoryMenu.value
  if (showCategoryMenu.value) {
    showDateMenu.value = false
    showMaxResultsMenu.value = false
    showScoreDimensionMenu.value = false
  }
}

// 切换最大数量菜单
const toggleMaxResultsMenu = () => {
  showMaxResultsMenu.value = !showMaxResultsMenu.value
  if (showMaxResultsMenu.value) {
    showDateMenu.value = false
    showCategoryMenu.value = false
    showScoreDimensionMenu.value = false
  }
}

// 切换评分维度菜单
const toggleScoreDimensionMenu = () => {
  showScoreDimensionMenu.value = !showScoreDimensionMenu.value
  if (showScoreDimensionMenu.value) {
    showDateMenu.value = false
    showCategoryMenu.value = false
    showMaxResultsMenu.value = false
  }
}

// 选择分类
const selectCategory = (value: string) => {
  emit('update:filters', {
    ...props.filters,
    category: value
  })
  showCategoryMenu.value = false
}

// 选择评分维度
const selectScoreDimension = (value: string) => {
  emit('update:filters', {
    ...props.filters,
    scoreDimension: value
  })
  showScoreDimensionMenu.value = false
}

// 处理日期更新
const handleDateUpdate = (value: string) => {
  emit('update:filters', {
    ...props.filters,
    startDate: value
  })
  showDateMenu.value = false
}

// 处理最大数量变化
const handleMaxResultsChange = () => {
  emit('update:filters', {
    ...props.filters
  })
  showMaxResultsMenu.value = false
}

// 搜索
const handleSearch = () => {
  emit('search')
}

// 重置
const handleReset = () => {
  emit('update:filters', {
    startDate: getWeekAgoString(),
    category: '',
    maxResults: DEFAULT_MAX_RESULTS,
    scoreDimension: 'total'
  })
  emit('reset')
}

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  if (dateItemRef.value && !dateItemRef.value.contains(event.target as Node)) {
    showDateMenu.value = false
  }
  if (categoryItemRef.value && !categoryItemRef.value.contains(event.target as Node)) {
    showCategoryMenu.value = false
  }
  if (maxResultsItemRef.value && !maxResultsItemRef.value.contains(event.target as Node)) {
    showMaxResultsMenu.value = false
  }
  if (scoreDimensionItemRef.value && !scoreDimensionItemRef.value.contains(event.target as Node)) {
    showScoreDimensionMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.filter-bar {
  background: #000000;
  border-bottom: 1px solid #333333;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-bar-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
  display: flex;
  align-items: stretch;
  gap: 0;
}

.filter-item {
  position: relative;
}

.filter-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background: #000000;
  border: none;
  border-bottom: 3px solid transparent;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9375rem;
  font-weight: 500;
  position: relative;
  min-width: 120px;
}

.filter-button:hover {
  background: #1a1a1a;
}

.filter-button-active {
  background: #1a1a1a;
  border-bottom-color: #ffffff;
}

.filter-label {
  color: #ffffff;
}

.filter-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: #1a1a1a;
  border: 1px solid #333333;
  border-top: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 200px;
  padding: 0.75rem;
}

.date-dropdown {
  min-width: auto;
}

.category-dropdown {
  max-height: 300px;
  overflow-y: auto;
}

.score-dimension-dropdown {
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-option {
  padding: 0.5rem 0.75rem;
  color: #ffffff;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background 0.2s;
}

.dropdown-option:hover {
  background: #252525;
}

.dropdown-option-selected {
  background: #333333;
  font-weight: 600;
}

.date-input {
  padding: 0.5rem 0 !important;
  border: none !important;
  border-bottom: 1px solid #666666 !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: #ffffff !important;
  font-size: 0.875rem !important;
  width: 100% !important;
  min-width: 180px !important;
  outline: none !important;
  transition: border-bottom 0.2s ease !important;
  font-family: inherit !important;
  -webkit-appearance: none !important;
  -moz-appearance: textfield !important;
  appearance: none !important;
  box-shadow: none !important;
}

.date-input:hover {
  border-bottom-color: #888888 !important;
}

.date-input:focus {
  border-bottom: 2px solid #ffffff !important;
  box-shadow: none !important;
}

.date-input::-webkit-datetime-edit {
  color: #ffffff !important;
}

.date-input::-webkit-datetime-edit-fields-wrapper {
  color: #ffffff !important;
}

.date-input::-webkit-datetime-edit-text {
  color: #ffffff !important;
}

.date-input::-webkit-datetime-edit-month-field,
.date-input::-webkit-datetime-edit-day-field,
.date-input::-webkit-datetime-edit-year-field {
  color: #ffffff !important;
}

.number-input {
  padding: 0.5rem 0;
  border: none;
  border-bottom: 1px solid #666666;
  border-radius: 0;
  background: transparent;
  color: #ffffff;
  font-size: 0.875rem;
  width: 100%;
  min-width: 180px;
  outline: none;
  caret-color: #ffffff;
  transition: border-bottom 0.2s ease;
}

.number-input::selection {
  background: rgba(255, 255, 255, 0.2);
}

.date-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.date-input::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

.number-input:hover {
  border-bottom-color: #888888;
}

.number-input:focus {
  outline: none;
  border-bottom: 2px solid #ffffff;
  box-shadow: none;
}

.number-input::-webkit-inner-spin-button {
  opacity: 0.5;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
  padding: 0.5rem 1rem;
  align-items: center;
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #000000;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  font-weight: 600;
}

.search-button:hover:not(:disabled) {
  background: #f0f0f0;
  transform: translateY(-1px);
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-button {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #333333;
  border-radius: 0.5rem;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reset-button:hover {
  background: #1a1a1a;
  border-color: #555555;
}

@media (max-width: 768px) {
  .filter-bar-container {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }

  .filter-button {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }

  .filter-actions {
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

