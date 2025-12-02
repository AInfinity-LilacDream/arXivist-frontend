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
 * 获取一周前的日期字符串 YYYY-MM-DD
 */
export function getWeekAgoString(): string {
  const date = new Date()
  date.setDate(date.getDate() - 7)
  return formatDateInput(date)
}

/**
 * 截断文本，智能处理 LaTeX 公式
 * 如果截断位置在 LaTeX 公式中间，会自动补充完整的公式
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  
  // 截断到指定长度
  let truncated = text.slice(0, maxLength)
  const remainingText = text.slice(maxLength)
  
  // 检查截断位置是否在 LaTeX 公式中间
  // 使用栈来跟踪未闭合的公式标记
  
  // 先处理块级公式 $$...$$
  let blockStack: number[] = [] // 存储 $$ 开始位置
  
  for (let i = 0; i < truncated.length; i++) {
    if (i < truncated.length - 1 && truncated[i] === '$' && truncated[i + 1] === '$') {
      // 找到 $$
      if (blockStack.length > 0 && blockStack[blockStack.length - 1] === i - 1) {
        // 这是结束标记，弹出栈
        blockStack.pop()
      } else {
        // 这是开始标记，入栈
        blockStack.push(i)
      }
      i++ // 跳过下一个 $
    }
  }
  
  // 如果有未闭合的块级公式
  if (blockStack.length > 0) {
    // 查找闭合的 $$
    const closingIndex = remainingText.indexOf('$$')
    if (closingIndex !== -1) {
      // 找到了闭合标签，补充完整公式
      truncated += remainingText.slice(0, closingIndex + 2)
      truncated += '...'
      return truncated
    } else {
      // 没找到闭合标签，补充闭合标签
      truncated += '$$...'
      return truncated
    }
  }
  
  // 再处理行内公式 $...$
  // 需要排除已经是 $$ 的 $
  let inlineCount = 0 // 统计单个 $ 的数量（排除 $$）
  
  for (let i = 0; i < truncated.length; i++) {
    if (truncated[i] === '$') {
      // 检查是否是 $$ 的一部分
      const isPartOfBlock = 
        (i > 0 && truncated[i - 1] === '$') || 
        (i < truncated.length - 1 && truncated[i + 1] === '$')
      
      if (!isPartOfBlock) {
        // 这是单个 $，计入行内公式计数
        inlineCount++
      } else if (i < truncated.length - 1 && truncated[i + 1] === '$') {
        i++ // 跳过 $$ 的下一个 $
      }
    }
  }
  
  // 如果行内公式数量是奇数，说明有未闭合的行内公式
  if (inlineCount % 2 === 1) {
    // 查找闭合的 $（但要排除 $$）
    let closingIndex = -1
    for (let i = 0; i < remainingText.length; i++) {
      if (remainingText[i] === '$') {
        // 检查前后是否都是 $（避免误判 $$）
        const isDoubleDollar = 
          (i > 0 && remainingText[i - 1] === '$') || 
          (i < remainingText.length - 1 && remainingText[i + 1] === '$')
        
        if (!isDoubleDollar) {
          closingIndex = i
          break
        }
      }
    }
    
    if (closingIndex !== -1) {
      // 找到了闭合标签，补充完整公式
      truncated += remainingText.slice(0, closingIndex + 1)
      truncated += '...'
      return truncated
    } else {
      // 没找到闭合标签，补充闭合标签
      truncated += '$...'
      return truncated
    }
  }
  
  // 没有未闭合的公式，直接添加省略号
  truncated += '...'
  return truncated
}
