<script setup lang="ts">
import { ref } from 'vue'
import { User, Lock, Type, ArrowLeft, Loader2, CheckCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import Verify from '~/components/verifition/Verify.vue'
import { useAuthStore } from '~/stores/auth'
import { authApi } from '~/api/auth'
import { useRouter } from 'vue-router'

definePageMeta({ layout: false })

const authStore = useAuthStore()
// ✨ 核心修复 1：调用 useRouter() 函数，获取真实的 router 实例！
const router = useRouter() 
// ✨ 1. 新增一个成功状态的标识
const isSuccess = ref(false)
const isLoading = ref(false)
const verifyRef = ref<any>(null)
const showCard = ref(true)

// ================= 极致丝滑的返回登录逻辑 =================
const handleBackToLogin = () => {
  // 1. 触发 v-motion 的 :leave 动画，卡片会带有阻尼感地平滑缩小并下沉消失
  showCard.value = false 
  
  // 2. 等待卡片动画执行完毕 (350ms)
  setTimeout(() => {
    // ✨ 核心修复 2：使用拿到的 router 实例进行跳转
    router.push('/')
    
    // 4. 延迟一点点打开登录弹窗，让用户视觉上有个连贯的“卡片翻转/替换”的错觉
    setTimeout(() => {
      authStore.openLoginModal()
    }, 100)
  }, 350) 
}

// 极简表单（不包含头像）
const registerForm = ref({
  nickname: '',
  username: '',
  password: '',
  confirmPassword: ''
})

const captchaToken = ref('')
const onCaptchaSuccess = (params: any) => {
  captchaToken.value = params.captchaVerification 
}

const handleRegister = async () => {
  // ================= 1. 前端注册失败提示 (校验未通过) =================
  if (!registerForm.value.username || !registerForm.value.nickname || !registerForm.value.password) {
    toast.warning('请填写完整的注册信息')
    return
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    toast.error('两次输入的密码不一致，请重新确认')
    return
  }
  if (!captchaToken.value) {
    toast.warning('请先拖动滑块完成安全验证')
    return
  }
  isLoading.value = true
  // 每次点击重置成功状态
  isSuccess.value = false
  
  // 2. 发起真实请求
  isLoading.value = true
  try {
    const payload = {
      username: registerForm.value.username,
      nickname: registerForm.value.nickname,
      password: registerForm.value.password,
      confirmPassword: registerForm.value.confirmPassword,
      captchaVerification: captchaToken.value 
    }

    await authApi.register(payload)
    // 1. 按钮状态瞬间切换为成功模式
    isSuccess.value = true
    // ================= 3. 注册成功提示与丝滑跳转 =================
    toast.success('🎉 注册成功，欢迎加入 VibeShare！')
    
    // 延迟一点点执行跳转，让用户看清“注册成功”的提示，并且感受按钮 Loading 结束
    setTimeout(() => {
      handleBackToLogin() 
    }, 1500)

  } catch (error: any) {
    // ================= 4. 后端注册失败提示 =================
    // 注意：拦截器已经弹出了“用户名已存在”或“验证码错误”的 toast.error
    // 这里我们只需要默默清空凭证，强制要求用户重滑防刷
    captchaToken.value = ''
    if (verifyRef.value && verifyRef.value.refresh) {
       verifyRef.value.refresh()
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-sunset-orange/20 to-sunset-rose/20 blur-3xl z-0 pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-500/10 blur-3xl z-0 pointer-events-none"></div>

    <div 
      v-if="showCard"
      v-motion
      :initial="{ opacity: 0, y: 30, scale: 0.98 }"
      :enter="{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 35, mass: 1.2 } }"
      :leave="{ opacity: 0, y: 40, scale: 0.95, transition: { type: 'spring', stiffness: 400, damping: 30, mass: 1 } }"
      class="relative z-10 w-full max-w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
    >
      <div class="absolute top-0 inset-x-0 h-28 bg-gradient-to-br from-slate-800 to-slate-950 z-0"></div>
      
      <button 
        @click="handleBackToLogin" 
        class="absolute top-4 left-4 z-20 p-2 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>

      <div class="relative z-10 px-8 pt-6 pb-8 flex flex-col mt-4">
        <div class="flex flex-col items-center mb-6">
          <h2 class="text-2xl font-bold text-slate-800">加入 VibeShare</h2>
          <p class="text-[14px] text-slate-500 mt-1">发现并分享更多精彩短视频</p>
        </div>

        <form class="space-y-3.5" @submit.prevent="handleRegister">
          <div class="relative flex items-center bg-slate-50 rounded-xl border border-slate-200 focus-within:border-slate-500 focus-within:bg-white transition-colors overflow-hidden">
            <div class="pl-4 pr-3 text-slate-400"><User class="w-5 h-5" /></div>
            <input v-model="registerForm.username" type="text" placeholder="设置登录账号 (英文或数字)" class="flex-1 h-12 bg-transparent text-[14.5px] outline-none text-slate-700 placeholder:text-slate-400" />
          </div>
          
          <div class="relative flex items-center bg-slate-50 rounded-xl border border-slate-200 focus-within:border-slate-500 focus-within:bg-white transition-colors overflow-hidden">
            <div class="pl-4 pr-3 text-slate-400"><Type class="w-5 h-5" /></div>
            <input v-model="registerForm.nickname" type="text" placeholder="设置你的平台昵称" class="flex-1 h-12 bg-transparent text-[14.5px] outline-none text-slate-700 placeholder:text-slate-400" />
          </div>

          <div class="relative flex items-center bg-slate-50 rounded-xl border border-slate-200 focus-within:border-slate-500 focus-within:bg-white transition-colors overflow-hidden">
            <div class="pl-4 pr-3 text-slate-400"><Lock class="w-5 h-5" /></div>
            <input v-model="registerForm.password" type="password" placeholder="设置登录密码" class="flex-1 h-12 bg-transparent text-[14.5px] outline-none text-slate-700 placeholder:text-slate-400" />
          </div>

          <div class="relative flex items-center bg-slate-50 rounded-xl border border-slate-200 focus-within:border-slate-500 focus-within:bg-white transition-colors overflow-hidden">
            <div class="pl-4 pr-3 text-slate-400"><Lock class="w-5 h-5" /></div>
            <input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码确认" class="flex-1 h-12 bg-transparent text-[14.5px] outline-none text-slate-700 placeholder:text-slate-400" />
          </div>

          <div class="w-full mt-2">
            <div v-show="!captchaToken" class="flex items-center justify-center overflow-hidden rounded-xl">
              <ClientOnly>
                <Verify
                  ref="verifyRef"
                  :captchaType="'blockPuzzle'"
                  :imgSize="{ width: '330px', height: '155px' }"
                  :mode="'fixed'" 
                  @success="onCaptchaSuccess"
                />
              </ClientOnly>
            </div>

            <div 
              v-if="captchaToken"
              v-motion
              :initial="{ opacity: 0, scale: 0.95 }"
              :enter="{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 25 } }"
              class="w-full h-12 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-emerald-600 shadow-inner"
            >
              <CheckCircle class="w-5 h-5" />
              <span class="text-[14.5px] font-medium">安全验证通过</span>
            </div>
          </div>

        <button 
            type="submit"
            :disabled="isLoading || isSuccess"
            :class="[
              'w-full h-12 rounded-xl font-medium text-[15.5px] mt-6 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg',
              isSuccess 
                ? 'bg-emerald-500 hover:bg-emerald-500 text-white shadow-emerald-500/30 ring-2 ring-emerald-500/50 ring-offset-2' 
                : 'bg-black hover:bg-slate-800 disabled:bg-slate-800 disabled:opacity-70 text-white shadow-black/20 active:scale-[0.98]'
            ]"
          >
            <CheckCircle v-if="isSuccess" class="w-5 h-5 animate-in zoom-in duration-300" />
            <Loader2 v-else-if="isLoading" class="w-5 h-5 animate-spin" />
            
            <span>
              {{ isSuccess ? '注册成功，正在跳转...' : (isLoading ? '注册中...' : '立即注册') }}
            </span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <button @click="handleBackToLogin" class="text-[14px] text-slate-500 hover:text-slate-800 font-medium transition-colors">
            已有账号？<span class="underline underline-offset-4 text-slate-900 font-bold">返回登录</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>