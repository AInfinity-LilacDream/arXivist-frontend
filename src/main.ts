import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import { useAuthStore } from './store/auth'
import './styles/reset.css'
import './styles/global.css'

const app = createApp(App)

app.use(pinia)
app.use(router)

// 初始化认证状态
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')
