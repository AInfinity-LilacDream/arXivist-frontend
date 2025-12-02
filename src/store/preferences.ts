import { defineStore } from 'pinia'
import { ref } from 'vue'

export type LanguageCode = 'zh' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru' | 'pt' | 'it'

export const LANGUAGE_MAP: Record<LanguageCode, string> = {
  zh: '中文',
  en: '英文',
  ja: '日文',
  ko: '韩文',
  fr: '法文',
  de: '德文',
  es: '西班牙文',
  ru: '俄文',
  pt: '葡萄牙文',
  it: '意大利文'
}

export const usePreferencesStore = defineStore('preferences', () => {
  // 用户偏好语言，默认为中文
  const preferredLanguage = ref<LanguageCode>('zh')

  // 从localStorage加载偏好设置
  const loadPreferences = () => {
    const saved = localStorage.getItem('preferred_language')
    if (saved && saved in LANGUAGE_MAP) {
      preferredLanguage.value = saved as LanguageCode
    }
  }

  // 保存偏好语言到localStorage
  const setPreferredLanguage = (language: LanguageCode) => {
    preferredLanguage.value = language
    localStorage.setItem('preferred_language', language)
  }

  // 初始化时加载偏好设置
  loadPreferences()

  return {
    preferredLanguage,
    setPreferredLanguage,
    loadPreferences
  }
})

