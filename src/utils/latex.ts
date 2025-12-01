import katex from 'katex'
import 'katex/dist/katex.min.css'

/**
 * 转义HTML特殊字符
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * 渲染LaTeX数学公式
 * @param text 包含LaTeX的文本
 * @returns 渲染后的HTML字符串
 */
export function renderLatex(text: string): string {
  if (!text) return ''
  
  // 使用占位符标记LaTeX公式位置，避免在转义时被破坏
  const latexBlocks: string[] = []
  let processed = text
  let blockIndex = 0
  
  // 处理块级公式 $$...$$
  processed = processed.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
    try {
      const rendered = katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false })
      const placeholder = `__LATEX_BLOCK_${blockIndex}__`
      latexBlocks[blockIndex] = rendered
      blockIndex++
      return placeholder
    } catch (e) {
      return match
    }
  })
  
  // 处理行内公式 $...$ (排除已经被处理的块级公式)
  processed = processed.replace(/\$([^$\n]+)\$/g, (match, formula) => {
    // 跳过占位符
    if (match.includes('__LATEX_BLOCK_')) {
      return match
    }
    try {
      const rendered = katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false })
      const placeholder = `__LATEX_INLINE_${blockIndex}__`
      latexBlocks[blockIndex] = rendered
      blockIndex++
      return placeholder
    } catch (e) {
      return match
    }
  })
  
  // 转义HTML特殊字符
  let escaped = escapeHtml(processed)
  
  // 替换占位符为实际渲染的HTML
  latexBlocks.forEach((rendered, index) => {
    escaped = escaped.replace(`__LATEX_BLOCK_${index}__`, rendered)
    escaped = escaped.replace(`__LATEX_INLINE_${index}__`, rendered)
  })
  
  return escaped
}

