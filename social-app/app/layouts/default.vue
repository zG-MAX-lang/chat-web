<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  Search,
  Bell,
  MessageCircle,
  Plus,
  Home,
  Sparkles,
  User,
  Play,
  Menu,
  ChevronDown,
  History,
  ThumbsUp,
  Clock,
  Bookmark,
  UserCheck,
  Users
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)

const isSidebarExpanded = ref(true)
const isMyMenuExpanded = ref(false)

// 修复：主导航菜单中文
const mainNavItems = [
  { name: '首页', icon: Home, path: '/' },
  { name: '推荐', icon: Sparkles, path: '/recommend' },
  { name: '关注', icon: UserCheck, path: '/following' },
  { name: '好友', icon: Users, path: '/friends' }
]

// 修复：“我的”子菜单中文
const mySubItems = [
  { name: '历史记录', icon: History, path: '/history' },
  { name: '我赞过的', icon: ThumbsUp, path: '/liked' },
  { name: '稍后再看', icon: Clock, path: '/watch-later' },
  { name: '我的收藏', icon: Bookmark, path: '/favorites' }
]

const toggleSidebar = () => {
  isSidebarExpanded.value = !isSidebarExpanded.value
}

const toggleMyMenu = () => {
  if (!isSidebarExpanded.value) {
    isSidebarExpanded.value = true
    isMyMenuExpanded.value = true
  } else {
    isMyMenuExpanded.value = !isMyMenuExpanded.value
  }
}
</script>

<template>
  <div class="h-[100dvh] bg-sunset-cream text-sunset-dark font-sans selection:bg-sunset-orange/20 overflow-hidden flex flex-col relative bg-gradient-to-br from-[#fdfbf7] to-[#f4ebe1]">
    <div class="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] rounded-full bg-sunset-orange/10 blur-[120px] pointer-events-none mix-blend-multiply z-0" />
    <div class="absolute bottom-[5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-sunset-rose/10 blur-[120px] pointer-events-none mix-blend-multiply z-0" />

    <header class="h-[88px] flex-shrink-0 w-full bg-white/50 backdrop-blur-2xl border-b border-black/5 shadow-sm flex items-center justify-between px-6 lg:px-8 z-50">
      <div class="flex items-center gap-2">
        <button class="p-2.5 mr-1 rounded-full text-slate-700 hover:bg-white/80 hover:text-sunset-orange active:scale-95 transition duration-200 ease-out outline-none flex-shrink-0" @click="toggleSidebar">
          <Menu class="w-6 h-6" />
        </button>
        <NuxtLink to="/" class="flex items-center gap-3 cursor-pointer group transition duration-200 ease-out hover:scale-105 active:scale-95">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sunset-orange to-sunset-rose flex items-center justify-center shadow-md opacity-90 group-hover:opacity-100 transition-opacity duration-200 ease-out">
            <Play class="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
          <span class="text-2xl font-bold tracking-tight text-slate-800 drop-shadow-sm group-hover:text-sunset-orange transition-colors duration-200">VibeShare</span>
        </NuxtLink>
      </div>

      <div class="hidden md:flex flex-1 max-w-2xl mx-10 relative group">
        <input
          type="text"
          placeholder="搜索你感兴趣的视频或内容..."
          class="w-full h-[50px] pl-12 pr-4 bg-white/90 border border-slate-300/80 focus:bg-white focus:border-sunset-orange/60 focus:ring-4 focus:ring-sunset-orange/10 rounded-full outline-none transition-all duration-300 ease-out text-[16px] text-slate-800 placeholder:text-slate-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
        >
        <Search class="w-[22px] h-[22px] absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset-orange transition-colors duration-200 ease-out" />
      </div>

      <div class="flex items-center gap-3 sm:gap-5">
        <ClientOnly>
          <template v-if="isLoggedIn">
<NuxtLink 
  to="/studio" 
  class="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-sunset-orange to-sunset-rose hover:from-sunset-rose hover:to-sunset-orange text-white px-6 py-2.5 rounded-full font-medium text-[15px] transition duration-200 ease-out hover:scale-105 active:scale-95 shadow-md shadow-sunset-orange/20"
>
  <Plus class="w-5 h-5" /><span>发布</span>
</NuxtLink>
            <button class="p-3 bg-white/60 border border-white/80 text-slate-600 hover:bg-white hover:text-sunset-orange rounded-full transition duration-200 ease-out hover:scale-105 active:scale-95 relative shadow-sm group">
              <MessageCircle class="w-6 h-6 transition-colors duration-200" />
              <span class="absolute top-2.5 right-2.5 w-3 h-3 bg-sunset-rose rounded-full animate-soft-breathe border-2 border-white/80" />
            </button>
            <button class="p-3 bg-white/60 border border-white/80 text-slate-600 hover:bg-white hover:text-sunset-orange rounded-full transition duration-200 ease-out hover:scale-105 active:scale-95 shadow-sm group">
              <Bell class="w-6 h-6 transition-colors duration-200" />
            </button>
            <UserAvatarDropdown class="ml-2" />
          </template>

          <template v-else>
            <button
              class="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-7 py-2.5 rounded-full font-semibold text-[15.5px] transition duration-200 ease-out transform-gpu hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/10"
              @click="authStore.openLoginModal()"
            >
              登录 / 注册
            </button>
          </template>
        </ClientOnly>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden relative z-10">
      <aside
        class="flex-shrink-0 bg-white/40 backdrop-blur-2xl border-r border-black/5 shadow-[4px_0_24px_rgba(0,0,0,0.02)] hidden lg:flex flex-col py-6 transition-[width] duration-200 ease-out overflow-y-auto hide-scrollbar z-20 relative"
        :class="isSidebarExpanded ? 'w-[260px]' : 'w-[80px]'"
      >
        <nav class="space-y-2 px-4 relative">
          <NuxtLink
            v-for="item in mainNavItems"
            :key="item.path"
            :to="item.path"
            active-class="bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border-slate-100 active-nav-indicator"
            class="relative flex items-center h-[52px] px-2.5 rounded-xl transition duration-200 ease-out hover:scale-[1.02] active:scale-95 group font-medium overflow-hidden border border-transparent text-slate-600 hover:bg-white/80 hover:text-sunset-orange"
          >
            <div class="indicator-bar absolute left-0 top-1/2 -translate-y-1/2 w-1.5 bg-gradient-to-b from-sunset-orange to-sunset-rose rounded-r-full transition-all duration-200 ease-out shadow-sm h-0 opacity-0" />
            <div class="flex items-center justify-center w-10 flex-shrink-0">
              <component :is="item.icon" class="w-6 h-6 transition-colors duration-200 ease-out group-hover:text-sunset-orange icon-color" />
            </div>
            <div class="overflow-hidden whitespace-nowrap transition-all duration-200 ease-out flex items-center" :class="isSidebarExpanded ? 'w-32 opacity-100 ml-3' : 'w-0 opacity-0 ml-0'">
              <span class="text-[17px] font-semibold tracking-wide">{{ item.name }}</span>
            </div>
          </NuxtLink>
        </nav>

        <div class="my-5 border-t border-black/5 mx-6 transition-opacity duration-200" :class="isSidebarExpanded ? 'opacity-100' : 'opacity-0'" />

        <div class="px-4">
          <button
            class="w-full relative flex items-center justify-between h-[52px] px-2.5 rounded-xl transition duration-200 ease-out hover:scale-[1.02] active:scale-95 group font-medium border border-transparent text-slate-600 hover:bg-white/80 hover:text-sunset-orange"
            :class="isMyMenuExpanded ? 'bg-white/50' : ''"
            @click="toggleMyMenu"
          >
            <div class="flex items-center">
              <div class="flex items-center justify-center w-10 flex-shrink-0">
                <User class="w-6 h-6 transition-colors duration-200 ease-out group-hover:text-sunset-orange" :class="isMyMenuExpanded ? 'text-sunset-orange' : ''" />
              </div>
              <div class="overflow-hidden whitespace-nowrap transition-all duration-200 ease-out flex items-center" :class="isSidebarExpanded ? 'w-24 opacity-100 ml-3' : 'w-0 opacity-0 ml-0'">
                <span class="text-[17px] font-bold tracking-wide">我的</span>
              </div>
            </div>
            <div class="overflow-hidden transition-all duration-200 flex items-center justify-center" :class="isSidebarExpanded ? 'w-6 opacity-100' : 'w-0 opacity-0'">
              <ChevronDown class="w-[18px] h-[18px] transition-transform duration-300 ease-out" :class="isMyMenuExpanded ? 'rotate-180 text-sunset-orange' : ''" />
            </div>
          </button>

          <div
            class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col space-y-1"
            :class="(isMyMenuExpanded && isSidebarExpanded) ? 'max-h-60 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'"
          >
            <NuxtLink
              v-for="sub in mySubItems"
              :key="sub.path"
              :to="sub.path"
              class="flex items-center h-[44px] px-2 ml-4 rounded-xl transition-colors duration-200 ease-out hover:bg-white/70 text-slate-500 hover:text-sunset-orange group"
            >
              <div class="flex items-center justify-center w-8 flex-shrink-0">
                <component :is="sub.icon" class="w-5 h-5 transition-transform duration-200 ease-out group-hover:scale-110" />
              </div>
              <span class="ml-2 text-[15px] font-medium">{{ sub.name }}</span>
            </NuxtLink>
          </div>
        </div>
      </aside>

      <main class="flex-1 h-full overflow-hidden relative z-10">
        <slot />
      </main>
    </div>
  </div>
</template>

<style>
body {
  overflow: hidden !important;
  overscroll-behavior: none;
}

.active-nav-indicator .indicator-bar {
  height: 1.75rem;
  opacity: 1;
}

.active-nav-indicator .icon-color {
  color: #1e293b;
}

@keyframes soft-breathe {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.animate-soft-breathe {
  animation: soft-breathe 2.5s ease-in-out infinite;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>