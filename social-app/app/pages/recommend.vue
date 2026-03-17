<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useVideoStore } from '~/stores/video'
import {
  Heart,
  MessageCircle,
  Share2,
  Star,
  Plus,
  Play,
  Pause,
  Settings,
  Maximize,
  MonitorPlay,
  VolumeX,
  Volume2,
  X
} from 'lucide-vue-next'
import { useAuthGuard } from '~/composables/useAuthGuard'

const { withAuth } = useAuthGuard()

const videoStore = useVideoStore()
const { publishedVideos } = storeToRefs(videoStore)

const localInteractions = ref<Record<number, { favorited: boolean, favoriteCount: number, shareCount: number }>>({})
const localFollows = ref<Record<string, boolean>>({}) 

const getInteraction = (id: number) => {
  if (!localInteractions.value[id]) {
    localInteractions.value[id] = { favorited: false, favoriteCount: Math.floor(Math.random() * 2000), shareCount: Math.floor(Math.random() * 500) }
  }
  return localInteractions.value[id]
}

const getFollowed = (author: string) => {
  if (localFollows.value[author] === undefined) localFollows.value[author] = false
  return localFollows.value[author]
}

// === 播放状态、声音、倍速控制 ===
const playingStates = ref<Record<number, boolean>>({}) 
const globalMuted = ref(true) 
const globalSpeed = ref(1.0) 
const activeSpeedMenu = ref<number | null>(null)
const speedOptions = [0.5, 1.0, 1.25, 1.5, 2.0]
const activeVideoId = ref<number | null>(null) // 记录当前在视口内的视频ID

// === 可视区域监听 (Intersection Observer) ===
let observer: IntersectionObserver | null = null

const initObserver = () => {
  if (observer) observer.disconnect()
  
  const rootEl = document.getElementById('video-scroll-container')
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const vidId = Number((entry.target as HTMLElement).dataset.videoId)
      const videoEl = document.getElementById(`video-${vidId}`) as HTMLVideoElement
      
      // 当视频超过 60% 进入视口时触发
      if (entry.isIntersecting) {
        activeVideoId.value = vidId
        if (videoEl) {
          videoEl.play().catch(e => console.warn('浏览器自动播放受限:', e))
        }
      } else {
        // 视频滑出视口，强制暂停
        if (videoEl) {
          videoEl.pause()
        }
      }
    })
  }, {
    root: rootEl,
    threshold: 0.6 // 触发阈值：60% 可见度
  })

  // 监听所有视频外层容器
  document.querySelectorAll('.video-snap-container').forEach(el => {
    observer?.observe(el)
  })
}

// === 生命周期与数据监听 ===
onMounted(() => {
  nextTick(() => {
    initObserver()
  })
})

// 当新视频发布导致列表更新时，重新绑定监听
watch(publishedVideos, () => {
  nextTick(() => {
    initObserver()
  })
}, { deep: true })

onUnmounted(() => {
  if (observer) observer.disconnect()
  blobUrls.forEach(url => URL.revokeObjectURL(url))
})

// === 核心：播放完毕自动切换下一个 ===
const onVideoEnded = (id: number) => {
  const currentIndex = publishedVideos.value.findIndex(v => v.id === id)
  // 确保当前不是最后一个视频
  if (currentIndex !== -1 && currentIndex < publishedVideos.value.length - 1) {
    const nextId = publishedVideos.value[currentIndex + 1].id
    const nextContainer = document.getElementById(`video-container-${nextId}`)
    if (nextContainer) {
      // 平滑滚动到下一个视频
      nextContainer.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

// === 进度条系统 ===
const videoProgress = ref<Record<number, { current: number, total: number }>>({})

const getProgress = (id: number) => {
  if (!videoProgress.value[id]) {
    videoProgress.value[id] = { current: 0, total: 1 } 
  }
  return videoProgress.value[id]
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || !seconds) return '00:00'
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const onTimeUpdate = (id: number, e: Event) => {
  const el = e.target as HTMLVideoElement
  getProgress(id).current = el.currentTime
}

const onLoadedMetadata = (id: number, e: Event) => {
  const el = e.target as HTMLVideoElement
  el.playbackRate = globalSpeed.value
  el.muted = globalMuted.value
  getProgress(id).total = el.duration || 1
}

const handleSeek = (id: number, e: MouseEvent) => {
  const el = document.getElementById(`video-${id}`) as HTMLVideoElement
  if (!el) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const percentage = Math.max(0, Math.min(1, clickX / rect.width))
  el.currentTime = percentage * el.duration
  getProgress(id).current = el.currentTime
}

// === 交互操作 ===
const togglePlay = (videoId: number) => {
  const videoEl = document.getElementById(`video-${videoId}`) as HTMLVideoElement
  if (!videoEl) return
  if (videoEl.paused) {
    videoEl.play()
  } else {
    videoEl.pause()
  }
}

const toggleMute = () => {
  globalMuted.value = !globalMuted.value
  document.querySelectorAll('video').forEach(vid => {
    vid.muted = globalMuted.value
  })
}

const changeSpeed = (speed: number) => {
  globalSpeed.value = speed
  activeSpeedMenu.value = null
  document.querySelectorAll('video').forEach(vid => {
    vid.playbackRate = speed
  })
}

const blobUrls = new Map<number, string>()
const getVideoSrc = (video: any) => {
  if (!video.file) return ''
  if (!blobUrls.has(video.id)) {
    blobUrls.set(video.id, URL.createObjectURL(video.file))
  }
  return blobUrls.get(video.id)
}

const handleLike = (id: number) => videoStore.toggleLike(id)
const handleFavorite = (id: number) => {
  const state = getInteraction(id)
  state.favorited = !state.favorited
  state.favorited ? state.favoriteCount++ : state.favoriteCount--
}
const handleShare = (id: number) => getInteraction(id).shareCount++
const handleFollow = (author: string) => localFollows.value[author] = !localFollows.value[author]

const activeCommentVideoId = ref<number | null>(null)
const commentInput = ref('')

const activeCommentVideo = computed(() => {
  if (!activeCommentVideoId.value) return null
  return publishedVideos.value.find((item) => item.id === activeCommentVideoId.value) || null
})

const openCommentDrawer = (videoId: number) => {
  activeCommentVideoId.value = videoId
  commentInput.value = ''
}

const closeCommentDrawer = () => {
  activeCommentVideoId.value = null
  commentInput.value = ''
}

const submitComment = () => {
  if (!activeCommentVideoId.value || !commentInput.value.trim()) return
  videoStore.addComment(activeCommentVideoId.value, commentInput.value.trim())
  commentInput.value = ''
}

const formatCount = (value: number) => {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`
  return String(value)
}
</script>

<template>
  <div id="video-scroll-container" class="h-full w-full bg-[#0a0a0a] text-white overflow-y-auto snap-y snap-mandatory hide-scrollbar">
    
    <div v-if="publishedVideos.length === 0" class="h-full flex flex-col items-center justify-center text-white/50">
      <Play class="w-16 h-16 mb-4 opacity-20" />
      <p class="text-xl font-bold">暂时没有推荐视频</p>
      <NuxtLink to="/studio" class="mt-4 text-[#face15] hover:underline">去上传你的第一支视频</NuxtLink>
    </div>

    <div 
      v-for="video in publishedVideos" 
      :key="video.id" 
      :id="`video-container-${video.id}`"
      :data-video-id="video.id"
      class="video-snap-container w-full h-full snap-start snap-always flex flex-col relative"
    >
      <div class="flex-1 flex flex-row overflow-hidden relative z-10">
        <img :src="video.thumbnail" class="absolute inset-0 w-full h-full object-cover blur-[80px] opacity-30 pointer-events-none z-0">
        <div class="w-[80px] flex-shrink-0 relative z-20 border-r border-white/5 bg-black/20 backdrop-blur-sm pointer-events-none">
          <div class="absolute inset-y-0 right-0 w-6 bg-gradient-to-r from-black/20 to-transparent" />
        </div>

        <div class="flex-1 relative flex items-center justify-center overflow-hidden z-10">
          <video 
            v-if="video.file" 
            :id="`video-${video.id}`"
            :src="getVideoSrc(video)" 
            class="w-full h-full object-contain drop-shadow-2xl cursor-pointer" 
            playsinline
            :muted="globalMuted"
            @click="togglePlay(video.id)"
            @play="playingStates[video.id] = true"
            @pause="playingStates[video.id] = false"
            @timeupdate="onTimeUpdate(video.id, $event)"
            @loadedmetadata="onLoadedMetadata(video.id, $event)"
            @ended="onVideoEnded(video.id)"
          ></video>
          <img v-else :src="video.thumbnail" class="w-full h-full object-contain drop-shadow-2xl pointer-events-none">

          <div class="absolute left-6 bottom-8 z-30 max-w-lg flex flex-col gap-2 pointer-events-none">
            <div class="flex items-center gap-2 pointer-events-auto">
              <span class="font-bold text-[16px] hover:underline cursor-pointer drop-shadow-md">@{{ video.author }}</span>
              <span class="text-white/70 text-[14px] drop-shadow-md">· {{ video.date }}</span>
            </div>
            <p class="text-[15px] leading-relaxed drop-shadow-md pointer-events-auto text-white/95">{{ video.description }}</p>
            <div class="flex flex-wrap gap-2 mt-1 pointer-events-auto">
              <span v-for="tag in video.tags" :key="tag" class="text-[#face15] font-semibold text-[14px] hover:underline cursor-pointer drop-shadow-md">
                #{{ tag }}
              </span>
            </div>
          </div>
          <div class="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20 pointer-events-none" />
        </div>

        <div class="w-[80px] flex-shrink-0 relative z-20 border-l border-white/5 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-end pb-12 gap-9 pointer-events-auto">
          <div class="absolute inset-y-0 left-0 w-6 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
          <div class="relative cursor-pointer transition-transform duration-300 hover:scale-105 mb-2 z-10">
            <div class="w-[48px] h-[48px] rounded-full border-[1.5px] border-white/80 overflow-hidden bg-neutral-800 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <img :src="video.authorAvatar" class="w-full h-full object-cover">
            </div>
            <button class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 min-w-[26px] h-[24px] px-2 bg-[#fe2c55] rounded-full flex items-center justify-center border-[2px] border-[#1a1a1a] hover:scale-110 transition-transform text-[11px] font-semibold" @click="withAuth(() => handleFollow(video.author))">
              <Plus v-if="!getFollowed(video.author)" class="w-3.5 h-3.5 text-white stroke-[3px]" />
              <span v-else>已关注</span>
            </button>
          </div>
          <button class="flex flex-col items-center gap-1.5 cursor-pointer group hover:-translate-y-1 transition-all duration-300 z-10" @click="withAuth(() => handleLike(video.id))">
            <div class="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:bg-white/15 transition-colors shadow-sm"><Heart class="w-[24px] h-[24px] text-white/90 transition-all stroke-[1.5]" :class="video.isLiked ? 'text-[#fe2c55] fill-[#fe2c55]' : ''" /></div>
            <span class="text-white/80 text-[13px] font-semibold drop-shadow-md">{{ formatCount(video.likes) }}</span>
          </button>
          <button class="flex flex-col items-center gap-1.5 cursor-pointer group hover:-translate-y-1 transition-all duration-300 z-10" @click="withAuth(() => openCommentDrawer(video.id))">
            <div class="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:bg-white/15 transition-colors shadow-sm"><MessageCircle class="w-[24px] h-[24px] text-white/90 transition-all stroke-[1.5]" /></div>
            <span class="text-white/80 text-[13px] font-semibold drop-shadow-md">{{ formatCount(video.comments.length) }}</span>
          </button>
          <button class="flex flex-col items-center gap-1.5 cursor-pointer group hover:-translate-y-1 transition-all duration-300 z-10" @click="withAuth(() => handleFavorite(video.id))">
            <div class="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:bg-white/15 transition-colors shadow-sm"><Star class="w-[24px] h-[24px] text-white/90 transition-all stroke-[1.5]" :class="getInteraction(video.id).favorited ? 'text-[#face15] fill-[#face15]' : ''" /></div>
            <span class="text-white/80 text-[13px] font-semibold drop-shadow-md">{{ formatCount(getInteraction(video.id).favoriteCount) }}</span>
          </button>
          <button class="flex flex-col items-center gap-1.5 cursor-pointer group hover:-translate-y-1 transition-all duration-300 z-10" @click="withAuth(() => handleShare(video.id))">
            <div class="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:bg-white/15 transition-colors shadow-sm"><Share2 class="w-[24px] h-[24px] text-white/90 transition-all stroke-[1.5]" /></div>
            <span class="text-white/80 text-[13px] font-semibold drop-shadow-md">{{ formatCount(getInteraction(video.id).shareCount) }}</span>
          </button>
        </div>
      </div>

      <div class="h-[64px] flex-shrink-0 w-full bg-[#121212] border-t border-white/10 z-30 flex items-center justify-between px-6 relative">
        <div class="absolute -top-[2px] left-0 right-0 h-[3px] bg-white/20 cursor-pointer hover:h-[6px] transition-all z-40 group/bar" @click="handleSeek(video.id, $event)">
          <div class="h-full bg-gradient-to-r from-sunset-orange to-sunset-rose relative transition-all duration-75" :style="{ width: `${(getProgress(video.id).current / getProgress(video.id).total) * 100}%` }">
            <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/bar:opacity-100 transform translate-x-1/2 shadow-[0_0_8px_rgba(0,0,0,0.4)]"></div>
          </div>
        </div>

        <div class="flex items-center gap-4 text-white/90 mt-1">
          <button @click="togglePlay(video.id)" class="outline-none">
            <Pause v-if="playingStates[video.id]" class="w-5 h-5 cursor-pointer hover:text-white transition-colors fill-white stroke-none" />
            <Play v-else class="w-5 h-5 cursor-pointer hover:text-white transition-colors fill-white stroke-none" />
          </button>
          <span class="text-[13px] font-medium font-mono tracking-wide w-[90px]">
            {{ video.file ? formatTime(getProgress(video.id).current) : '00:00' }} / {{ video.file ? formatTime(getProgress(video.id).total) : video.duration }}
          </span>
          <div class="flex items-center gap-2 cursor-pointer hover:text-white ml-1 text-white/70 transition-colors">
            <span class="text-[13px] font-semibold border border-white/20 px-1.5 py-0.5 rounded-md">弹幕 开</span>
          </div>
        </div>

        <div class="flex-1 max-w-[500px] mx-8 flex items-center h-[38px] bg-white/5 rounded-full px-1.5 border border-white/10 focus-within:bg-white/10 transition-colors">
          <div class="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer hover:bg-white/10 transition-colors"><span class="text-white/70 text-lg font-bold">A</span></div>
          <input type="text" placeholder="发一条友善的弹幕..." class="flex-1 bg-transparent text-[14px] text-white placeholder-white/40 outline-none px-3">
          <button class="h-[30px] px-5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-[13px] font-medium transition-colors">发送</button>
        </div>

        <div class="flex items-center gap-5 text-white/70 text-[14px] font-medium">
          <span class="cursor-pointer hover:text-white transition-colors">1080P</span>
          <div class="relative">
            <span class="cursor-pointer hover:text-white transition-colors" @click="activeSpeedMenu = activeSpeedMenu === video.id ? null : video.id">
              {{ globalSpeed === 1.0 ? '倍速' : globalSpeed + 'x' }}
            </span>
            <div v-if="activeSpeedMenu === video.id" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-[#1a1a1a] border border-white/10 shadow-2xl rounded-lg py-2 flex flex-col gap-1 z-50">
              <button v-for="speed in speedOptions" :key="speed" class="px-5 py-1.5 text-sm hover:bg-white/10 transition-colors whitespace-nowrap" :class="globalSpeed === speed ? 'text-sunset-orange font-bold' : 'text-white'" @click="changeSpeed(speed)">
                {{ speed }}x
              </button>
            </div>
          </div>
          <span class="cursor-pointer hover:text-white transition-colors">选集</span>
          <MonitorPlay class="w-[20px] h-[20px] cursor-pointer hover:text-white stroke-[1.5] transition-colors" />
          <Settings class="w-[20px] h-[20px] cursor-pointer hover:text-white stroke-[1.5] transition-colors" />
          <button @click="toggleMute" class="outline-none flex items-center justify-center">
            <VolumeX v-if="globalMuted" class="w-[22px] h-[22px] cursor-pointer text-red-400 hover:text-red-300 stroke-[1.5] transition-colors" />
            <Volume2 v-else class="w-[22px] h-[22px] cursor-pointer hover:text-white stroke-[1.5] transition-colors" />
          </button>
          <Maximize class="w-[20px] h-[20px] cursor-pointer hover:text-white stroke-[1.5] transition-colors" />
        </div>
      </div>
    </div>

    <div v-if="activeCommentVideo" class="fixed top-[88px] bottom-0 inset-x-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm" @click.self="closeCommentDrawer">
      <div class="h-full w-full max-w-[420px] bg-[#151515] border-l border-white/10 flex flex-col transform transition-transform shadow-2xl">
        <div class="h-14 px-4 flex items-center justify-between border-b border-white/10">
          <h3 class="font-semibold text-white">{{ formatCount(activeCommentVideo.comments.length) }} 条评论</h3>
          <button class="text-white/70 hover:text-white" @click="closeCommentDrawer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div v-if="activeCommentVideo.comments.length === 0" class="text-center text-white/55 mt-10 flex flex-col items-center">
            <MessageCircle class="w-12 h-12 opacity-20 mb-3" />
            暂无评论，来做第一个评论的人吧！
          </div>
          
          <div v-for="item in activeCommentVideo.comments" :key="item.id" class="flex gap-3 rounded-xl hover:bg-white/5 px-2 py-2.5 transition-colors">
            <img :src="item.avatar" class="w-8 h-8 rounded-full bg-white/10 object-cover flex-shrink-0" />
            <div>
              <p class="text-[13px] text-white/60 font-medium">{{ item.user }}</p>
              <p class="text-[14px] text-white/90 mt-0.5 leading-snug">{{ item.content }}</p>
              <p class="text-[12px] text-white/40 mt-1">{{ item.time }}</p>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-white/10">
          <div class="flex gap-2">
            <input 
              v-model="commentInput" 
              type="text" 
              placeholder="发一条友善的评论..." 
              class="flex-1 rounded-full bg-white/10 border border-white/20 px-4 py-2.5 text-sm outline-none focus:border-white/40 text-white placeholder-white/40 transition-colors"
              @keyup.enter="withAuth(submitComment)"
            >
            <button class="rounded-full bg-sunset-orange text-white px-5 text-sm font-bold hover:bg-sunset-rose transition-colors" @click="withAuth(submitComment)">发送</button>
          </div>
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