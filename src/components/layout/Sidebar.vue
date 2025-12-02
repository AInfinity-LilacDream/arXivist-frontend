<template>
  <aside class="sidebar" :style="{ top: `${headerHeight}px`, height: `calc(100vh - ${headerHeight}px)` }">
    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="sidebar-item"
        :class="{ 'sidebar-item-active': $route.path === item.path || ($route.path.startsWith('/collections') && item.path === '/collections') }"
      >
        <span class="sidebar-icon">{{ item.icon }}</span>
        <span class="sidebar-label">{{ item.label }}</span>
      </router-link>
    </nav>
    <div v-if="authStore.isAuthenticated && authStore.user" class="sidebar-footer">
      <div class="sidebar-user-info">
        <span class="user-email">{{ authStore.user.email }}</span>
      </div>
      <button class="sidebar-logout" @click="handleLogout">
        <span class="sidebar-icon">→</span>
        <span class="sidebar-label">退出</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const headerHeight = ref(78)

const updateHeaderHeight = () => {
  const header = document.querySelector('.header') as HTMLElement
  if (header) {
    headerHeight.value = header.offsetHeight
  }
}

onMounted(() => {
  updateHeaderHeight()
  window.addEventListener('resize', updateHeaderHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateHeaderHeight)
})

const handleLogout = async () => {
  try {
    await authStore.logoutUser()
    router.push('/login')
  } catch (error) {
    console.error('Failed to logout:', error)
  }
}

const menuItems = computed(() => [
  {
    path: '/',
    label: '主页',
    icon: '◉'
  },
  {
    path: '/collections',
    label: '收藏',
    icon: '★'
  },
  {
    path: '/profile',
    label: '我的',
    icon: '○'
  }
])
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: #000000;
  position: fixed;
  left: 0;
  display: flex;
  flex-direction: column;
  z-index: 5;
}

.sidebar-nav {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  overflow-y: auto;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: #ffffff;
  text-decoration: none;
  transition: all 0.2s;
  font-size: 0.9375rem;
  font-weight: 500;
}

.sidebar-item:hover {
  background: #1a1a1a;
  color: #ffffff;
}

.sidebar-item-active {
  background: #1a1a1a;
  color: #ffffff;
  border-right: 3px solid #ffffff;
}

.sidebar-icon {
  font-size: 1.25rem;
  width: 1.5rem;
  text-align: center;
}

.sidebar-label {
  flex: 1;
}

.sidebar-footer {
  padding: 1.5rem 0;
  border-top: 1px solid #333333;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sidebar-user-info {
  padding: 0 1.5rem;
  padding-bottom: 0.5rem;
}

.user-email {
  font-size: 0.8125rem;
  color: #ffffff;
}

.sidebar-logout {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: #ffffff;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9375rem;
  font-weight: 500;
  text-align: left;
  width: 100%;
}

.sidebar-logout:hover {
  background: #1a1a1a;
  color: #ffffff;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
  
  .sidebar-item {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
  }
  
  .sidebar-icon {
    font-size: 1.125rem;
  }
}
</style>

