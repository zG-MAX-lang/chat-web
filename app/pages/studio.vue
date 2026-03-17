<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useVideoStore } from '~/stores/video'
import { 
  UploadCloud, Film, Edit, Trash2, BarChart2,
  CheckCircle2, Clock, AlertCircle, Video, X
} from 'lucide-vue-next'

const videoStore = useVideoStore()
const { videos } = storeToRefs(videoStore)

// --- 页面状态控制 ---
const isDragging = ref(false)
const isUploading = ref(false)
const isFillingInfo = ref(false) // 新增：是否处于填写信息阶段
const uploadProgress = ref(0)
const processText = ref('')
const activeTab = ref('全部')
const tabs = ['全部', '已发布', '审核中', '草稿']

// --- 表单数据与临时文件存储 ---
const tempMedia = ref<{ file: File | null, thumbnail: string, duration: string }>({
  file: null,
  thumbnail: '',
  duration: '00:00'
})

const formData = reactive({
  title: '',
  description: '',
  tags: [] as string[],
  tagInput: ''
})

const filteredVideos = computed(() => {
  if (activeTab.value === '全部') return videos.value
  return videos.value.filter(v => v.status === activeTab.value)
})

// --- 核心：前端抽帧 ---
const generateVideoThumbnail = (file: File): Promise<{ thumbnail: string, duration: string }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = URL.createObjectURL(file)
    
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, video.duration / 2)
    }
    
    video.onseeked = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      
      const minutes = Math.floor(video.duration / 60)
      const seconds = Math.floor(video.duration % 60)
      const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

      URL.revokeObjectURL(video.src)
      resolve({ thumbnail: dataUrl, duration: formattedDuration })
    }
    video.onerror = (e) => reject(e)
  })
}

// --- 文件选择与上传逻辑 ---
const onDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0 && files[0].type.startsWith('video/')) {
    handleFileUpload(files[0])
  } else {
    alert("请上传有效的视频文件！")
  }
}

const onFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    handleFileUpload(input.files[0])
    input.value = '' 
  }
}

const handleFileUpload = async (file: File) => {
  isUploading.value = true
  isFillingInfo.value = false
  uploadProgress.value = 0
  processText.value = '正在解析视频信息...'

  try {
    const { thumbnail, duration } = await generateVideoThumbnail(file)

    processText.value = `正在上传 ${file.name}...`
    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        uploadProgress.value += Math.floor(Math.random() * 20) + 5
        if (uploadProgress.value >= 100) {
          uploadProgress.value = 100
          clearInterval(interval)
          setTimeout(resolve, 500)
        }
      }, 200)
    })

    // 上传完成，进入信息填写阶段
    isUploading.value = false
    isFillingInfo.value = true
    
    // 初始化表单数据
    tempMedia.value = { file, thumbnail, duration }
    formData.title = file.name.replace(/\.[^/.]+$/, "") // 默认使用去后缀的文件名
    formData.description = ''
    formData.tags = []
    formData.tagInput = ''

  } catch (error) {
    console.error("处理失败:", error)
    alert("视频解析失败，请检查文件格式。")
    isUploading.value = false
  }
}

// --- 标签处理逻辑 ---
const handleAddTag = () => {
  const tag = formData.tagInput.trim()
  if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
    formData.tags.push(tag)
  }
  formData.tagInput = ''
}

const removeTag = (index: number) => {
  formData.tags.splice(index, 1)
}

// --- 最终提交逻辑 ---
const submitVideo = (status: '已发布' | '草稿') => {
  if (!formData.title.trim()) {
    alert("请输入视频标题")
    return
  }

  videoStore.addVideo({
    file: tempMedia.value.file!,
    thumbnail: tempMedia.value.thumbnail,
    duration: tempMedia.value.duration,
    title: formData.title,
    description: formData.description,
    tags: formData.tags,
    status: status
  })

  // 提交后重置状态并回到列表
  isFillingInfo.value = false
  activeTab.value = status
}

const cancelUpload = () => {
  if(confirm("确定要取消发布吗？已上传的视频将丢失。")) {
    isFillingInfo.value = false
  }
}

const handleDelete = (id: number, title: string) => {
  if (confirm(`确定要删除视频《${title}》吗？`)) {
    videoStore.removeVideo(id)
  }
}

// --- UI 辅助函数 ---
const getStatusColor = (status: string) => {
  switch(status) {
    case '已发布': return 'text-emerald-600 bg-emerald-100 border-emerald-200'
    case '审核中': return 'text-amber-600 bg-amber-100 border-amber-200'
    case '草稿': return 'text-slate-600 bg-slate-200 border-slate-300'
    default: return 'text-slate-600 bg-slate-100 border-slate-200'
  }
}
const getStatusIcon = (status: string) => {
  switch(status) {
    case '已发布': return CheckCircle2
    case '审核中': return Clock
    case '草稿': return Edit
    default: return AlertCircle
  }
}
</script>

<template>
  <div class="h-full overflow-y-auto custom-scrollbar p-6 lg:p-8">
    <div class="max-w-6xl mx-auto space-y-8">
      
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-800 tracking-tight">创作中心</h1>
          <p class="text-slate-500 mt-2 text-[15px]">在这里上传、管理和分析你的所有视频作品</p>
        </div>
      </div>

      <div 
        class="relative w-full rounded-[2rem] transition-all duration-500 ease-out overflow-hidden shadow-sm"
        :class="[
          isFillingInfo ? 'bg-white/80 border border-slate-200/60 backdrop-blur-xl' : 'border-2 border-dashed bg-white/40 backdrop-blur-md flex flex-col items-center justify-center p-12 min-h-[360px]',
          isDragging && !isFillingInfo ? 'border-sunset-orange bg-sunset-orange/5 scale-[1.01]' : 'border-slate-300/80',
        ]"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop="onDrop"
      >
        
        <template v-if="!isUploading && !isFillingInfo">
          <input 
            type="file" 
            accept="video/*" 
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            @change="onFileSelect"
          >
          <div class="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-6 shadow-inner">
            <UploadCloud class="w-12 h-12 text-slate-400" />
          </div>
          <h3 class="text-2xl font-bold text-slate-800 mb-3 tracking-tight">点击或将视频拖拽到此处</h3>
          <p class="text-slate-500 mb-8 font-medium">支持 MP4, WebM, MOV 格式</p>
          <button class="bg-slate-900 text-white px-8 py-3 rounded-full font-semibold pointer-events-none z-20">
            选择视频文件
          </button>
        </template>

        <template v-else-if="isUploading">
          <div class="w-full max-w-lg flex flex-col items-center z-20 py-8">
            <Video class="w-16 h-16 text-sunset-orange animate-bounce mb-6" />
            <div class="w-full flex justify-between items-end mb-3 px-1">
              <span class="text-slate-600 font-medium">{{ processText }}</span>
              <span class="text-sunset-orange font-bold text-3xl font-mono">{{ uploadProgress }}%</span>
            </div>
            <div class="w-full h-4 bg-slate-200/80 rounded-full overflow-hidden shadow-inner p-0.5">
              <div 
                class="h-full bg-gradient-to-r from-sunset-orange to-sunset-rose transition-all duration-300 ease-out rounded-full shadow-sm"
                :style="{ width: `${uploadProgress}%` }"
              />
            </div>
          </div>
        </template>

        <template v-else-if="isFillingInfo">
          <div class="p-8 sm:p-10 flex flex-col lg:flex-row gap-10">
            <div class="w-full lg:w-1/3 flex flex-col gap-4">
              <h3 class="text-lg font-bold text-slate-800">视频预览</h3>
              <div class="w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 relative shadow-md border border-slate-200">
                <img :src="tempMedia.thumbnail" class="w-full h-full object-cover" alt="封面预览">
                <div class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium backdrop-blur-md">
                  {{ tempMedia.duration }}
                </div>
              </div>
              <p class="text-xs text-slate-500 text-center">系统已自动截取封面</p>
            </div>

            <div class="w-full lg:w-2/3 flex flex-col gap-5">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">视频标题 <span class="text-sunset-orange">*</span></label>
                <input 
                  v-model="formData.title" 
                  type="text" 
                  placeholder="给你的视频起个吸引人的名字..." 
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sunset-orange focus:ring-2 focus:ring-sunset-orange/20 outline-none transition-all text-slate-800 font-medium"
                  maxlength="50"
                >
                <div class="text-right text-xs text-slate-400 mt-1">{{ formData.title.length }}/50</div>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">视频文案 / 简介</label>
                <textarea 
                  v-model="formData.description" 
                  rows="3"
                  placeholder="描述一下这个视频的内容，支持使用换行..." 
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sunset-orange focus:ring-2 focus:ring-sunset-orange/20 outline-none transition-all text-slate-800 resize-none custom-scrollbar"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">添加标签 (最多5个)</label>
                <div class="flex flex-wrap gap-2 mb-3">
                  <span 
                    v-for="(tag, index) in formData.tags" 
                    :key="index"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sunset-orange/10 text-sunset-orange font-medium text-sm border border-sunset-orange/20"
                  >
                    # {{ tag }}
                    <button @click="removeTag(index)" class="hover:bg-sunset-orange/20 rounded-full p-0.5 transition-colors">
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </span>
                </div>
                <input 
                  v-model="formData.tagInput" 
                  @keydown.enter.prevent="handleAddTag"
                  type="text" 
                  placeholder="输入标签后按回车键 (Enter) 添加" 
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sunset-orange focus:ring-2 focus:ring-sunset-orange/20 outline-none transition-all text-slate-800"
                  :disabled="formData.tags.length >= 5"
                >
              </div>

              <div class="flex items-center justify-end gap-4 mt-4 pt-6 border-t border-slate-100">
                <button @click="cancelUpload" class="px-6 py-2.5 rounded-full font-medium text-slate-500 hover:bg-slate-100 transition-colors">
                  取消
                </button>
                <button @click="submitVideo('草稿')" class="px-6 py-2.5 rounded-full font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                  存为草稿
                </button>
            <button @click="submitVideo('已发布')" class="px-8 py-2.5 rounded-full font-semibold bg-gradient-to-r from-sunset-orange to-sunset-rose text-white hover:shadow-lg hover:shadow-sunset-orange/30 transition-all hover:-translate-y-0.5">
  立即发布
</button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div class="flex items-center px-8 border-b border-slate-200/60 bg-white/40 overflow-x-auto hide-scrollbar">
          <button 
            v-for="tab in tabs" :key="tab"
            class="h-[68px] px-6 font-semibold text-[15.5px] relative transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
            :class="activeTab === tab ? 'text-sunset-orange' : 'text-slate-500 hover:text-slate-800'"
            @click="activeTab = tab"
          >
            {{ tab }}
            <span v-if="tab === '全部'" class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{{ videos.length }}</span>
            <div 
              class="absolute bottom-0 left-0 w-full h-[3px] rounded-t-full transition-all duration-300"
              :class="activeTab === tab ? 'bg-gradient-to-r from-sunset-orange to-sunset-rose' : 'bg-transparent'"
            />
          </button>
        </div>

        <div class="divide-y divide-slate-100">
          <div v-for="video in filteredVideos" :key="video.id" class="p-6 sm:px-8 flex flex-col sm:flex-row gap-6 hover:bg-white/60 transition-colors duration-300 group">
            <div class="relative w-full sm:w-56 aspect-video rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200/60 shadow-sm">
              <img :src="video.thumbnail" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out">
              <div class="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
                {{ video.duration }}
              </div>
            </div>

            <div class="flex-1 flex flex-col justify-between min-w-0 py-1">
              <div>
                <h3 class="text-xl font-bold text-slate-800 truncate group-hover:text-sunset-orange transition-colors duration-200">
                  {{ video.title }}
                </h3>
                <div v-if="video.tags && video.tags.length" class="flex flex-wrap gap-1.5 mt-2">
                  <span v-for="tag in video.tags" :key="tag" class="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    #{{ tag }}
                  </span>
                </div>
                <div class="flex items-center gap-3 mt-3">
                  <span class="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border" :class="getStatusColor(video.status)">
                    <component :is="getStatusIcon(video.status)" class="w-3.5 h-3.5" />
                    {{ video.status }}
                  </span>
                  <span class="text-sm text-slate-500 font-medium">{{ video.date }}</span>
                </div>
              </div>

              <div class="flex items-center gap-8 mt-5 sm:mt-0 text-sm font-medium text-slate-500">
                <div class="flex items-center gap-2"><Film class="w-4.5 h-4.5" /><span>{{ video.views }}</span></div>
                <div class="flex items-center gap-2"><BarChart2 class="w-4.5 h-4.5" /><span>{{ video.likes }}</span></div>
              </div>
            </div>

            <div class="flex items-center justify-end sm:flex-col sm:justify-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 mt-4 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button class="flex items-center justify-center w-10 h-10 bg-slate-50 text-slate-600 hover:text-white hover:bg-slate-800 rounded-full transition-all duration-200 shadow-sm"><Edit class="w-4 h-4" /></button>
              <button @click="handleDelete(video.id, video.title)" class="flex items-center justify-center w-10 h-10 bg-red-50 text-red-500 hover:text-white hover:bg-red-500 rounded-full transition-all duration-200 shadow-sm"><Trash2 class="w-4 h-4" /></button>
            </div>
          </div>
          
          <div v-if="filteredVideos.length === 0" class="py-32 flex flex-col items-center justify-center text-slate-400">
            <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4"><Film class="w-10 h-10 text-slate-300" /></div>
            <p class="text-lg font-medium text-slate-500">该状态下没有视频</p>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>