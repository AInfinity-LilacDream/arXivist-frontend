/**
 * 格式化日期
 * 支持 ISO 8601 格式的日期字符串（如：2025-01-17T00:00:00Z）
 */
export function formatDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date

    // 检查日期是否有效
    if (isNaN(d.getTime())) {
      return date as string
    }

    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Date formatting error:', error)
    return typeof date === 'string' ? date : date.toString()
  }
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDateInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 获取今天的日期字符串 YYYY-MM-DD
 */
export function getTodayString(): string {
  return formatDateInput(new Date())
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
