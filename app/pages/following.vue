<script setup lang="ts">
// 页面级守卫：未登录直接拦截在页面外
definePageMeta({ middleware: 'auth' })
import { ref, shallowRef } from 'vue'
import { 
  Heart, MessageCircle, Share2, Star, Plus,
  Play, CheckCircle2, ChevronRight, ChevronLeft, Users,
  Settings, Maximize, MonitorPlay, VolumeX
} from 'lucide-vue-next'


// 控制左侧关注列表的展开/收起
const isPanelOpen = ref(true)

// 左侧边栏：关注的创作者模拟数据
const followingCreators = ref([
  { id: 1, name: '前端修罗场', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix', hasUpdate: true, updateTime: '刚刚' },
  { id: 2, name: '影视飓风', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Movie', hasUpdate: true, updateTime: '2小时前' },
  { id: 3, name: '何同学', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Tech', hasUpdate: true, updateTime: '5小时前' },
  { id: 4, name: '野生玩家', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sam', hasUpdate: false, updateTime: '昨天' },
  { id: 5, name: '小鹿旅行', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Travel', hasUpdate: false, updateTime: '昨天' },
  { id: 6, name: '音乐现场', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Luna', hasUpdate: false, updateTime: '3天前' },
  { id: 7, name: '极客时间', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Geek', hasUpdate: false, updateTime: '1周前' },
])

// 主信息流：视频数据
const generateFeed = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `video_${i}`,
    author: ['前端修罗场', '影视飓风', '何同学', '野生玩家'][i % 4],
    avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${i}`,
    verified: i % 3 === 0,
    time: `${Math.floor(Math.random() * 23 + 1)} 小时前`,
    description: `左侧边栏布局达成！视频绝对居中，UI悬浮贴边。你现在收放左侧的关注列表试试看，画面稳如磐石，收展的全部都是两边的留白空间！#终极架构 #沉浸式体验 ${i}`,
    tags: ['#日常分享', '#神级UI', '#Vue3'],
    cover: `https://picsum.photos/seed/${i + 600}/800/1400`, 
    likes: Math.floor(Math.random() * 5000 + 100),
    comments: Math.floor(Math.random() * 500 + 10),
    shares: Math.floor(Math.random() * 300 + 5),
  }))
}

const videoFeedList = ref(generateFeed(10)) // 渲染 10 条保证原生滚动流畅度

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
</script>

<template>
  <div class="relative flex flex-row w-full h-full overflow-hidden bg-[#0a0a0a] text-white">
    
    <aside 
      class="h-full flex-shrink-0 transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] bg-[#fdfdfd] border-r border-white/10 overflow-hidden relative z-20"
      :class="isPanelOpen ? 'w-[280px]' : 'w-0 border-r-0'"
    >
      <div class="w-[280px] h-full flex flex-col">
        <div class="h-[64px] px-6 flex items-center gap-2.5 border-b border-black/5 flex-shrink-0">
          <Users class="w-[22px] h-[22px] text-amber-500" />
          <h2 class="font-bold text-[16px] text-slate-900 tracking-wide">关注列表</h2>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          <div 
            v-for="creator in followingCreators" 
            :key="creator.id"
            class="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors duration-200 group"
          >
            <div 
              class="relative w-11 h-11 rounded-full p-[2px] transition-transform duration-300 group-hover:scale-105 shadow-sm flex-shrink-0"
              :class="creator.hasUpdate ? 'bg-gradient-to-tr from-amber-400 to-rose-500' : 'bg-slate-200'"
            >
              <div class="w-full h-full rounded-full border-[1.5px] border-white overflow-hidden bg-white">
                <img :src="creator.avatar" class="w-full h-full object-cover" />
              </div>
            </div>
            
            <div class="flex flex-col flex-1 overflow-hidden">
              <span class="text-[14.5px] font-semibold text-slate-800 truncate group-hover:text-amber-600 transition-colors">
                {{ creator.name }}
              </span>
              <span class="text-[12px] truncate mt-0.5" :class="creator.hasUpdate ? 'text-amber-500 font-medium' : 'text-slate-400'">
                {{ creator.hasUpdate ? `更新于 ${creator.updateTime}` : '暂无最新动态' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <button 
      @click="isPanelOpen = !isPanelOpen"
      class="absolute top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-10 h-10 bg-white border border-slate-200 shadow-[0_0_20px_rgba(0,0,0,0.15)] rounded-full text-slate-500 hover:text-amber-500 hover:scale-105 active:scale-95 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
      :style="{ left: isPanelOpen ? '280px' : '0px', marginLeft: '-20px' }"
    >
      <ChevronLeft v-if="isPanelOpen" class="w-6 h-6 mr-0.5" />
      <ChevronRight v-else class="w-6 h-6 ml-0.5" />
    </button>

    <main class="flex-1 min-w-0 h-full flex flex-col relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      
      <div class="flex-1 w-full overflow-y-auto snap-y snap-mandatory hide-scrollbar relative bg-[#0a0a0a]">
        
        <div 
          v-for="item in videoFeedList" 
          :key="item.id"
          class="w-full h-full snap-start snap-always relative flex items-center justify-center overflow-hidden"
        >
          <img :src="item.cover" class="absolute inset-0 w-full h-full object-cover blur-[80px] scale-110 opacity-30 pointer-events-none z-0" />
          
          <img :src="item.cover" class="relative z-10 h-full max-w-full object-contain drop-shadow-2xl pointer-events-none" />

          <div class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 pointer-events-none"></div>

          <div class="absolute left-8 bottom-8 z-20 max-w-[60%] flex flex-col gap-2.5 pointer-events-none">
            <div class="flex items-center gap-2 pointer-events-auto">
              <span class="font-bold text-[17px] hover:underline cursor-pointer drop-shadow-md tracking-wide">@{{ item.author }}</span>
              <CheckCircle2 v-if="item.verified" class="w-[18px] h-[18px] text-amber-400" />
              <span class="text-white/70 text-[14px] drop-shadow-md ml-1 font-medium">· {{ item.time }}</span>
            </div>
            
            <p class="text-[15.5px] leading-relaxed drop-shadow-md pointer-events-auto text-white/95">
              {{ item.description }}
            </p>
            
            <div class="flex flex-wrap gap-2 mt-0.5 pointer-events-auto">
              <span v-for="tag in item.tags" :key="tag" class="text-[#face15] font-semibold text-[14.5px] hover:underline cursor-pointer drop-shadow-md">
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="absolute right-6 bottom-8 z-20 flex flex-col items-center gap-7 pointer-events-auto">
            <div class="relative cursor-pointer transition-transform duration-300 hover:scale-105 mb-1">
              <div class="w-[52px] h-[52px] rounded-full border-2 border-white/80 overflow-hidden bg-neutral-800 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                 <img :src="item.avatar" class="w-full h-full object-cover" />
              </div>
              <div class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#fe2c55] rounded-full flex items-center justify-center border-2 border-[#1a1a1a]">
                 <Plus class="w-4 h-4 text-white stroke-[3px]" />
              </div>
            </div>

            <div 
              v-for="btn in actionButtons" 
              :key="btn.id" 
          
              class="flex flex-col items-center gap-1.5 cursor-pointer group hover:-translate-y-1 transition-transform"
            >
              <div class="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-colors shadow-sm">
                <component :is="btn.icon" class="w-[26px] h-[26px] text-white/90 transition-all stroke-[1.5]" :class="btn.activeClass" />
              </div>
              <span class="text-white/90 text-[13px] font-semibold drop-shadow-md">{{ (item as any)[btn.id] }}</span>
            </div>
          </div>
        </div>

      </div>

      <div class="h-[64px] flex-shrink-0 w-full bg-[#121212] border-t border-white/5 z-30 flex items-center justify-between px-8">
        <div class="flex items-center gap-4 text-white/90">
          <Play class="w-5 h-5 cursor-pointer hover:text-white transition-colors fill-white stroke-none" />
          <span class="text-[14px] font-medium font-mono tracking-wide">00:03 / 02:51</span>
          <div class="flex items-center gap-2 cursor-pointer hover:text-white ml-2 text-white/70">
            <span class="text-[14px] font-semibold">弹</span>
            <span class="text-[14px] font-semibold">弹</span>
          </div>
        </div>

        <div class="flex-1 max-w-[600px] mx-8 flex items-center h-[40px] bg-[#222] rounded-full px-1.5 border border-white/5 focus-within:bg-[#2a2a2a] transition-colors">
          <div class="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer hover:bg-white/5 transition-colors">
            <span class="text-white/70 text-lg">☺</span>
          </div>
          <input type="text" placeholder="发一条友好的弹幕吧" class="flex-1 bg-transparent text-[14px] text-white placeholder-white/40 outline-none px-4" />
          <button class="h-[32px] px-6 mr-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-[14px] font-medium transition-colors">发送</button>
        </div>

        <div class="flex items-center gap-5 text-white/70 text-[14px] font-medium">
          <div class="flex items-center gap-1.5 cursor-pointer hover:text-white group">
            <div class="w-[34px] h-[18px] rounded-full bg-[#fe2c55] flex items-center px-[2px]"><div class="w-[14px] h-[14px] bg-white rounded-full translate-x-[16px] shadow-sm"></div></div>
            <span>连播</span>
          </div>
          <span class="cursor-pointer hover:text-white">清屏</span>
          <span class="cursor-pointer hover:text-white">智能</span>
          <span class="cursor-pointer hover:text-white">倍速</span>
          <MonitorPlay class="w-[22px] h-[22px] cursor-pointer hover:text-white stroke-[1.5]" />
          <Settings class="w-[22px] h-[22px] cursor-pointer hover:text-white stroke-[1.5]" />
          <VolumeX class="w-[22px] h-[22px] cursor-pointer hover:text-white stroke-[1.5]" />
          <Maximize class="w-[22px] h-[22px] cursor-pointer hover:text-white stroke-[1.5]" />
        </div>
      </div>
    </main>

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
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.08);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.15);
}
</style>