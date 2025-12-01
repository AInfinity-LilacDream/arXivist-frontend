<template>
  <div class="register-view">
    <Header />

    <main class="main-content">
      <div class="container">
        <div class="auth-card-wrapper">
          <Card>
            <div class="auth-content">
              <h2 class="auth-title">注册</h2>
              <p class="auth-subtitle">创建您的 arXivist 账号</p>

              <form @submit.prevent="handleRegister" class="auth-form">
                <div class="form-group">
                  <label class="form-label" for="email">邮箱地址</label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="form-input"
                    placeholder="请输入邮箱地址"
                    required
                    :disabled="loading"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="password">密码</label>
                  <input
                    id="password"
                    v-model="form.password"
                    type="password"
                    class="form-input"
                    placeholder="请输入密码（至少6位）"
                    required
                    minlength="6"
                    :disabled="loading"
                  />
                  <p class="form-hint">密码至少需要6位字符</p>
                </div>

                <div class="form-group">
                  <label class="form-label" for="confirmPassword">确认密码</label>
                  <input
                    id="confirmPassword"
                    v-model="confirmPassword"
                    type="password"
                    class="form-input"
                    placeholder="请再次输入密码"
                    required
                    :disabled="loading"
                  />
                </div>

                <div v-if="error" class="error-message">
                  {{ error }}
                </div>

                <div class="form-actions">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    :loading="loading"
                    :disabled="loading || !isFormValid"
                    class="submit-button"
                  >
                    注册
                  </Button>
                </div>

                <div class="auth-footer">
                  <p class="auth-footer-text">
                    已有账号？
                    <router-link to="/login" class="auth-link">立即登录</router-link>
                  </p>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import type { UserRegister } from '@/types'
import Header from '@/components/layout/Header.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const form = ref<UserRegister>({
  email: '',
  password: ''
})

const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

// 表单验证
const isFormValid = computed(() => {
  return (
    form.value.email.length > 0 &&
    form.value.password.length >= 6 &&
    form.value.password === confirmPassword.value
  )
})

// 处理注册
const handleRegister = async () => {
  error.value = ''

  // 验证密码匹配
  if (form.value.password !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }

  // 验证密码长度
  if (form.value.password.length < 6) {
    error.value = '密码至少需要6位字符'
    return
  }

  loading.value = true

  try {
    await authStore.registerUser(form.value)
    // 注册成功后自动登录
    await authStore.loginUser({
      email: form.value.email,
      password: form.value.password
    })
    // 跳转到首页
    router.push('/')
  } catch (err: any) {
    // 处理错误
    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else if (err.message) {
      error.value = err.message
    } else {
      error.value = '注册失败，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-view {
  min-height: 100vh;
  background: #f9fafb;
}

.main-content {
  padding: 3rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
}

.container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 2rem;
}

.auth-card-wrapper {
  width: 100%;
}

.auth-content {
  padding: 2rem;
}

.auth-title {
  margin: 0 0 0.5rem;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
}

.auth-subtitle {
  margin: 0 0 2rem;
  color: #6b7280;
  text-align: center;
  font-size: 0.9375rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
  background: white;
  color: #1f2937;
}

.form-input:hover:not(:disabled) {
  border-color: #667eea;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-hint {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.error-message {
  padding: 0.75rem 1rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
}

.form-actions {
  margin-top: 0.5rem;
}

.submit-button {
  width: 100%;
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.auth-footer-text {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.auth-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.auth-link:hover {
  color: #764ba2;
  text-decoration: underline;
}
</style>

