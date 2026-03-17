<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { User, History, ThumbsUp, Clock3, Star } from 'lucide-vue-next'
import defaultAvatarImg from '~/assets/user-default.png'

const authStore = useAuthStore()
const baseURL = 'http://localhost:8089'

const userAvatar = computed(() => {
  const userInfo = authStore.savedUserInfo
  if (userInfo?.isDefaultAvatar) return defaultAvatarImg

  const avatar = userInfo?.avatar
  if (!avatar) return defaultAvatarImg
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar

  return `${baseURL}${avatar.startsWith('/') ? avatar : `/${avatar}`}`
})

const userInfo = computed(() => ({
  nickName: authStore.savedUserInfo?.nickName || '未命名用户',
  chatId: authStore.savedUserInfo?.chatId || '0'
}))

const navItems = [
  { icon: User, label: '个人主页', link: '/profile' },
  { icon: History, label: '观看历史', link: '/history' },
  { icon: ThumbsUp, label: '点赞视频', link: '/liked' },
  { icon: Clock3, label: '稍后再看', link: '/watch-later' },
  { icon: Star, label: '我的收藏', link: '/favorites' }
]

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = defaultAvatarImg
}

const handleLogout = () => {
  authStore.logout()
  navigateTo('/')
}
</script>

<template>
  <div class="relative group inline-block z-50">
    <NuxtLink to="/profile" class="cursor-pointer py-2 block" title="进入个人主页">
      <img
        :src="userAvatar"
        @error.once="handleImageError"
        alt="用户头像"
        class="w-10 h-10 rounded-full object-cover border border-gray-200 transition-transform duration-300 group-hover:scale-110 bg-white"
      >
    </NuxtLink>

    <div class="absolute right-0 top-full pt-2 w-[280px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 origin-top-right">
      <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden text-gray-800 flex flex-col">
        <NuxtLink to="/profile" class="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100">
          <img :src="userAvatar" @error.once="handleImageError" class="w-11 h-11 rounded-full object-cover border border-gray-100">
          <div class="flex-1 overflow-hidden">
            <h3 class="font-bold text-base truncate">{{ userInfo.nickName }}</h3>
            <p class="text-xs text-gray-500 mt-1">ID: {{ userInfo.chatId }}</p>
          </div>
          <span class="text-sm font-medium text-blue-600">个人中心</span>
        </NuxtLink>

        <main class="p-3 flex flex-col gap-1.5">
          <NuxtLink
            v-for="item in navItems"
            :key="item.link"
            :to="item.link"
            class="rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <span class="font-medium flex items-center gap-2">
              <component :is="item.icon" class="w-4 h-4" />
              {{ item.label }}
            </span>
            <span class="text-gray-400">></span>
          </NuxtLink>
        </main>

        <div class="border-t border-gray-100 p-3">
          <button class="w-full rounded-xl px-3 py-2.5 text-left hover:bg-red-50 text-red-500 font-medium transition-colors" @click="handleLogout">
            退出登录
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
