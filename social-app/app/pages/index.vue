<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useVideoStore } from '~/stores/video'
import { Flame, MoreVertical, CheckCircle2, Compass, Play } from 'lucide-vue-next'
import { vAutoAnimate } from '@formkit/auto-animate/vue'

// 1. 引入全局状态库
const videoStore = useVideoStore()
const { publishedVideos } = storeToRefs(videoStore)

// 2. 更新分类标签（可根据你的常用 Tag 调整）
const categories = ['全部', 'Vlog', '科技', '前端开发', '游戏', '音乐', '生活', '发现新视频']
const activeCategory = ref('全部')

// Shorts 短视频保持静态演示数据
const shortsList = ref([
  { id: 1, title: '落日余晖下的城市脉动', views: '2.3万', cover: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=400&h=700&auto=format&fit=crop' },
  { id: 2, title: '金色海滩的温柔时刻', views: '1.1万', cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&h=700&auto=format&fit=crop' },
  { id: 3, title: '我的温暖书桌改造', views: '4500', cover: 'https://images.unsplash.com/photo-1618588507085-c79565432917?q=80&w=400&h=700&auto=format&fit=crop' },
  { id: 4, title: '沙漠里的观星之旅', views: '8.9万', cover: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?q=80&w=400&h=700&auto=format&fit=crop' },
  { id: 5, title: '秋日森林的色彩', views: '3.2万', cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&h=700&auto=format&fit=crop' },
  { id: 6, title: '赛博夜色街头', views: '15.6万', cover: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=400&h=700&auto=format&fit=crop' }
])

// 3. 核心过滤逻辑：通过 store 中的 tags 或 title 进行过滤
const filteredVideos = computed(() => {
  if (activeCategory.value === '全部') return publishedVideos.value
  
  return publishedVideos.value.filter((video) => {
    const hasMatchingTag = video.tags && video.tags.includes(activeCategory.value)
    const hasMatchingTitle = video.title.includes(activeCategory.value)
    return hasMatchingTag || hasMatchingTitle
  })
})
</script>

<template>
  <div class="h-full w-full overflow-y-auto custom-scrollbar text-slate-800 bg-transparent pb-16">
    <div class="sticky top-[-1px] z-40 w-full bg-white/95 backdrop-blur-2xl border-b border-slate-200/60 py-3 px-6 transform-gpu">
      <div class="flex gap-3 overflow-x-auto hide-scrollbar scroll-smooth pb-1">
        <button
          v-for="cat in categories"
          :key="cat"
          class="whitespace-nowrap px-4 py-1.5 rounded-lg text-[14.5px] font-semibold transition-colors flex-shrink-0 border"
          :class="activeCategory === cat ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'"
          @click="activeCategory = cat"
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
          <div v-for="short in shortsList" :key="short.id" class="relative w-full aspect-[9/16] rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-black/5">
            <img :src="short.cover" class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
            <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            <div class="absolute bottom-3 left-3 right-3 flex flex-col gap-1 z-10 pointer-events-none">
              <p class="text-[14px] font-semibold text-white leading-snug line-clamp-2 drop-shadow-md">{{ short.title }}</p>
              <p class="text-[12px] font-medium text-white/80 drop-shadow-md">{{ short.views }} 次观看</p>
            </div>
          </div>
        </div>
      </section>

      <hr v-if="activeCategory === '全部'" class="border-t-[3px] border-slate-200/60 rounded-full">

      <section>
        <div v-if="activeCategory !== '全部'" class="flex items-center gap-2 mb-5">
          <Compass class="w-5 h-5 text-slate-500" />
          <h2 class="text-xl font-bold tracking-tight text-slate-900">{{ activeCategory }}</h2>
        </div>

        <div v-auto-animate class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          
          <NuxtLink 
            v-for="video in filteredVideos" 
            :key="video.id" 
            :to="`/video/${video.id}`"
            class="flex flex-col gap-3 group cursor-pointer"
          >
            <div class="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 shadow-sm border border-black/5">
              <img :src="video.thumbnail" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
              
              <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div class="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-300 ease-out shadow-xl">
                  <Play class="w-6 h-6 text-sunset-orange ml-1 fill-sunset-orange" />
                </div>
              </div>

              <span class="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                {{ video.duration }}
              </span>
            </div>

            <div class="flex gap-3 pr-2">
              <div class="flex-shrink-0 mt-1">
                <img :src="video.authorAvatar" class="w-10 h-10 rounded-full object-cover bg-slate-200 border border-slate-100 shadow-sm">
              </div>

              <div class="flex flex-col flex-1 overflow-hidden">
                <div class="flex justify-between items-start">
                  <h3 class="text-[16px] font-bold leading-snug line-clamp-2 text-slate-900 pr-2 group-hover:text-sunset-orange transition-colors">
                    {{ video.title }}
                  </h3>
                  <button class="flex-shrink-0 p-1.5 rounded-full hover:bg-slate-200 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-2" @click.prevent>
                    <MoreVertical class="w-5 h-5" />
                  </button>
                </div>

                <div v-if="video.tags && video.tags.length > 0" class="flex flex-wrap gap-1.5 mt-1.5">
                  <span 
                    v-for="tag in video.tags.slice(0, 2)" 
                    :key="tag" 
                    class="text-[11px] font-medium text-sunset-orange bg-sunset-orange/10 px-1.5 py-0.5 rounded"
                  >
                    #{{ tag }}
                  </span>
                </div>

                <div class="flex flex-col text-[13px] text-slate-500 mt-1.5 font-medium">
                  <div class="flex items-center gap-1 hover:text-slate-800 transition-colors w-max">
                    {{ video.author }}
                    <CheckCircle2 v-if="video.author === '我'" class="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div class="flex items-center truncate mt-0.5">
                    <span>{{ video.views }} 播放</span>
                    <span class="mx-1.5 text-[20px] leading-none">·</span>
                    <span>{{ video.date }}</span>
                  </div>
                </div>
              </div>
            </div>
          </NuxtLink>
          
        </div>

        <div v-if="filteredVideos.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-400">
          <Play class="w-12 h-12 mb-4 opacity-20" />
          <p class="text-lg font-bold text-slate-600">没有找到相关的视频</p>
          <button class="mt-4 px-5 py-2 bg-white border border-slate-200 shadow-sm rounded-full text-sm font-medium hover:bg-slate-50 text-slate-700 transition-colors" @click="activeCategory = '全部'">
            返回全部推荐
          </button>
        </div>
      </section>
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}
</style>