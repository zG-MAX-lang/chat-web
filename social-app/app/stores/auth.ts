import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '~/api/auth'

export interface UserInfo {
  nickName: string
  avatar: string
  isDefaultAvatar: boolean
  chatId: string
  sex: number
  areaName: string
  areaCode: string
  personSignature: string
}

const defaultUserInfo = (): UserInfo => ({
  nickName: '�û�',
  avatar: '',
  isDefaultAvatar: true,
  chatId: '0',
  sex: 0,
  areaName: '',
  areaCode: '',
  personSignature: ''
})

export const useAuthStore = defineStore('auth', () => {
  const isLoginModalOpen = ref(false)

  const cookieOptions = {
    sameSite: 'lax' as const,
    secure: import.meta.env.PROD
  }

  const accessToken = useCookie<string | null>('access_token', {
    maxAge: 60 * 60 * 2,
    ...cookieOptions
  })

  const refreshToken = useCookie<string | null>('refresh_token', {
    maxAge: 60 * 60 * 24 * 7,
    ...cookieOptions
  })

  const savedUserInfo = useCookie<UserInfo | null>('saved_user_info', {
    maxAge: 60 * 60 * 24 * 7,
    ...cookieOptions
  })

  const isLoggedIn = computed(() => Boolean(accessToken.value))

  const openLoginModal = () => {
    isLoginModalOpen.value = true
  }

  const closeLoginModal = () => {
    isLoginModalOpen.value = false
  }

  const loginWithPassword = async (payload: {
    username: string
    password: string
    captchaVerification: string
  }) => {
    const res = await authApi.login(payload)
    const data = res.data || {}

    accessToken.value = data.accessToken || data.token || null
    refreshToken.value = data.refreshToken || refreshToken.value

    const next = defaultUserInfo()
    next.nickName = data.userInfo?.nickName || data.userInfo?.nickname || data.nickName || data.nickName || next.nickName
    next.avatar = data.userInfo?.avatar || data.avatar || next.avatar
    next.isDefaultAvatar = data.userInfo?.isDefaultAvatar ?? data.isDefaultAvatar ?? next.isDefaultAvatar
    next.chatId = String(data.userInfo?.chatId || data.chatId || next.chatId)
    next.sex = Number(data.userInfo?.sex ?? data.sex ?? next.sex)
    next.areaName = data.userInfo?.areaName || data.areaName || next.areaName
    next.areaCode = data.userInfo?.areaCode || data.areaCode || next.areaCode
    next.personSignature = data.userInfo?.personSignature || data.personSignature || next.personSignature

    savedUserInfo.value = next
    return true
  }

  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      throw new Error('Refresh token ������')
    }

    const res = await authApi.refresh(refreshToken.value)
    const data = res.data || {}
    accessToken.value = data.accessToken || data.token || null

    if (data.refreshToken) {
      refreshToken.value = data.refreshToken
    }

    return true
  }

  const updateProfile = async (updateData: Partial<UserInfo>) => {
    const res = await authApi.updateUserInfo(updateData)
    const current = savedUserInfo.value || defaultUserInfo()
    savedUserInfo.value = {
      ...current,
      ...(res.data || updateData)
    }
    return res
  }

  const clearAuthData = () => {
    accessToken.value = null
    refreshToken.value = null
    savedUserInfo.value = null
  }

  const logout = () => {
    clearAuthData()
  }

  return {
    isLoginModalOpen,
    accessToken,
    refreshToken,
    savedUserInfo,
    isLoggedIn,
    openLoginModal,
    closeLoginModal,
    loginWithPassword,
    refreshAccessToken,
    updateProfile,
    clearAuthData,
    logout
  }
})
