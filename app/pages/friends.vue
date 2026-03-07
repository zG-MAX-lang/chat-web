<script setup lang="ts">
// 页面级守卫：未登录直接拦截在页面外
definePageMeta({ middleware: 'auth' })

import { ref, shallowRef } from 'vue'
import { 
  Heart, MessageCircle, Share2, Star, Plus,
  Play, Settings, Maximize, MonitorPlay, VolumeX
} from 'lucide-vue-next'

// ✨ 1. 引入并提取动作级鉴权 Hook
import { useAuthGuard } from '~/composables/useAuthGuard'
const { withAuth } = useAuthGuard()

// 朋友动态数据
const friendsVideos = ref([
  {
    id: 1,
    author: '大学室友老李',
    time: '2小时前',
    description: '周末终于有空出来露营了！今天的晚霞简直绝美，快来跟我一起呼吸新鲜空气~ ⛺️🌅',
    tags: ['#周末碎片', '#露营', '#日常Vlog'],
    likes: '128',
    comments: '35',
    favorites: '12',
    shares: '5',
    cover: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=800&h=1400&auto=format&fit=crop', 
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Li&backgroundColor=c0aede'
  },
  {
    id: 2,
    author: '发小张伟',
    time: '昨天 20:15',
    description: '今天亲自下厨挑战做一顿大餐，大家看看卖相怎么样？（虽然过程极其翻车哈哈哈 🍳😂）',
    tags: ['#做饭日常', '#翻车现场'],
    likes: '89',
    comments: '56',
    favorites: '8',
    shares: '2',
    cover: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&h=1400&auto=format&fit=crop',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Zhang&backgroundColor=ffdfbf'
  },
  {
    id: 3,
    author: '设计部的莉莉',
    time: '3天前',
    description: '主子今天又干了蠢事，把刚买的绿植给刨了... 气死我了但也只能原谅它 🐱🌿',
    tags: ['#吸猫日常', '#萌宠', '#铲屎官'],
    likes: '256',
    comments: '88',
    favorites: '45',
    shares: '12',
    cover: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&h=1400&auto=format&fit=crop',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Lily&backgroundColor=b6e3f4'
  }
])

// 动作按钮配置
const actionButtons = shallowRef([
  { id: 'likes', icon: Heart, activeClass: 'group-hover:text-[#fe2c55] group-hover:fill-[#fe2c55]' },
  { id: 'comments', icon: MessageCircle, activeClass: 'group-hover:fill-white/20' },
  { id: 'favorites', icon: Star, activeClass: 'group-hover:text-[#face15] group-hover:fill-[#face15]' },
  { id: 'shares', icon: Share2, activeClass: '' }
])

// ✨ 2. 定义具体的业务交互逻辑
const handleVideoAction = (actionType: string, videoId: number) => {
  console.log(`执行操作: ${actionType}, 视频ID: ${videoId}`)
  // TODO: 对接后端 API，例如：if (actionType === 'likes') api.likeVideo(videoId)
}

const sendDanmaku = () => {
  console.log('执行发送弹幕逻辑...')
  // TODO: 读取输入框内容并发送
}
</script>

<template>
  <div class="h-full w-full bg-[#0a0a0a] text-white overflow-y-auto snap-y snap-mandatory hide-scrollbar">
    
    <div 
      v-for="video in friendsVideos" 
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
              <span class="font-bold text-[16px] hover:underline cursor-pointer drop-shadow-md tracking-wide">@{{ video.author }}</span>
              <span class="text-white/70 text-[14px] drop-shadow-md font-medium">· {{ video.time }}</span>
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
          </div> <div 
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
            placeholder="发一条友好的弹幕给老友吧" 
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
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>