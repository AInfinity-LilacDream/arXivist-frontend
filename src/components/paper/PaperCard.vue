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

    <div ref="contentElement" class="paper-content">
      <div class="paper-authors">
        <span class="authors-label">作者：</span>
        <span class="authors-list">{{ paper.authors.join(', ') }}</span>
      </div>

      <p ref="abstractElement" class="paper-abstract" v-html="renderLatex(truncateText(displaySummary, 300))"></p>

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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate, truncateText } from '@/utils/format'
import { renderLatex } from '@/utils/latex'
import { usePaperStore } from '@/store/paper'
import { usePreferencesStore } from '@/store/preferences'
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
const preferencesStore = usePreferencesStore()
const showCollectionDialog = ref(false)
const translatedSummary = ref<string | null>(null)
const translationCheckInterval = ref<ReturnType<typeof setInterval> | null>(null)
const abstractElement = ref<HTMLElement | null>(null)
const contentElement = ref<HTMLElement | null>(null)
const isTransitioning = ref(false)

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

// 获取显示的摘要（优先使用翻译后的摘要）
const displaySummary = computed(() => {
  if (translatedSummary.value) {
    return translatedSummary.value
  }
  return props.paper.summary
})

// 加载翻译后的摘要
const loadTranslation = async () => {
  const targetLanguage = preferencesStore.preferredLanguage
  
  // 如果目标语言是中文，且摘要已经是中文，不需要翻译
  if (targetLanguage === 'zh') {
    const hasChinese = /[\u4e00-\u9fa5]/.test(props.paper.summary)
    if (hasChinese) {
      return
    }
  }
  
  // 检查缓存
  const cached = paperStore.getCachedTranslation(props.paper.arxiv_id, targetLanguage)
  if (cached) {
    translatedSummary.value = cached
    return
  }
  
  // 检查是否正在加载
  if (paperStore.isLoadingTranslation(props.paper.arxiv_id, targetLanguage)) {
    // 清理之前的定时器
    if (translationCheckInterval.value) {
      clearInterval(translationCheckInterval.value)
    }
    
    // 监听翻译缓存变化
    translationCheckInterval.value = setInterval(() => {
      const cached = paperStore.getCachedTranslation(props.paper.arxiv_id, targetLanguage)
      if (cached) {
        translatedSummary.value = cached
        if (translationCheckInterval.value) {
          clearInterval(translationCheckInterval.value)
          translationCheckInterval.value = null
        }
      }
      if (!paperStore.isLoadingTranslation(props.paper.arxiv_id, targetLanguage)) {
        if (translationCheckInterval.value) {
          clearInterval(translationCheckInterval.value)
          translationCheckInterval.value = null
        }
      }
    }, 100)
    return
  }
  
  // 启动翻译任务
  try {
    await paperStore.getTranslatedSummary(
      props.paper.arxiv_id,
      props.paper.summary,
      targetLanguage
    )
  } catch (error) {
    console.error('Failed to load translation:', error)
  }
}

// 监听偏好语言变化
watch(
  () => preferencesStore.preferredLanguage,
  () => {
    translatedSummary.value = null
    // 清理之前的定时器
    if (translationCheckInterval.value) {
      clearInterval(translationCheckInterval.value)
      translationCheckInterval.value = null
    }
    loadTranslation()
  }
)

// 监听翻译缓存变化
watch(
  () => paperStore.translationCache,
  () => {
    const targetLanguage = preferencesStore.preferredLanguage
    const cached = paperStore.getCachedTranslation(props.paper.arxiv_id, targetLanguage)
    if (cached) {
      translatedSummary.value = cached
    }
  },
  { deep: true }
)

// 监听摘要内容变化，实现平滑的高度过渡
watch(
  () => displaySummary.value,
  async (newSummary, oldSummary) => {
    // 如果内容没有实际变化，不需要动画
    if (newSummary === oldSummary || !contentElement.value) {
      return
    }

    // 如果元素还没有渲染，等待
    if (!contentElement.value.offsetHeight) {
      return
    }

    // 标记正在过渡
    isTransitioning.value = true

    // 获取当前高度
    const currentHeight = contentElement.value.offsetHeight

    // 临时设置固定高度，准备过渡
    contentElement.value.style.height = `${currentHeight}px`
    contentElement.value.style.overflow = 'hidden'

    // 等待浏览器应用样式和 DOM 更新
    await nextTick()
    // 使用 requestAnimationFrame 确保浏览器已经渲染
    await new Promise(resolve => requestAnimationFrame(resolve))

    // 获取新内容的高度（使用 scrollHeight 获取完整内容高度）
    const newHeight = contentElement.value.scrollHeight

    // 如果高度相同或差异很小，不需要动画
    if (Math.abs(newHeight - currentHeight) < 2) {
      contentElement.value.style.height = ''
      contentElement.value.style.overflow = ''
      isTransitioning.value = false
      return
    }

    // 触发重排，确保 transition 生效
    void contentElement.value.offsetHeight

    // 设置新高度，触发过渡动画
    contentElement.value.style.height = `${newHeight}px`

    // 等待动画完成
    setTimeout(() => {
      if (contentElement.value) {
        contentElement.value.style.height = ''
        contentElement.value.style.overflow = ''
        isTransitioning.value = false
      }
    }, 500) // 与 CSS transition 时间一致
  }
)

// 组件挂载时加载翻译
onMounted(() => {
  loadTranslation()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (translationCheckInterval.value) {
    clearInterval(translationCheckInterval.value)
    translationCheckInterval.value = null
  }
})

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
  background: #000000 !important;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease-in-out;
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
  transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: height;
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
  transition: opacity 0.4s ease-in-out;
}

/* LaTeX 引用样式 */
.paper-abstract :deep(.latex-cite),
.paper-abstract :deep(.latex-ref) {
  color: #a0a0a0;
  font-size: 0.875em;
  font-weight: 500;
  vertical-align: baseline;
  margin: 0 0.125em;
}

.paper-abstract :deep(.latex-cite) {
  font-style: italic;
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
