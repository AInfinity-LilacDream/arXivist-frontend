import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProfileView from '@/views/ProfileView.vue'
import CollectionsView from '@/views/CollectionsView.vue'
import CollectionDetailView from '@/views/CollectionDetailView.vue'
import PaperDetailView from '@/views/PaperDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/collections',
      name: 'collections',
      component: CollectionsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/collections/:id',
      name: 'collection-detail',
      component: CollectionDetailView,
      meta: { requiresAuth: true }
    },
    {
      path: '/papers/:arxiv_id',
      name: 'paper-detail',
      component: PaperDetailView,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫：检查token
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    // 需要认证的路由
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      // 没有token，跳转到登录页
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    // 有token，初始化认证状态（如果还没有）
    if (!authStore.accessToken) {
      authStore.initAuth()
    }

    // 检查用户信息是否已加载
    if (!authStore.user && authStore.accessToken) {
      try {
        await authStore.loadUser()
        next()
      } catch (error) {
        // 加载用户信息失败，清除token并跳转到登录页
        authStore.clearTokens()
        next({ name: 'login', query: { redirect: to.fullPath } })
      }
    } else {
      next()
    }
  } else {
    // 不需要认证的路由（登录/注册页）
    const token = localStorage.getItem('access_token')
    if (token) {
      // 如果有token，初始化认证状态
      if (!authStore.accessToken) {
        authStore.initAuth()
      }
      // 如果已认证，跳转到首页
      if (authStore.isAuthenticated) {
        next({ name: 'home' })
        return
      }
    }
    next()
  }
})

export default router
