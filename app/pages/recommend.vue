<script setup lang="ts">
// 💡 注意：这里故意不加 definePageMeta({ middleware: 'auth' })
// 这样未登录的游客也能进来刷视频，实现真正的“游客模式”

import { ref, shallowRef } from 'vue'
import { 
  Heart, MessageCircle, Share2, Star, Plus,
  Play, Pause, Type, Settings, Maximize, MonitorPlay, VolumeX
} from 'lucide-vue-next'

// ✨ 1. 引入动作级鉴权 Hook
import { useAuthGuard } from '~/composables/useAuthGuard'
const { withAuth } = useAuthGuard()

const recommendVideos = ref([
  {
    id: 1,
    author: '阿怪电影日记',
    time: '10小时前',
    description: '你动我可以，但千万别动我的母亲！',
    tags: ['#影视剪辑', '#军检查官多伯曼犬'],
    likes: '1.3万',
    comments: '392',
    favorites: '1363',
    shares: '642',
    cover: 'https://images.unsplash.com/photo-1595304322473-10e5cf3a0100?q=80&w=800&h=1400&auto=format&fit=crop',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Movie&backgroundColor=f4d3b6'
  },
  {
    id: 2,
    author: '落日收集者',
    time: '昨天 18:30',
    description: '在加州的一号公路，追赶一场绝美的落日。沿途的海风和金色的阳光，治愈了一切。',
    tags: ['#公路旅行', '#日落'],
    likes: '12.4w',
    comments: '4521',
    favorites: '2.1w',
    shares: '8234',
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&h=1400&auto=format&fit=crop',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sunset&backgroundColor=ffdfbf'
  }
])

const actionButtons = shallowRef([
  { id: 'likes', icon: Heart, activeClass: 'group-hover:text-[#fe2c55] group-hover:fill-[#fe2c55]' },
  { id: 'comments', icon: MessageCircle, activeClass: 'group-hover:fill-white/20' },
  { id: 'favorites', icon: Star, activeClass: 'group-hover:text-[#face15] group-hover:fill-[#face15]' },
  { id: 'shares', icon: Share2, activeClass: '' }
])

// ✨ 2. 具体的业务交互逻辑（仅在登录态下才会被执行）
const handleVideoAction = (actionType: string, videoId: number) => {
  console.log(`执行操作: ${actionType}, 视频ID: ${videoId}`)
  // TODO: 对接点赞/评论/收藏API
}

const followUser = (videoId: number) => {
  console.log(`关注视频 ${videoId} 的作者！`)
  // TODO: 对接关注API
}

const sendDanmaku = () => {
  console.log('执行发送弹幕逻辑...')
  // TODO: 读取输入框内容并发送
}
</script>

<template>
  <div class="h-full w-full bg-[#0a0a0a] text-white overflow-y-auto snap-y snap-mandatory hide-scrollbar">
    
    <div 
      v-for="video in recommendVideos" 
      :key="video.id"
      class="w-full h-full snap-start snap-always flex flex-col relative"
    >
      
      <div class="flex-1 flex flex-row overflow-hidden relative z-10">
        
        <img :src="video.cover" class="absolute inset-0 w-full h-full object-cover blur-[80px] opacity-30 pointer-events-none z-0" />

        <div class="w-[80px] flex-shrink-0 relative z-20 border-r border-white/5 bg-black/20 backdrop-blur-sm pointer-events-none">
          <div class="absolute inset-y-0 right-0 w-6 bg-gradient-to-r from-black/20 to-transparent"></div>
        </div>

        <div class="flex-1 relative flex items-center justify-center overflow-hidden z-10">
          
          <img :src="video.cover" class="w-full h-full object-contain drop-shadow-2xl pointer-events-none" />

          <div class="absolute left-6 bottom-8 z-30 max-w-lg flex flex-col gap-2 pointer-events-none">
            <div class="flex items-center gap-2 pointer-events-auto">
              <span class="font-bold text-[16px] hover:underline cursor-pointer drop-shadow-md">@{{ video.author }}</span>
              <span class="text-white/70 text-[14px] drop-shadow-md">· {{ video.time }}</span>
            </div>
            <p class="text-[15px] leading-relaxed drop-shadow-md pointer-events-auto text-white/95">
              {{ video.description }}
            </p>
            <div class="flex flex-wrap gap-2 mt-1 pointer-events-auto">
              <span v-for="tag in video.tags" :key="tag" class="text-[#face15] font-semibold text-[14px] hover:underline cursor-pointer drop-shadow-md">
                {{ tag }}
              </span>
            </div>
          </div>
          
          <div class="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20 pointer-events-none"></div>
        </div>

        <div class="w-[80px] flex-shrink-0 relative z-20 border-l border-white/5 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-end pb-12 gap-9 pointer-events-auto">
          
          <div class="absolute inset-y-0 left-0 w-6 bg-gradient-to-l from-black/20 to-transparent pointer-events-none"></div>

          <div class="relative cursor-pointer transition-transform duration-300 hover:scale-105 mb-2 z-10">
            <div class="w-[48px] h-[48px] rounded-full border-[1.5px] border-white/80 overflow-hidden bg-neutral-800 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
               <img :src="video.avatar" class="w-full h-full object-cover" />
            </div>
            <div 
              @click="withAuth(() => followUser(video.id))"
              class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-[22px] h-[22px] bg-[#fe2c55] rounded-full flex items-center justify-center border-[2px] border-[#1a1a1a] hover:scale-110 transition-transform"
            >
               <Plus class="w-3.5 h-3.5 text-white stroke-[3px]" />
            </div>
          </div>

          <div 
            v-for="btn in actionButtons" 
            :key="btn.id" 
            @click="withAuth(() => handleVideoAction(btn.id, video.id))"
            class="flex flex-col items-center gap-1.5 cursor-pointer group hover:-translate-y-1 transition-all duration-300 z-10"
          >
            <div class="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:bg-white/15 transition-colors shadow-sm">
              <component :is="btn.icon" class="w-[24px] h-[24px] text-white/90 transition-all stroke-[1.5]" :class="btn.activeClass" />
            </div>
            <span class="text-white/80 text-[13px] font-semibold drop-shadow-md">{{ (video as any)[btn.id] }}</span>
          </div>
          
        </div>
      </div>

      <div class="h-[64px] flex-shrink-0 w-full bg-[#121212] border-t border-white/10 z-30 flex items-center justify-between px-6">
        
        <div class="flex items-center gap-4 text-white/90">
          <Play class="w-5 h-5 cursor-pointer hover:text-white transition-colors fill-white stroke-none" />
          <span class="text-[14px] font-medium font-mono tracking-wide">00:03 / 02:51</span>
          <div class="flex items-center gap-2 cursor-pointer hover:text-white ml-2 text-white/70 transition-colors">
            <span class="text-[14px] font-semibold">弹</span>
            <span class="text-[14px] font-semibold">弹</span>
          </div>
        </div>

        <div class="flex-1 max-w-[600px] mx-8 flex items-center h-[40px] bg-white/5 rounded-full px-1.5 border border-white/10 focus-within:bg-white/10 transition-colors">
          <div class="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer hover:bg-white/10 transition-colors">
            <span class="text-white/70 text-lg">☺</span>
          </div>
          <input 
            type="text" 
            placeholder="发一条友好的弹幕吧" 
            class="flex-1 bg-transparent text-[14px] text-white placeholder-white/40 outline-none px-3"
          />
          <button 
            @click="withAuth(() => sendDanmaku())"
            class="h-[32px] px-6 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-[14px] font-medium transition-colors"
          >
            发送
          </button>
        </div>

        <div class="flex items-center gap-5 text-white/70 text-[14px] font-medium">
          <div class="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors group">
            <div class="w-[32px] h-[18px] rounded-full bg-[#fe2c55] flex items-center px-[2px]">
              <div class="w-[14px] h-[14px] bg-white rounded-full translate-x-[14px] shadow-sm"></div>
            </div>
            <span>连播</span>
          </div>
          <div class="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors group">
            <div class="w-[32px] h-[18px] rounded-full bg-white/20 flex items-center px-[2px]">
              <div class="w-[14px] h-[14px] bg-white rounded-full shadow-sm"></div>
            </div>
            <span>清屏</span>
          </div>
          <span class="cursor-pointer hover:text-white transition-colors">智能</span>
          <span class="cursor-pointer hover:text-white transition-colors">倍速</span>
          
          <MonitorPlay class="w-[22px] h-[22px] cursor-pointer hover:text-white stroke-[1.5] transition-colors" />
          <Settings class="w-[22px] h-[22px] cursor-pointer hover:text-white stroke-[1.5] transition-colors" />
          <VolumeX class="w-[22px] h-[22px] cursor-pointer hover:text-white stroke-[1.5] transition-colors" />
          <Maximize class="w-[22px] h-[22px] cursor-pointer hover:text-white stroke-[1.5] transition-colors" />
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
/* 隐藏系统滚动条，但保留鼠标滚轮滚动功能 */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>