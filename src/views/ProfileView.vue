<template>
  <MainLayout>
    <div class="profile-view">
      <div class="profile-container">
      <Card>
        <div class="profile-content">
          <h2 class="profile-title">个人资料</h2>

          <div v-if="loading" class="loading-container">
            <div class="loading-spinner">
              <div class="spinner"></div>
              <p class="loading-text">加载中...</p>
            </div>
          </div>

          <div v-else-if="user" class="profile-info">
            <div class="profile-section">
              <div class="info-item">
                <label class="info-label">用户ID</label>
                <div class="info-value">{{ user.id }}</div>
              </div>

              <div class="info-item">
                <label class="info-label">邮箱地址</label>
                <div class="info-value">{{ user.email }}</div>
              </div>

              <div class="info-item">
                <label class="info-label">账号状态</label>
                <div class="info-value">
                  <span :class="['status-badge', user.state === 'active' ? 'status-active' : 'status-inactive']">
                    {{ user.state === 'active' ? '活跃' : '未激活' }}
                  </span>
                </div>
              </div>

              <div class="info-item">
                <label class="info-label">注册时间</label>
                <div class="info-value">{{ formatDate(user.created_at) }}</div>
              </div>
            </div>

            <div class="profile-actions">
              <Button
                variant="outline"
                @click="handleSettings"
              >
                设置
              </Button>
              <Button
                variant="outline"
                @click="handleLogout"
              >
                退出登录
              </Button>
              <Button
                variant="secondary"
                @click="handleDeleteAccount"
                :loading="deleting"
              >
                删除账号
              </Button>
            </div>
          </div>

          <div v-else class="error-container">
            <p class="error-text">无法加载用户信息</p>
            <Button variant="primary" @click="loadUserInfo">重试</Button>
          </div>
        </div>
      </Card>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import MainLayout from '@/components/layout/MainLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const deleting = ref(false)
const user = ref(authStore.user)

// 加载用户信息
const loadUserInfo = async () => {
  loading.value = true
  try {
    await authStore.loadUser()
    user.value = authStore.user
  } catch (error) {
    console.error('Failed to load user info:', error)
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 打开设置页面
const handleSettings = () => {
  router.push('/settings')
}

// 退出登录
const handleLogout = async () => {
  try {
    await authStore.logoutUser()
    router.push('/login')
  } catch (error) {
    console.error('Failed to logout:', error)
  }
}

// 删除账号
const handleDeleteAccount = async () => {
  if (!confirm('确定要删除账号吗？此操作不可恢复！')) {
    return
  }

  deleting.value = true
  try {
    await authStore.deleteCurrentUser()
    await authStore.logoutUser()
    router.push('/login')
  } catch (error: any) {
    console.error('Failed to delete account:', error)
    alert(error.response?.data?.message || '删除账号失败，请稍后重试')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  if (!user.value) {
    loadUserInfo()
  }
})
</script>

<style scoped>
.profile-view {
  min-height: 100%;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-content {
  padding: 2rem;
}

.profile-title {
  margin: 0 0 2rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #333333;
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

.loading-text {
  color: #a0a0a0;
  font-size: 1rem;
  margin: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #333;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #a0a0a0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 1.125rem;
  font-weight: 500;
  color: #ffffff;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-active {
  background: #1a2e1a;
  color: #86efac;
}

.status-inactive {
  background: #2e1a1a;
  color: #ff6b6b;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.error-container {
  text-align: center;
  padding: 3rem;
}

.error-text {
  margin: 0 0 1.5rem;
  color: #a0a0a0;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .profile-content {
    padding: 1.5rem;
  }

  .profile-actions {
    flex-direction: column;
  }
}
</style>

