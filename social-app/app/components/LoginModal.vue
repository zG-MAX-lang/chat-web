<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { X, ArrowRight, User, Lock, RefreshCw } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import Verify from './verifition/Verify.vue'

const authStore = useAuthStore()
const { isLoginModalOpen, refreshToken, savedUserInfo } = storeToRefs(authStore)

const viewMode = ref<'quick' | 'full'>(refreshToken.value && savedUserInfo.value ? 'quick' : 'full')
const isLoading = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const verifyRef = ref<any>(null)

const goToRegister = () => {
  authStore.closeLoginModal()
  navigateTo('/register')
}

const handlePreLogin = () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    toast.warning('请输入用户名和密码')
    return
  }
  verifyRef.value?.show?.()
}

const onCaptchaSuccess = async (params: any) => {
  isLoading.value = true
  try {
    await authStore.loginWithPassword({
      username: loginForm.value.username,
      password: loginForm.value.password,
      captchaVerification: params.captchaVerification
    })

    toast.success('登录成功，欢迎回来')
    loginForm.value = { username: '', password: '' }
    authStore.closeLoginModal()
    viewMode.value = 'quick'
  } catch (error: any) {
    toast.error(error?.message || '用户名或密码验证失败')
  } finally {
    isLoading.value = false
  }
}

const handleQuickLogin = async () => {
  isLoading.value = true
  try {
    await authStore.refreshAccessToken()
    toast.success('验证成功')
    authStore.closeLoginModal()
  } catch {
    toast.error('登录状态已过期，请重新登录')
    viewMode.value = 'full'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <transition name="fade">
    <div
      v-if="isLoginModalOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      @click.self="authStore.closeLoginModal()"
    >
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.96, y: 30 }"
        :enter="{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 35, mass: 1.2 } }"
        class="relative w-[90%] max-w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div class="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-sunset-orange/10 to-sunset-rose/10 z-0" />

        <button
          class="absolute top-4 right-4 z-20 p-2 bg-white/50 hover:bg-white/80 backdrop-blur-md rounded-full text-slate-500 hover:text-slate-900 transition-colors"
          @click="authStore.closeLoginModal()"
        >
          <X class="w-5 h-5" />
        </button>

        <div v-if="viewMode === 'quick'" class="relative z-10 px-8 pt-12 pb-8 flex flex-col items-center">
          <div class="w-20 h-20 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden mb-4">
            <img :src="savedUserInfo?.avatar || 'https://api.dicebear.com/7.x/notionists/svg?seed=Default'" class="w-full h-full object-cover">
          </div>
          <h2 class="text-xl font-bold text-slate-800">欢迎回来，{{ savedUserInfo?.nickName || '用户' }}</h2>
          <p class="text-[14px] text-slate-500 mt-1.5">需要快速登录吗？</p>

          <button
            class="w-full h-12 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white rounded-xl font-medium text-[15px] mt-8 transition active:scale-[0.98] flex items-center justify-center gap-2"
            :disabled="isLoading"
            @click="handleQuickLogin"
          >
            <RefreshCw v-if="isLoading" class="w-5 h-5 animate-spin" />
            <span>{{ isLoading ? '验证中...' : '一键登录' }}</span>
            <ArrowRight v-if="!isLoading" class="w-4 h-4" />
          </button>

          <button class="mt-5 text-[14px] text-slate-400 hover:text-slate-600 font-medium transition-colors" @click="viewMode = 'full'">
            使用其他账号登录
          </button>
        </div>

        <div v-else class="relative z-10 px-8 pt-10 pb-8 flex flex-col">
          <div class="flex flex-col items-center mb-8">
            <h2 class="text-2xl font-bold text-slate-800">登录 VibeShare</h2>
            <p class="text-[14px] text-slate-500 mt-1.5">发现并分享更多有趣的短视频</p>
          </div>

          <form class="space-y-4" @submit.prevent="handlePreLogin">
            <div class="relative flex items-center bg-slate-50 rounded-xl border border-slate-200 focus-within:border-amber-500 focus-within:bg-white transition-colors overflow-hidden">
              <div class="pl-4 pr-3 text-slate-400"><User class="w-5 h-5" /></div>
              <input v-model="loginForm.username" type="text" placeholder="请输入用户名" class="flex-1 h-12 bg-transparent text-[15px] outline-none text-slate-700 placeholder:text-slate-400">
            </div>

            <div class="relative flex items-center bg-slate-50 rounded-xl border border-slate-200 focus-within:border-amber-500 focus-within:bg-white transition-colors overflow-hidden">
              <div class="pl-4 pr-3 text-slate-400"><Lock class="w-5 h-5" /></div>
              <input v-model="loginForm.password" type="password" placeholder="请输入密码" class="flex-1 h-12 bg-transparent text-[15px] outline-none text-slate-700 placeholder:text-slate-400">
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full h-12 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white rounded-xl font-medium text-[15px] mt-6 transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <RefreshCw v-if="isLoading" class="w-5 h-5 animate-spin" />
              <span>{{ isLoading ? '登录中...' : '安全登录' }}</span>
            </button>
          </form>

          <div class="mt-5 flex items-center justify-between text-[14px] font-medium px-1">
            <button
              v-if="savedUserInfo && refreshToken"
              class="text-amber-600 hover:text-amber-700 transition-colors"
              @click="viewMode = 'quick'"
            >
              返回快速登录？
            </button>
            <span v-else />
            <button class="text-slate-500 hover:text-slate-800 transition-colors" @click="goToRegister">
              没有账号？<span class="text-slate-900 underline underline-offset-4 font-bold">立即注册</span>
            </button>
          </div>

          <div>
          </div>
       
        </div>
      </div>
         <ClientOnly>
        <Verify
          ref="verifyRef"
          :captchaType="'blockPuzzle'"
          :imgSize="{ width: '330px', height: '155px' }"
          @success="onCaptchaSuccess"
        />
      </ClientOnly>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>