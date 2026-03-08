<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { X, ArrowRight, User, Lock, RefreshCw } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import Verify from './verifition/Verify.vue'

const authStore = useAuthStore()
const { isLoginModalOpen, refreshToken, savedUserInfo } = storeToRefs(authStore)

const viewMode = ref<'quick' | 'full'>(
  (refreshToken.value && savedUserInfo.value) ? 'quick' : 'full'
)

const isLoading = ref(false)

// 完整登录表单数据 (移除了旧版 captcha)
const loginForm = ref({
  username: '',
  password: '',

})

// ================= 滑块验证码核心逻辑 =================
const verifyRef = ref<any>(null)
// 添加路由跳转方法
const goToRegister = () => {
  authStore.closeLoginModal() // 先关闭现有的登录弹窗
  navigateTo('/register')     // 跳转到新页面
}
// 1. 点击登录按钮：先校验基础表单，然后呼出滑块
const handlePreLogin = () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    toast.warning('请输入完整的账号和密码')
    return
  }
  // 唤起 AJ-Captcha 滑块验证码弹窗
  verifyRef.value.show()
}

// 2. 滑动成功回调：携带加密凭证发起真正的登录请求
const onCaptchaSuccess = async (params: any) => {
  isLoading.value = true
  try {
    // 调用 Pinia 中的登录 Action，带上后端要求的 captchaVerification
    await authStore.loginWithPassword({
      username: loginForm.value.username,
      password: loginForm.value.password,
      captchaVerification: params.captchaVerification 
    })
    
    toast.success('登录成功，欢迎回来！')
    loginForm.value = { username: '', password: '' } // 清空表单
    authStore.closeLoginModal()
    
    // 为下一次打开准备好快捷模式
    viewMode.value = 'quick'
  } catch (error: any) {
    console.error('登录失败:', error)
    // 捕获后端的 CustomAuthException (比如 4001, 4002 等错误)
    toast.error(error.message || '账号密码错误或验证码过期')
  } finally {
    isLoading.value = false
  }
}

// ================= 快捷登录交互逻辑 =================
const handleQuickLogin = async () => {
  isLoading.value = true
  try {
    await authStore.refreshAccessToken()
    toast.success('验证成功，继续畅享内容吧！')
    authStore.closeLoginModal()
  } catch (error) {
    console.error('快捷登录失效或已过期:', error)
    toast.error('登录状态已过期，请重新验证身份')
    viewMode.value = 'full'
  } finally {
    isLoading.value = false
  }
}

const switchToFull = () => {
  viewMode.value = 'full'
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
        class="relative w-[90%] max-w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300"
      >
        <div class="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-sunset-orange/10 to-sunset-rose/10 z-0"></div>

        <button 
          @click="authStore.closeLoginModal()"
          class="absolute top-4 right-4 z-20 p-2 bg-white/50 hover:bg-white/80 backdrop-blur-md rounded-full text-slate-500 hover:text-slate-900 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>

        <div v-if="viewMode === 'quick'" class="relative z-10 px-8 pt-12 pb-8 flex flex-col items-center">
          <div class="w-20 h-20 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden mb-4">
            <img :src="savedUserInfo?.avatar || 'https://api.dicebear.com/7.x/notionists/svg?seed=Default'" class="w-full h-full object-cover" />
          </div>
          <h2 class="text-xl font-bold text-slate-800">欢迎回来，{{ savedUserInfo?.nickname || '用户' }}</h2>
          <p class="text-[14px] text-slate-500 mt-1.5">点击继续即可畅享精彩内容</p>

          <button 
            @click="handleQuickLogin"
            :disabled="isLoading"
            class="w-full h-12 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white rounded-xl font-medium text-[15.5px] mt-8 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-slate-900/20"
          >
            <RefreshCw v-if="isLoading" class="w-5 h-5 animate-spin" />
            <span>{{ isLoading ? '验证中...' : '一键继续' }}</span>
            <ArrowRight v-if="!isLoading" class="w-4 h-4" />
          </button>

          <button @click="switchToFull" class="mt-5 text-[14px] text-slate-400 hover:text-slate-600 font-medium transition-colors">
            使用其他账号登录
          </button>
        </div>

        <div v-else class="relative z-10 px-8 pt-10 pb-8 flex flex-col">
          <div class="flex flex-col items-center mb-8">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-sunset-orange to-sunset-rose flex items-center justify-center shadow-lg mb-4">
              <img src="https://api.dicebear.com/7.x/shapes/svg?seed=VibeShare&backgroundColor=transparent" class="w-8 h-8 filter invert" />
            </div>
            <h2 class="text-2xl font-bold text-slate-800">登录 VibeShare</h2>
            <p class="text-[14px] text-slate-500 mt-1.5">发现更多精彩有趣的短视频</p>
          </div>

          <form class="space-y-4" @submit.prevent="handlePreLogin">
            <div class="relative flex items-center bg-slate-50 rounded-xl border border-slate-200 focus-within:border-amber-500 focus-within:bg-white transition-colors overflow-hidden">
              <div class="pl-4 pr-3 text-slate-400"><User class="w-5 h-5" /></div>
              <input v-model="loginForm.username" type="text" placeholder="请输入用户名" class="flex-1 h-12 bg-transparent text-[15px] outline-none text-slate-700 placeholder:text-slate-400" />
            </div>

            <div class="relative flex items-center bg-slate-50 rounded-xl border border-slate-200 focus-within:border-amber-500 focus-within:bg-white transition-colors overflow-hidden">
              <div class="pl-4 pr-3 text-slate-400"><Lock class="w-5 h-5" /></div>
              <input v-model="loginForm.password" type="password" placeholder="请输入密码" class="flex-1 h-12 bg-transparent text-[15px] outline-none text-slate-700 placeholder:text-slate-400" />
            </div>

            <button 
              type="submit"
              :disabled="isLoading"
              class="w-full h-12 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white rounded-xl font-medium text-[15.5px] mt-8 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-slate-900/20"
            >
              <RefreshCw v-if="isLoading" class="w-5 h-5 animate-spin" />
              <span>{{ isLoading ? '登录中...' : '安全登录' }}</span>
            </button>
          </form>
          
          <div v-if="savedUserInfo && refreshToken" class="mt-5 text-center">
            <button @click="viewMode = 'quick'" class="text-[14px] text-amber-600 hover:text-amber-700 font-medium transition-colors">
              返回快捷登录
            </button>
          </div>
          <div class="mt-5 flex items-center justify-between text-[14px] font-medium px-1">
  <button 
    v-if="savedUserInfo && refreshToken" 
    @click="viewMode = 'quick'" 
    class="text-amber-600 hover:text-amber-700 transition-colors"
  >
    返回快捷登录
  </button>
  <span v-else></span> <button 
    @click="goToRegister" 
    class="text-slate-500 hover:text-slate-800 transition-colors"
  >
    没有账号？<span class="text-slate-900 underline underline-offset-4 font-bold">立即注册</span>
  </button>
</div>
        </div>
      </div
      class="flex items-center justify-center w-full mt-2 overflow-hidden rounded-xl transition-opacity duration-300"
  :class="{ 'pointer-events-none opacity-90': captchaToken }">
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
.fade-enter-active, .fade-leave-active { 
  transition: opacity 0.35s ease; 
}
.fade-enter-from, .fade-leave-to { 
  opacity: 0; 
}
</style>