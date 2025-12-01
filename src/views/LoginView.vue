<template>
  <div class="login-view">
    <Header />

    <main class="main-content">
      <div class="container">
        <div class="auth-card-wrapper">
          <Card class="login-card">
            <div class="login-card-content">
              <!-- 左侧图片区域 -->
              <div class="login-image-section">
                <img
                  :src="loginImage"
                  alt="登录"
                  class="login-image"
                />
              </div>
              
              <!-- 右侧表单区域 -->
              <div class="auth-content">
                <h2 class="auth-title">登录</h2>
                <p class="auth-subtitle">欢迎回到 arXivist</p>

                <form @submit.prevent="handleLogin" class="auth-form">
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
                      placeholder="请输入密码"
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
                      size="md"
                      :loading="loading"
                      :disabled="loading"
                      class="submit-button login-button"
                    >
                      登录
                    </Button>
                  </div>

                  <div class="auth-footer">
                    <p class="auth-footer-text">
                      还没有账号？
                      <router-link to="/register" class="auth-link">立即注册</router-link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import type { UserLogin } from '@/types'
import Header from '@/components/layout/Header.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import loginImage from '@/assets/images/login.png'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const form = ref<UserLogin>({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

// 处理登录
const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await authStore.loginUser(form.value)
    // 登录成功，跳转到首页或之前访问的页面
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/')
  } catch (err: any) {
    // 处理错误
    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else if (err.message) {
      error.value = err.message
    } else {
      error.value = '登录失败，请检查邮箱和密码'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  background: #e5e5e5;
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
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
}

.auth-card-wrapper {
  width: 100%;
}

.login-card {
  background: #000000 !important;
  overflow: hidden;
}

.login-card-content {
  display: flex;
  min-height: 500px;
  margin-left: -1.5rem;
  margin-top: -1.5rem;
  margin-bottom: -1.5rem;
  margin-right: 0;
  width: calc(100% + 1.5rem);
  box-sizing: border-box;
}

.login-image-section {
  flex: 0 0 50%;
  width: 50%;
  max-width: 50%;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  overflow: hidden;
  margin: 0;
  padding: 0;
  min-width: 0;
  box-sizing: border-box;
}

.login-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
}

.auth-content {
  flex: 0 0 50%;
  width: 50%;
  max-width: 50%;
  padding: 2rem;
  padding-left: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 0.8rem;
  box-sizing: border-box;
}

.auth-title {
  margin: 0 0 0.5rem;
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
}

.auth-subtitle {
  margin: 0 0 2rem;
  color: #ffffff;
  opacity: 0.8;
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
  color: #ffffff;
}

.form-input {
  padding: 0.5rem 0.75rem;
  border: 2px solid #333333;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: #1a1a1a;
  color: #ffffff;
}

.form-input:hover:not(:disabled) {
  border-color: #555555;
}

.form-input:focus {
  outline: none;
  border-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.form-input::placeholder {
  color: #666666;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  padding: 0.75rem 1rem;
  background: #2a1a1a;
  border: 1px solid #4a2a2a;
  border-radius: 0.5rem;
  color: #ff6b6b;
  font-size: 0.875rem;
}

.form-actions {
  margin-top: 0.5rem;
}

.submit-button {
  width: 100%;
}

.login-button {
  background: #ffffff !important;
  color: #000000 !important;
}

.login-button:hover:not(:disabled) {
  background: #f0f0f0 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.auth-footer-text {
  margin: 0;
  color: #ffffff;
  opacity: 0.7;
  font-size: 0.875rem;
}

.auth-link {
  color: #999999;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.auth-link:hover {
  color: #ffffff;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-card-content {
    flex-direction: column;
    min-height: auto;
    width: calc(100% + 3rem);
  }

  .login-image-section {
    height: 200px;
    flex: none;
    width: 100%;
    max-width: 100%;
  }

  .auth-content {
    width: 100%;
    max-width: 100%;
  }

  .container {
    max-width: 500px;
  }
}
</style>

