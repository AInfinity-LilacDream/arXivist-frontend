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
 * 渲染LaTeX数学公式和命令
 * @param text 包含LaTeX的文本
 * @returns 渲染后的HTML字符串
 */
export function renderLatex(text: string): string {
  if (!text) return ''
  
  // 使用占位符标记LaTeX公式位置，避免在转义时被破坏
  const latexBlocks: string[] = []
  const latexCommands: string[] = []
  let processed = text
  let blockIndex = 0
  let commandIndex = 0
  
  // 先处理 LaTeX 命令（在数学公式之前处理，避免被公式处理影响）
  
  // 处理引用命令 \cite{key} -> [key]
  processed = processed.replace(/\\cite\{([^}]+)\}/g, (match, key) => {
    // 处理多个引用，如 \cite{key1,key2}
    const keys = key.split(',').map((k: string) => k.trim()).join(', ')
    const placeholder = `__LATEX_CITE_${commandIndex}__`
    latexCommands[commandIndex] = `<span class="latex-cite">[${escapeHtml(keys)}]</span>`
    commandIndex++
    return placeholder
  })
  
  // 处理引用命令 \citep{key} -> (key)
  processed = processed.replace(/\\citep\{([^}]+)\}/g, (match, key) => {
    const keys = key.split(',').map((k: string) => k.trim()).join(', ')
    const placeholder = `__LATEX_CITE_${commandIndex}__`
    latexCommands[commandIndex] = `<span class="latex-cite">(${escapeHtml(keys)})</span>`
    commandIndex++
    return placeholder
  })
  
  // 处理引用命令 \citet{key} -> key
  processed = processed.replace(/\\citet\{([^}]+)\}/g, (match, key) => {
    const keys = key.split(',').map((k: string) => k.trim()).join(', ')
    const placeholder = `__LATEX_CITE_${commandIndex}__`
    latexCommands[commandIndex] = `<span class="latex-cite">${escapeHtml(keys)}</span>`
    commandIndex++
    return placeholder
  })
  
  // 处理引用命令 \ref{key} -> [key]
  processed = processed.replace(/\\ref\{([^}]+)\}/g, (match, key) => {
    const placeholder = `__LATEX_REF_${commandIndex}__`
    latexCommands[commandIndex] = `<span class="latex-ref">[${escapeHtml(key)}]</span>`
    commandIndex++
    return placeholder
  })
  
  // 处理标签命令 \label{key} -> 移除（标签在显示时不需要）
  processed = processed.replace(/\\label\{[^}]+\}/g, '')
  
  // 处理文本格式命令
  // \textbf{text} -> <strong>text</strong>
  processed = processed.replace(/\\textbf\{([^}]+)\}/g, (match, content) => {
    const placeholder = `__LATEX_STRONG_${commandIndex}__`
    latexCommands[commandIndex] = `<strong>${escapeHtml(content)}</strong>`
    commandIndex++
    return placeholder
  })
  
  // \textit{text} -> <em>text</em>
  processed = processed.replace(/\\textit\{([^}]+)\}/g, (match, content) => {
    const placeholder = `__LATEX_EM_${commandIndex}__`
    latexCommands[commandIndex] = `<em>${escapeHtml(content)}</em>`
    commandIndex++
    return placeholder
  })
  
  // \emph{text} -> <em>text</em>
  processed = processed.replace(/\\emph\{([^}]+)\}/g, (match, content) => {
    const placeholder = `__LATEX_EM_${commandIndex}__`
    latexCommands[commandIndex] = `<em>${escapeHtml(content)}</em>`
    commandIndex++
    return placeholder
  })
  
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
  
  // 处理行内公式 $...$ (排除已经被处理的块级公式和命令占位符)
  processed = processed.replace(/\$([^$\n]+)\$/g, (match, formula) => {
    // 跳过占位符
    if (match.includes('__LATEX_BLOCK_') || match.includes('__LATEX_CITE_') || match.includes('__LATEX_REF_') || match.includes('__LATEX_STRONG_') || match.includes('__LATEX_EM_')) {
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
  
  // 替换命令占位符为实际渲染的HTML
  latexCommands.forEach((rendered, index) => {
    escaped = escaped.replace(`__LATEX_CITE_${index}__`, rendered)
    escaped = escaped.replace(`__LATEX_REF_${index}__`, rendered)
    escaped = escaped.replace(`__LATEX_STRONG_${index}__`, rendered)
    escaped = escaped.replace(`__LATEX_EM_${index}__`, rendered)
  })
  
  // 替换公式占位符为实际渲染的HTML
  latexBlocks.forEach((rendered, index) => {
    escaped = escaped.replace(`__LATEX_BLOCK_${index}__`, rendered)
    escaped = escaped.replace(`__LATEX_INLINE_${index}__`, rendered)
  })
  
  return escaped
}

