<script setup lang="ts">
import { ref } from 'vue'
import { User, Lock, RefreshCw, Type, ArrowLeft, Camera, Loader2 ,CheckCircle} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import Verify from '~/components/verifition/Verify.vue'
import { useAuthStore } from '~/stores/auth'

// ✨ 禁用全局默认布局，彻底隐藏导航栏和侧边栏
definePageMeta({
  layout: false
})

const authStore = useAuthStore()
const isLoading = ref(false)
const verifyRef = ref<any>(null)
const showCard = ref(true)

// ================= 极致丝滑的返回登录逻辑 =================
const handleBackToLogin = () => {
  showCard.value = false // 触发 v-motion 的 :leave 阻尼动画
  
  setTimeout(() => {
    navigateTo('/')
    setTimeout(() => {
      authStore.openLoginModal()
    }, 100)
  }, 350)
}

// 注册表单数据
const registerForm = ref({
  avatar: '', 
  nickname: '',
  username: '',
  password: '',
  confirmPassword: ''
})

// ================= 头像上传核心逻辑 =================
const fileInputRef = ref<HTMLInputElement | null>(null)
const isUploadingAvatar = ref(false)
const defaultAvatar = 'https://api.dicebear.com/7.x/notionists/svg?seed=default_vibe'
const previewAvatar = ref(defaultAvatar)

const triggerUpload = () => {
  if (isUploadingAvatar.value) return 
  fileInputRef.value?.click()
}

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    toast.error('仅支持 JPG, PNG, WEBP, GIF 格式图片')
    target.value = '' 
    return
  }
  if (file.size > 2 * 1024 * 1024) { 
    toast.error('头像大小不能超过 2MB')
    target.value = ''
    return
  }

  previewAvatar.value = URL.createObjectURL(file)
  isUploadingAvatar.value = true

  try {
    const formData = new FormData()
    formData.append('file', file)

    // TODO: 替换为真实接口
    await new Promise(resolve => setTimeout(resolve, 1500))
    const mockOssUrl = `https://vibe-share-oss.aliyuncs.com/avatars/${Date.now()}.png`
    const res = { code: 200, data: { url: mockOssUrl } }

    if (res.code === 200) {
      registerForm.value.avatar = res.data.url 
      toast.success('头像上传成功')
    } else {
      throw new Error('上传失败')
    }
  } catch (error: any) {
    console.error('头像上传异常:', error)
    toast.error('头像上传失败，请稍后重试')
    previewAvatar.value = defaultAvatar 
    registerForm.value.avatar = ''
  } finally {
    isUploadingAvatar.value = false
    target.value = '' 
  }
}

// ================= 注册业务与滑块逻辑 =================

// ✨ 新增：用于暂存滑动成功后拿到的通行证
const captchaToken = ref('')

const onCaptchaSuccess = (params: any) => {
  captchaToken.value = params.captchaVerification // 只存凭证，不发请求
}

const handleRegister = async () => {
  // 1. 前置校验
  if (!registerForm.value.username || !registerForm.value.nickname || !registerForm.value.password) {
    toast.warning('请填写完整的注册信息')
    return
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    toast.error('两次输入的密码不一致，请重新确认')
    return
  }
  if (isUploadingAvatar.value) {
    toast.warning('头像正在上传中，请稍候')
    return
  }
  if (!captchaToken.value) {
    toast.warning('请先拖动滑块完成安全验证')
    return
  }
  
  // 2. 发起真实注册请求
  isLoading.value = true
  try {
    const payload = {
      username: registerForm.value.username,
      nickname: registerForm.value.nickname,
      password: registerForm.value.password,
      avatar: registerForm.value.avatar || defaultAvatar, 
      code: captchaToken.value // 携带滑块凭证
    }

    // TODO: 替换为真实接口
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.success('🎉 注册成功，快去登录吧！')
    
    // ✨ 注册成功后，自动触发带阻尼感的返回动画
    handleBackToLogin() 
  } catch (error: any) {
    console.error('注册异常:', error)
    toast.error(error.message || '注册失败，账号可能已存在')
    
    // ✨ 核心防御：注册失败必须清空验证码，强制要求重新滑动
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
          <input 
            type="file" 
            ref="fileInputRef" 
            class="hidden" 
            accept="image/jpeg, image/png, image/webp, image/gif" 
            @change="onFileChange" 
          />
          <div 
            class="relative w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg mb-3 cursor-pointer group overflow-hidden" 
            @click="triggerUpload" 
            title="点击上传头像"
          >
            <img :src="previewAvatar" class="w-full h-full object-cover transition-opacity duration-300" :class="{'opacity-50': isUploadingAvatar}" />
            
            <div 
              class="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200"
              :class="isUploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
            >
               <Loader2 v-if="isUploadingAvatar" class="w-6 h-6 text-white animate-spin" />
               <Camera v-else class="w-6 h-6 text-white" />
            </div>
          </div>
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
            :disabled="isLoading || isUploadingAvatar"
            class="w-full h-12 bg-black hover:bg-slate-800 disabled:bg-slate-800 disabled:opacity-70 text-white rounded-xl font-medium text-[15.5px] mt-6 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-black/20"
          >
            <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
            <span>{{ isLoading ? '注册中...' : '立即注册' }}</span>
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