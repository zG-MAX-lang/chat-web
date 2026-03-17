<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useVideoStore } from '~/stores/video'
import { 
  ThumbsUp, MessageSquare, Share2, Bookmark, 
  MoreHorizontal, UserPlus, Play, CheckCircle2 
} from 'lucide-vue-next'

const route = useRoute()
const videoStore = useVideoStore()

// 获取当前视频 ID
const videoId = Number(route.params.id)
const video = ref(videoStore.getVideoById(videoId))

// 推荐视频列表 (过滤掉当前视频)
const { publishedVideos } = storeToRefs(videoStore)
const recommendedVideos = computed(() => {
  return publishedVideos.value.filter(v => v.id !== videoId).slice(0, 5)
})

// 播放器状态
const videoElement = ref<HTMLVideoElement | null>(null)
const videoSrc = ref('')
const isPlaying = ref(false)

// 评论输入
const newComment = ref('')

onMounted(() => {
  if (video.value) {
    // 核心黑科技：如果这是刚上传的视频(有真实 File 对象)，我们直接生成本地 URL 播放！
    if (video.value.file) {
      videoSrc.value = URL.createObjectURL(video.value.file)
    }
  }
})

onUnmounted(() => {
  // 清理内存
  if (videoSrc.value && videoSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(videoSrc.value)
  }
})

const handlePlay = () => {
  if (videoElement.value) {
    if (videoElement.value.paused) {
      videoElement.value.play()
      isPlaying.value = true
    } else {
      videoElement.value.pause()
      isPlaying.value = false
    }
  }
}

const submitComment = () => {
  if (newComment.value.trim()) {
    videoStore.addComment(videoId, newComment.value)
    newComment.value = ''
  }
}
</script>

<template>
  <div class="h-full overflow-y-auto custom-scrollbar bg-white">
    <div v-if="!video" class="flex flex-col items-center justify-center h-full text-slate-500">
      <h2 class="text-2xl font-bold mb-2">视频不存在或已被删除</h2>
      <NuxtLink to="/" class="text-sunset-orange hover:underline">返回首页</NuxtLink>
    </div>

    <div v-else class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-8">
      
      <div class="flex-1 w-full max-w-5xl">
        <div class="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg group">
          <video 
            v-if="videoSrc"
            ref="videoElement"
            :src="videoSrc"
            class="w-full h-full object-contain"
            controls
            autoplay
            @play="isPlaying = true"
            @pause="isPlaying = false"
          ></video>

          <div v-else class="relative w-full h-full cursor-pointer" @click="handlePlay">
            <img :src="video.thumbnail" class="w-full h-full object-cover opacity-80" alt="poster">
            <div class="absolute inset-0 flex items-center justify-center bg-black/20 transition-all">
              <div class="w-16 h-16 bg-sunset-orange/90 backdrop-blur-md rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-xl">
                <Play class="w-8 h-8 text-white ml-1 fill-white" />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-5">
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">{{ video.title }}</h1>
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
            <div class="flex items-center gap-3">
              <img :src="video.authorAvatar" class="w-12 h-12 rounded-full border border-slate-200 cursor-pointer object-cover">
              <div class="flex flex-col">
                <div class="flex items-center gap-1.5 font-bold text-slate-800 text-[16px]">
                  {{ video.author }}
                  <CheckCircle2 v-if="video.author === '我'" class="w-4 h-4 text-blue-500" />
                </div>
                <span class="text-[13px] text-slate-500 font-medium">12.5万 粉丝</span>
              </div>
              <button class="ml-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-sm font-semibold transition-colors">
                关注
              </button>
            </div>

            <div class="flex items-center gap-2">
              <button 
                class="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors border"
                :class="video.isLiked ? 'bg-sunset-orange/10 text-sunset-orange border-sunset-orange/20' : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200'"
                @click="videoStore.toggleLike(videoId)"
              >
                <ThumbsUp class="w-5 h-5" :class="{'fill-current': video.isLiked}" />
                {{ video.likes }}
              </button>
              <button class="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-medium transition-colors border border-transparent">
                <Share2 class="w-5 h-5" /> 分享
              </button>
              <button class="flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors">
                <Bookmark class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div class="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 text-[15px] text-slate-700">
          <div class="font-bold mb-2 flex items-center gap-2 text-slate-900">
            <span>{{ video.views.toLocaleString() }} 次观看</span>
            <span class="text-slate-300">|</span>
            <span>发布于 {{ video.date }}</span>
          </div>
          <div v-if="video.tags && video.tags.length" class="flex flex-wrap gap-2 mb-3">
            <span v-for="tag in video.tags" :key="tag" class="text-sunset-orange font-medium cursor-pointer hover:underline">
              #{{ tag }}
            </span>
          </div>
          <p class="whitespace-pre-wrap leading-relaxed">{{ video.description || '作者什么也没留下...' }}</p>
        </div>

        <div class="mt-8">
          <h3 class="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MessageSquare class="w-6 h-6" />
            {{ video.comments.length }} 条评论
          </h3>
          
          <div class="flex gap-4 mb-8">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Me" class="w-10 h-10 rounded-full object-cover">
            <div class="flex-1 flex flex-col gap-2">
              <input 
                v-model="newComment"
                type="text" 
                placeholder="发一条友善的评论..." 
                class="w-full bg-transparent border-b-2 border-slate-200 focus:border-slate-800 pb-2 outline-none transition-colors text-slate-800"
                @keyup.enter="submitComment"
              >
              <div class="flex justify-end" v-if="newComment">
                <button @click="newComment = ''" class="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">取消</button>
                <button @click="submitComment" class="px-4 py-1.5 text-sm font-medium bg-sunset-orange text-white rounded-full">评论</button>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div v-for="comment in video.comments" :key="comment.id" class="flex gap-4">
              <img :src="comment.avatar" class="w-10 h-10 rounded-full object-cover border border-slate-100">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-bold text-[14px] text-slate-900">{{ comment.user }}</span>
                  <span class="text-[12px] text-slate-500">{{ comment.time }}</span>
                </div>
                <p class="text-[15px] text-slate-700">{{ comment.content }}</p>
                <div class="flex items-center gap-4 mt-2 text-slate-500">
                  <button class="flex items-center gap-1.5 hover:text-slate-800"><ThumbsUp class="w-4 h-4" /> 赞</button>
                  <button class="text-[13px] font-medium hover:text-slate-800">回复</button>
                </div>
              </div>
            </div>
            
            <div v-if="video.comments.length === 0" class="text-center text-slate-400 py-10">
              暂无评论，来做第一个评论的人吧！
            </div>
          </div>
        </div>
      </div>

      <div class="w-full lg:w-[400px] flex-shrink-0">
        <h3 class="text-lg font-bold text-slate-800 mb-4">为您推荐</h3>
        <div class="flex flex-col gap-4">
          <NuxtLink 
            v-for="rec in recommendedVideos" 
            :key="rec.id" 
            :to="`/video/${rec.id}`"
            class="flex gap-3 group cursor-pointer"
          >
            <div class="relative w-40 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-black/5">
              <img :src="rec.thumbnail" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
              <span class="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">{{ rec.duration }}</span>
            </div>
            <div class="flex flex-col py-0.5">
              <h4 class="text-[14px] font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-sunset-orange transition-colors">
                {{ rec.title }}
              </h4>
              <span class="text-[12px] text-slate-500 mt-1">{{ rec.author }}</span>
              <span class="text-[12px] text-slate-500 mt-0.5">{{ rec.views }} 次观看</span>
            </div>
          </NuxtLink>
        </div>
      </div>

    </div>
  </div>
</template>