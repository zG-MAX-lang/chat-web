<script setup lang="ts">
import { ref, computed } from 'vue'
import { Flame, MoreVertical, CheckCircle2, Compass } from 'lucide-vue-next'
// 引入 AutoAnimate 指令，实现无缝过滤动画
import { vAutoAnimate } from '@formkit/auto-animate/vue'

// 1. 顶部分类标签数据
const categories = [
  '全部', '播客', '音乐', '游戏', '直播', '排球', '喜剧短片', 
  '动作冒险游戏', '足球', '最近上传', '发现新视频'
]
const activeCategory = ref('全部')

// 2. Shorts 短视频数据
const shortsList = ref([
  { id: 1, title: '落日余晖下的城市脉搏', views: '23万', cover: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=400&h=700&auto=format&fit=crop' },
  { id: 2, title: '金色海滩的温柔时刻', views: '11万', cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&h=700&auto=format&fit=crop' },
  { id: 3, title: '我的温暖书桌改造', views: '4.5万', cover: 'https://images.unsplash.com/photo-1618588507085-c79565432917?q=80&w=400&h=700&auto=format&fit=crop' },
  { id: 4, title: '沙漠里的观星之旅', views: '89万', cover: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?q=80&w=400&h=700&auto=format&fit=crop' },
  { id: 5, title: '秋日森林的色彩', views: '32万', cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&h=700&auto=format&fit=crop' },
  { id: 6, title: '城市街头的赛博朋克', views: '156万', cover: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=400&h=700&auto=format&fit=crop' },
])

// 3. 主视频信息流数据
const videoFeed = ref([
  { id: 101, category: '科技', title: '用 Vue3 + Nuxt 重构了我的整个社交平台，性能提升了多少？', channel: '前端修罗场', views: '12.4万', time: '2小时前', duration: '12:40', verified: true, thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix' },
  { id: 102, category: '教程', title: '如何自建翻墙节点？从零开始 VPS 搭建节点教程 | 什么是 VPS、协议、面板？', channel: 'InfiCheesy', views: '12万', time: '1个月前', duration: '19:22', verified: false, thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sam' },
  { id: 103, category: '教程', title: '新人玩电报必改 5 步！不改=隐私裸奔 | Telegram 新手教程', channel: '软件指南', views: '4.7万', time: '5个月前', duration: '7:44', verified: true, thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=News' },
  { id: 104, category: '音乐', title: '独立乐队 Live House 现场沉浸式体验 4K 高清版', channel: '声波捕手', views: '8.9万', time: '5小时前', duration: '05:21', verified: true, thumbnail: 'https://images.unsplash.com/photo-1516280440502-62f54ce598ad?q=80&w=800&auto=format&fit=crop', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Luna' },
  { id: 105, category: '游戏', title: '《黑神话：悟空》速通挑战：无伤击败最终 Boss 完整演示', channel: '硬核玩家', views: '56万', time: '1天前', duration: '45:10', verified: true, thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Gamer' },
  { id: 106, category: '自然', title: 'BBC 航拍：冰川融化的震撼瞬间，我们还能做些什么？', channel: '地球脉动', views: '11万', time: '3天前', duration: '08:15', verified: false, thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Earth' },
])

const filteredVideos = computed(() => {
  if (activeCategory.value === '全部') return videoFeed.value
  return videoFeed.value.filter(video => video.category.includes(activeCategory.value))
})
</script>

<template>
  <div class="h-full w-full overflow-y-auto custom-scrollbar text-slate-800 bg-transparent pb-16">
    
    <div class="sticky top-[-1px] z-40 w-full bg-white/95 backdrop-blur-2xl border-b border-slate-200/60 py-3 px-6 transform-gpu">
      <div class="flex gap-3 overflow-x-auto hide-scrollbar scroll-smooth pb-1">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="activeCategory = cat"
          class="whitespace-nowrap px-4 py-1.5 rounded-lg text-[14.5px] font-semibold transition-colors flex-shrink-0 border"
          :class="activeCategory === cat 
            ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <div class="max-w-[1600px] mx-auto w-full px-6 py-6 space-y-12">
      
      <section v-if="activeCategory === '全部'">
        <div class="flex items-center gap-2 mb-5">
          <Flame class="w-6 h-6 text-red-500 fill-red-500/20" />
          <h2 class="text-xl font-bold tracking-tight text-slate-900">Shorts</h2>
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <div 
            v-for="short in shortsList" 
            :key="short.id"
            class="relative w-full aspect-[9/16] rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-black/5"
          >
            <img :src="short.cover" class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
            
            <div class="absolute bottom-3 left-3 right-3 flex flex-col gap-1 z-10 pointer-events-none">
              <p class="text-[14px] font-semibold text-white leading-snug line-clamp-2 drop-shadow-md">
                {{ short.title }}
              </p>
              <p class="text-[12px] font-medium text-white/80 drop-shadow-md">
                {{ short.views }}次观看
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr v-if="activeCategory === '全部'" class="border-t-[3px] border-slate-200/60 rounded-full" />

      <section>
        <div v-if="activeCategory !== '全部'" class="flex items-center gap-2 mb-5">
          <Compass class="w-5 h-5 text-slate-500" />
          <h2 class="text-xl font-bold tracking-tight text-slate-900">{{ activeCategory }}</h2>
        </div>

        <div 
          v-auto-animate 
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10"
        >
          <div v-for="video in filteredVideos" :key="video.id" class="flex flex-col gap-3 group cursor-pointer">
            
            <div class="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 shadow-sm border border-black/5">
              <img :src="video.thumbnail" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <span class="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-bold px-1.5 py-0.5 rounded transition-opacity group-hover:opacity-0 backdrop-blur-sm">
                {{ video.duration }}
              </span>
            </div>
            
            <div class="flex gap-3 pr-2">
              <div class="flex-shrink-0 mt-1">
                <img :src="video.avatar" class="w-10 h-10 rounded-full object-cover bg-slate-200 border border-slate-100 shadow-sm" />
              </div>
              
              <div class="flex flex-col flex-1 overflow-hidden">
                <div class="flex justify-between items-start">
                  <h3 class="text-[16px] font-bold leading-snug line-clamp-2 text-slate-900 pr-2 group-hover:text-blue-600 transition-colors">
                    {{ video.title }}
                  </h3>
                  <button class="flex-shrink-0 p-1.5 rounded-full hover:bg-slate-200 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-2">
                    <MoreVertical class="w-5 h-5" />
                  </button>
                </div>
                
                <div class="flex flex-col text-[13px] text-slate-500 mt-1.5 font-medium">
                  <div class="flex items-center gap-1 hover:text-slate-800 transition-colors w-max">
                    {{ video.channel }}
                    <CheckCircle2 v-if="video.verified" class="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div class="flex items-center truncate mt-0.5">
                    <span>{{ video.views }}次观看</span>
                    <span class="mx-1.5 text-[10px]">•</span>
                    <span>{{ video.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredVideos.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-400">
          <p class="text-lg font-bold text-slate-600">没有找到该分类的视频</p>
          <button @click="activeCategory = '全部'" class="mt-4 px-5 py-2 bg-white border border-slate-200 shadow-sm rounded-full text-sm font-medium hover:bg-slate-50 text-slate-700">
            返回全部
          </button>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
/* 仅隐藏水平防溢出滚动条 */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>