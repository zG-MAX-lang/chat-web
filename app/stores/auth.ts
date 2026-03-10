// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '~/api/auth'
// Nuxt 3 自动导入了 useCookie，这里不需要单独 import
export const useAuthStore = defineStore('auth', () => {
  // ================= 1. UI 状态 =================
  const isLoginModalOpen = ref(false)

  // ================= 2. 核心认证与用户信息持久化 =================
  // 使用 useCookie 存储双 Token，设置合适的过期时间以匹配后端
  const accessToken = useCookie('access_token', { maxAge: 60 * 60 * 2 }) // 对应后端 2 小时
  const refreshToken = useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 7 }) // 对应后端 7 天
  
  // 核心：保存用户的非敏感基础信息（头像、昵称），专供“快捷登录”页面回显使用
  const savedUserInfo = useCookie<{ nickname: string, avatar: string } | null>('saved_user_info', { maxAge: 60 * 60 * 24 * 7 }) 

  // 派生状态：判断当前是否处于登录状态 (动态计算)
  const isLoggedIn = computed(() => !!accessToken.value)

  // ================= 3. 弹窗控制 =================
  const openLoginModal = () => {
    isLoginModalOpen.value = true
  }
  
  const closeLoginModal = () => {
    isLoginModalOpen.value = false
  }

  // ================= 4. 完整表单登录 (账号+密码+验证码) =================
  const loginWithPassword = async (payload: { username: string, password: string, captchaVerification: string }) => {
    try {
      // TODO: 替换为真实的后端 API 请求
      const res =await authApi.login(payload)
      accessToken.value=res.data.accessToken
      refreshToken.value=res.data.refreshToken
      // const res = await $fetch('/api/admin/account/login', { method: 'POST', body: payload })
      savedUserInfo.value = {
        nickname: res.data.userInfo.nickname,
        avatar: res.data.userInfo.avatar
      }
      return Promise.resolve(true)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // ================= 5. 快捷登录 (无感刷新 Token) =================
  const refreshAccessToken = async () => {
    // 如果连 Refresh Token 都没了，直接判定失效
    if (!refreshToken.value) {
      return Promise.reject(new Error('Refresh Token 不存在'))
    }

  const refreshAccessToken = async () => {
    if (!refreshToken.value) return Promise.reject(new Error('Refresh Token 不存在'))

    try {
      // ✨ 极简调用
      const res = await authApi.refresh(refreshToken.value)
      
      accessToken.value = res.data.accessToken
      if (res.data.refreshToken) {
        refreshToken.value = res.data.refreshToken
      }
      return Promise.resolve(true)
    } catch (error) {
      accessToken.value = null
      refreshToken.value = null
      return Promise.reject(error)
    }
  }
      

  }

  // ================= 6. 登出动作 =================
  const logout = () => {
    accessToken.value = null
    refreshToken.value = null
    // 登出通常也不需要清理 savedUserInfo，以便下次还能快捷登录
    // 但如果你需要彻底清除痕迹（比如切换账号功能），可以加上 savedUserInfo.value = null
  }

  return {
    // 状态
    isLoginModalOpen,
    accessToken,
    refreshToken,
    savedUserInfo,
    isLoggedIn,
    // 动作
    openLoginModal,
    closeLoginModal,
    loginWithPassword,
    refreshAccessToken,
    logout
  }
})