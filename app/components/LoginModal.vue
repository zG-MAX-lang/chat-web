<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { X, ArrowRight, User, Lock, ShieldCheck, RefreshCw } from 'lucide-vue-next'
import { toast } from 'vue-sonner' // ✨ 引入丝滑提示库

const authStore = useAuthStore()
// 从 Pinia 解构状态，保持响应式
const { isLoginModalOpen, refreshToken, savedUserInfo } = storeToRefs(authStore)

// 控制视图模式：'quick' (快捷登录) | 'full' (完整表单)
const viewMode = ref<'quick' | 'full'>(
  (refreshToken.value && savedUserInfo.value) ? 'quick' : 'full'
)

const isLoading = ref(false)

// 完整登录表单数据
const loginForm = ref({
  username: '',
  password: '',
  captcha: ''
})

// ================= 图形验证码逻辑 =================
const captchaImageUrl = ref('')
const fetchCaptcha = () => {
  // TODO: 后续替换为真实的后端验证码接口，这里加上时间戳防止浏览器缓存图片
  captchaImageUrl.value = `https://api.dicebear.com/7.x/identicon/svg?seed=${Date.now()}`
}

// 当弹窗打开时，如果是完整表单模式，自动获取一次验证码
watch(isLoginModalOpen, (isOpen) => {
  if (isOpen && viewMode.value === 'full') {
    fetchCaptcha()
  }
})

// ================= 交互逻辑 =================

// 1. 完整表单登录 (账号+密码+验证码)
const handleFullLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password || !loginForm.value.captcha) {
    toast.warning('请填写完整的登录信息') // ✨ 替换生硬的 alert
    return
  }

  isLoading.value = true
  try {
    await authStore.loginWithPassword({
      username: loginForm.value.username,
      password: loginForm.value.password,
      captcha: loginForm.value.captcha
    })
    
    toast.success('登录成功，欢迎回来！')
    loginForm.value = { username: '', password: '', captcha: '' } // 清空表单
    authStore.closeLoginModal()
    
    // 为下一次打开准备好快捷模式
    viewMode.value = 'quick'
  } catch (error: any) {
    console.error('登录失败:', error)
    toast.error(error.message || '账号密码或验证码错误')
    fetchCaptcha() // 登录失败，强制刷新验证码
  } finally {
    isLoading.value = false
  }
}

// 2. 快捷一键登录 (无感刷新 Token)
const handleQuickLogin = async () => {
  isLoading.value = true
  try {
    await authStore.refreshAccessToken()
    toast.success('验证成功，继续畅享内容吧！')
    authStore.closeLoginModal()
  } catch (error) {
    console.error('快捷登录失效或已过期:', error)
    toast.error('登录状态已过期，请重新验证身份')
    
    // 核心：失效后强制切回完整表单，并拉取验证码
    viewMode.value = 'full'
    fetchCaptcha()
  } finally {
    isLoading.value = false
  }
}

// 3. 手动切换账号
const switchToFull = () => {
  viewMode.value = 'full'
  fetchCaptcha()
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
        :initial="{ opacity: 0, scale: 0.95, y: 20 }"
        :enter="{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }"
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

          <div class="space-y-4">
            <div class="relative flex items-center bg-slate-50 rounded-xl border border-slate-200 focus-within:border-amber-500 focus-within:bg-white transition-colors overflow-hidden">
              <div class="pl-4 pr-3 text-slate-400"><User class="w-5 h-5" /></div>
              <input v-model="loginForm.username" type="text" placeholder="请输入用户名" class="flex-1 h-12 bg-transparent text-[15px] outline-none text-slate-700 placeholder:text-slate-400" />
            </div>

            <div class="relative flex items-center bg-slate-50 rounded-xl border border-slate-200 focus-within:border-amber-500 focus-within:bg-white transition-colors overflow-hidden">
              <div class="pl-4 pr-3 text-slate-400"><Lock class="w-5 h-5" /></div>
              <input v-model="loginForm.password" type="password" placeholder="请输入密码" class="flex-1 h-12 bg-transparent text-[15px] outline-none text-slate-700 placeholder:text-slate-400" @keyup.enter="handleFullLogin" />
            </div>

            <div class="flex items-center gap-3">
              <div class="relative flex-1 flex items-center bg-slate-50 rounded-xl border border-slate-200 focus-within:border-amber-500 focus-within:bg-white transition-colors overflow-hidden">
                <div class="pl-4 pr-3 text-slate-400"><ShieldCheck class="w-5 h-5" /></div>
                <input v-model="loginForm.captcha" type="text" placeholder="验证码" class="w-full h-12 bg-transparent text-[15px] outline-none text-slate-700 placeholder:text-slate-400" @keyup.enter="handleFullLogin" />
              </div>
              <div @click="fetchCaptcha" class="w-[110px] h-12 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group" title="点击刷新">
                <img v-if="captchaImageUrl" :src="captchaImageUrl" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <RefreshCw class="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>

          <button 
            @click="handleFullLogin"
            :disabled="isLoading"
            class="w-full h-12 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white rounded-xl font-medium text-[15.5px] mt-8 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-slate-900/20"
          >
            <RefreshCw v-if="isLoading" class="w-5 h-5 animate-spin" />
            <span>{{ isLoading ? '验证中...' : '安全登录' }}</span>
          </button>
          
          <div v-if="savedUserInfo && refreshToken" class="mt-5 text-center">
            <button @click="viewMode = 'quick'" class="text-[14px] text-amber-600 hover:text-amber-700 font-medium transition-colors">
              返回快捷登录
            </button>
          </div>
        </div>

      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
/* ✨ 这里修复了之前漏掉的 fade- 前缀 */
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>