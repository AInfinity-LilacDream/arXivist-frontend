import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPaperDetail, startAIScoreTask, getAIScoreTaskStatus } from '@/api/services/paperService'
import type { PaperDetail, AISummary } from '@/types'

export const usePaperStore = defineStore('paper', () => {
  // 论文详情缓存，key为arxiv_id
  const paperDetailsCache = ref<Map<string, PaperDetail>>(new Map())
  
  // AI评分缓存，key为arxiv_id
  const aiScoreCache = ref<Map<string, AISummary>>(new Map())
  
  // 正在加载的论文ID集合
  const loadingPapers = ref<Set<string>>(new Set())
  
  // 正在加载AI评分的论文ID集合
  const loadingAIScores = ref<Set<string>>(new Set())
  
  // 正在轮询的任务ID集合，key为arxiv_id，value为task_id
  const pollingTasks = ref<Map<string, string>>(new Map())
  
  // 轮询间隔器，key为arxiv_id
  const pollingIntervals = ref<Map<string, ReturnType<typeof setInterval>>>(new Map())

  /**
   * 获取论文详情（优先从缓存获取）
   */
  const getPaperDetailCached = async (arxivId: string): Promise<PaperDetail> => {
    // 如果缓存中有，直接返回
    const cached = paperDetailsCache.value.get(arxivId)
    if (cached) {
      return cached
    }

    // 如果正在加载，等待加载完成
    if (loadingPapers.value.has(arxivId)) {
      // 等待其他请求完成
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          const cached = paperDetailsCache.value.get(arxivId)
          if (cached) {
            clearInterval(checkInterval)
            resolve(cached)
          }
          if (!loadingPapers.value.has(arxivId)) {
            clearInterval(checkInterval)
            // 如果加载失败，重新获取
            getPaperDetailCached(arxivId).then(resolve)
          }
        }, 100)
      })
    }

    // 从API获取
    loadingPapers.value.add(arxivId)
    try {
      const detail = await getPaperDetail(arxivId)
      paperDetailsCache.value.set(arxivId, detail)
      return detail
    } catch (error) {
      console.error(`Failed to fetch paper detail for ${arxivId}:`, error)
      throw error
    } finally {
      loadingPapers.value.delete(arxivId)
    }
  }

  /**
   * 批量获取论文详情
   */
  const batchGetPaperDetails = async (arxivIds: string[]): Promise<void> => {
    // 过滤出需要获取的论文ID（不在缓存中的）
    const idsToFetch = arxivIds.filter(id => !paperDetailsCache.value.has(id) && !loadingPapers.value.has(id))
    
    if (idsToFetch.length === 0) {
      return
    }

    // 批量获取（限制并发数，避免过多请求）
    const batchSize = 5 // 每次并发5个请求
    for (let i = 0; i < idsToFetch.length; i += batchSize) {
      const batch = idsToFetch.slice(i, i + batchSize)
      await Promise.allSettled(
        batch.map(arxivId => getPaperDetailCached(arxivId))
      )
    }
  }

  /**
   * 轮询AI评分任务状态
   */
  const pollAIScoreTask = async (arxivId: string, taskId: string): Promise<void> => {
    const poll = async () => {
      try {
        const status = await getAIScoreTaskStatus(taskId)
        
        if (status.status === 'completed' && status.result) {
          // 任务完成，保存结果并停止轮询
          aiScoreCache.value.set(arxivId, status.result)
          loadingAIScores.value.delete(arxivId)
          pollingTasks.value.delete(arxivId)
          
          const interval = pollingIntervals.value.get(arxivId)
          if (interval) {
            clearInterval(interval)
            pollingIntervals.value.delete(arxivId)
          }
        } else if (status.status === 'failed') {
          // 任务失败，停止轮询
          console.error(`AI score task failed for ${arxivId}:`, status.error)
          loadingAIScores.value.delete(arxivId)
          pollingTasks.value.delete(arxivId)
          
          const interval = pollingIntervals.value.get(arxivId)
          if (interval) {
            clearInterval(interval)
            pollingIntervals.value.delete(arxivId)
          }
        }
        // pending 或 processing 状态继续轮询
      } catch (error) {
        console.error(`Failed to poll AI score task for ${arxivId}:`, error)
        // 轮询失败，停止轮询
        loadingAIScores.value.delete(arxivId)
        pollingTasks.value.delete(arxivId)
        
        const interval = pollingIntervals.value.get(arxivId)
        if (interval) {
          clearInterval(interval)
          pollingIntervals.value.delete(arxivId)
        }
      }
    }

    // 立即执行一次
    await poll()
    
    // 设置轮询间隔（每2秒轮询一次）
    const interval = setInterval(poll, 2000)
    pollingIntervals.value.set(arxivId, interval)
  }

  /**
   * 启动异步AI评分任务
   */
  const startAIScoreTaskAsync = async (arxivId: string): Promise<void> => {
    // 如果缓存中有，直接返回
    if (aiScoreCache.value.has(arxivId)) {
      return
    }

    // 如果正在加载或轮询，不重复启动
    if (loadingAIScores.value.has(arxivId) || pollingTasks.value.has(arxivId)) {
      return
    }

    loadingAIScores.value.add(arxivId)
    
    try {
      const taskResponse = await startAIScoreTask(arxivId)
      pollingTasks.value.set(arxivId, taskResponse.task_id)
      // 开始轮询
      await pollAIScoreTask(arxivId, taskResponse.task_id)
    } catch (error) {
      console.error(`Failed to start AI score task for ${arxivId}:`, error)
      loadingAIScores.value.delete(arxivId)
    }
  }

  /**
   * 获取AI评分（优先从缓存获取，否则启动异步任务）
   */
  const getAIScoreCached = async (arxivId: string): Promise<AISummary | null> => {
    // 如果缓存中有，直接返回
    const cached = aiScoreCache.value.get(arxivId)
    if (cached) {
      return cached
    }

    // 如果正在加载或轮询，等待完成
    if (loadingAIScores.value.has(arxivId) || pollingTasks.value.has(arxivId)) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          const cached = aiScoreCache.value.get(arxivId)
          if (cached) {
            clearInterval(checkInterval)
            resolve(cached)
          }
          if (!loadingAIScores.value.has(arxivId) && !pollingTasks.value.has(arxivId)) {
            clearInterval(checkInterval)
            // 如果加载失败，返回null
            resolve(null)
          }
        }, 100)
      })
    }

    // 启动异步任务
    await startAIScoreTaskAsync(arxivId)
    return null
  }

  /**
   * 批量启动AI评分任务
   */
  const batchGetAIScores = async (arxivIds: string[]): Promise<void> => {
    // 过滤出需要启动任务的论文ID（不在缓存中的，且没有正在加载的）
    const idsToFetch = arxivIds.filter(id => 
      !aiScoreCache.value.has(id) && 
      !loadingAIScores.value.has(id) && 
      !pollingTasks.value.has(id)
    )
    
    if (idsToFetch.length === 0) {
      return
    }

    // 批量启动任务（限制并发数，避免过多请求）
    const batchSize = 10 // 每次并发10个任务
    for (let i = 0; i < idsToFetch.length; i += batchSize) {
      const batch = idsToFetch.slice(i, i + batchSize)
      // 并行启动所有任务，不等待完成
      Promise.allSettled(
        batch.map(arxivId => startAIScoreTaskAsync(arxivId))
      )
    }
  }

  /**
   * 获取缓存的AI评分（不触发API调用）
   */
  const getCachedAIScore = (arxivId: string): AISummary | undefined => {
    return aiScoreCache.value.get(arxivId)
  }

  /**
   * 更新论文详情缓存
   */
  const updatePaperDetail = (detail: PaperDetail) => {
    paperDetailsCache.value.set(detail.arxiv_id, detail)
  }

  /**
   * 获取缓存的论文详情（不触发API调用）
   */
  const getCachedPaperDetail = (arxivId: string): PaperDetail | undefined => {
    return paperDetailsCache.value.get(arxivId)
  }

  /**
   * 清除缓存
   */
  const clearCache = () => {
    paperDetailsCache.value.clear()
    aiScoreCache.value.clear()
    // 清除所有轮询间隔器
    pollingIntervals.value.forEach(interval => clearInterval(interval))
    pollingIntervals.value.clear()
    pollingTasks.value.clear()
  }

  return {
    paperDetailsCache,
    aiScoreCache,
    loadingPapers,
    loadingAIScores,
    pollingTasks,
    getPaperDetailCached,
    batchGetPaperDetails,
    updatePaperDetail,
    getCachedPaperDetail,
    getAIScoreCached,
    batchGetAIScores,
    getCachedAIScore,
    startAIScoreTaskAsync,
    clearCache
  }
})

