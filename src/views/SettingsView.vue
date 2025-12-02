<template>
  <MainLayout>
    <div class="settings-view">
      <div class="settings-container">
        <Card>
          <div class="settings-content">
            <h2 class="settings-title">设置</h2>

            <div class="settings-section">
              <h3 class="section-title">语言偏好</h3>
              <p class="section-description">选择您希望查看论文摘要的语言</p>
              
              <div class="language-options">
                <label
                  v-for="(label, code) in LANGUAGE_MAP"
                  :key="code"
                  class="language-option"
                  :class="{ 'language-option-selected': currentLanguage === code }"
                >
                  <input
                    type="radio"
                    :value="code"
                    :checked="currentLanguage === code"
                    @change="handleLanguageChange(code as LanguageCode)"
                    class="language-radio"
                    :disabled="saving"
                  />
                  <span class="language-label">{{ label }}</span>
                </label>
              </div>
            </div>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <div class="settings-actions">
              <Button variant="outline" @click="handleBack" :disabled="saving">
                返回
              </Button>
              <Button
                variant="primary"
                @click="handleSave"
                :loading="saving"
                :disabled="!hasChanges || saving"
              >
                保存
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePreferencesStore, LANGUAGE_MAP, type LanguageCode } from '@/store/preferences'
import { useAuthStore } from '@/store/auth'
import MainLayout from '@/components/layout/MainLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'

const router = useRouter()
const preferencesStore = usePreferencesStore()
const authStore = useAuthStore()

// 保存原始语言偏好（从用户信息或preferences store）
const originalLanguage = ref<LanguageCode>(preferencesStore.preferredLanguage)
// 当前选择的语言
const currentLanguage = ref<LanguageCode>(preferencesStore.preferredLanguage)
// 保存状态
const saving = ref(false)
const error = ref('')

// 检查是否有更改
const hasChanges = computed(() => {
  return currentLanguage.value !== originalLanguage.value
})

// 初始化：从用户信息获取偏好语言
onMounted(() => {
  if (authStore.user?.preferred_language) {
    const userLang = authStore.user.preferred_language as LanguageCode
    if (userLang in LANGUAGE_MAP) {
      originalLanguage.value = userLang
      currentLanguage.value = userLang
      preferencesStore.setPreferredLanguage(userLang)
    }
  }
})

const handleLanguageChange = (language: LanguageCode) => {
  currentLanguage.value = language
  // 临时更新preferences store（用于预览效果）
  preferencesStore.setPreferredLanguage(language)
}

// 保存设置
const handleSave = async () => {
  if (!hasChanges.value) {
    return
  }

  saving.value = true
  error.value = ''

  try {
    // 更新后端用户信息
    await authStore.updateUser({
      preferred_language: currentLanguage.value
    })
    
    // 更新原始语言偏好
    originalLanguage.value = currentLanguage.value
    // preferences store 已经在 handleLanguageChange 中更新了
  } catch (err: any) {
    console.error('Failed to save settings:', err)
    error.value = err.response?.data?.message || '保存设置失败，请稍后重试'
    // 恢复语言选择
    currentLanguage.value = originalLanguage.value
    preferencesStore.setPreferredLanguage(originalLanguage.value)
  } finally {
    saving.value = false
  }
}

const handleBack = () => {
  // 如果有未保存的更改，恢复原始设置
  if (hasChanges.value) {
    currentLanguage.value = originalLanguage.value
    preferencesStore.setPreferredLanguage(originalLanguage.value)
  }
  router.back()
}
</script>

<style scoped>
.settings-view {
  min-height: 100%;
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
}

.settings-content {
  padding: 2rem;
}

.settings-title {
  margin: 0 0 2rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
}

.settings-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #333333;
}

.settings-section:last-of-type {
  border-bottom: none;
}

.section-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
}

.section-description {
  margin: 0 0 1.5rem;
  color: #a0a0a0;
  font-size: 0.9375rem;
}

.language-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
}

.language-option {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 2px solid #333333;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  background: #1a1a1a;
}

.language-option:hover {
  border-color: #555555;
  background: #252525;
}

.language-option-selected {
  border-color: #ffffff;
  background: #252525;
}

.language-radio {
  margin-right: 0.75rem;
  cursor: pointer;
  width: 1rem;
  height: 1rem;
  accent-color: #ffffff;
}

.language-label {
  color: #ffffff;
  font-size: 0.9375rem;
  user-select: none;
}

.settings-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.settings-actions .btn-outline {
  background: transparent !important;
  border: 2px solid #ffffff !important;
  color: #ffffff !important;
}

.settings-actions .btn-outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: #ffffff !important;
  color: #ffffff !important;
}

.settings-actions .btn-primary {
  background: #ffffff !important;
  border: 2px solid #ffffff !important;
  color: #000000 !important;
}

.settings-actions .btn-primary:hover:not(:disabled) {
  background: #f0f0f0 !important;
  border-color: #ffffff !important;
  color: #000000 !important;
}

.settings-actions .btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .settings-content {
    padding: 1.5rem;
  }

  .language-options {
    grid-template-columns: 1fr;
  }
}
</style>

