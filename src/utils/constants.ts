/**
 * arXiv 分类常量
 */
export const ARXIV_CATEGORIES = [
  { label: '全部', value: '' },
  { label: '计算机科学 - 人工智能', value: 'cs.AI' },
  { label: '计算机科学 - 计算机视觉', value: 'cs.CV' },
  { label: '计算机科学 - 机器学习', value: 'cs.LG' },
  { label: '计算机科学 - 自然语言处理', value: 'cs.CL' },
  { label: '计算机科学 - 神经网络', value: 'cs.NE' },
  { label: '计算机科学 - 机器人学', value: 'cs.RO' },
  { label: '计算机科学 - 软件工程', value: 'cs.SE' },
  { label: '计算机科学 - 系统架构', value: 'cs.SY' },
  { label: '数学 - 统计', value: 'math.ST' },
  { label: '数学 - 优化', value: 'math.OC' },
  { label: '物理 - 量子物理', value: 'physics.quant-ph' },
  { label: '其他', value: 'other' }
] as const

/**
 * 默认查询参数
 */
export const DEFAULT_MAX_RESULTS = 10
export const MAX_RESULTS_LIMIT = 2000
