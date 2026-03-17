// middleware/auth.ts
import { useAuthStore } from '~/stores/auth'
import { toast } from 'vue-sonner' // ✨ 引入我们的高颜值提示库

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // 这里的 authStore.isLoggedIn 底层依赖 useCookie，所以在服务端和客户端都能准确读取
  if (!authStore.isLoggedIn) {
    
    // ================= 客户端拦截逻辑 =================
    if (import.meta.client) {
      toast.warning('请先验证身份后再访问该页面') // 弹出友好的提示
      authStore.openLoginModal() // 唤起登录弹窗（由于有 Refresh Token，可能会直接展示快捷登录）
      return abortNavigation() // 留在当前页面
    }

    // ================= 服务端拦截逻辑 =================
    // 如果用户直接通过 URL 访问受保护的路由 (如 /following)，此时是 SSR 阶段
    // 服务端无法“弹出弹窗”，最安全的做法是重定向回首页，防止页面崩溃或越权渲染
    return navigateTo('/')
  }
})