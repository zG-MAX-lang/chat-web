// composables/useAuthGuard.ts
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

export const useAuthGuard = () => {
  const authStore = useAuthStore()
  const { isLoggedIn } = storeToRefs(authStore)

  /**
   * 鉴权切面函数：包裹任何需要登录的动作
   * @param action 登录后允许执行的实际回调
   */
  const withAuth = (action: Function) => {
    if (authStore.isLoggedIn) {
      action() // 已登录，直接放行
    } else {
      authStore.openLoginModal() // 未登录，拦截并弹窗
    }
  }

  return {
    isLoggedIn,
    withAuth
  }
}