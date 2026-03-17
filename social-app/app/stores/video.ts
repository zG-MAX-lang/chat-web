import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useVideoStore = defineStore('video', () => {
  const videos = ref([
    {
      id: 1,
      title: '周末Vlog：探索城市边缘的秘密咖啡馆',
      description: '这个周末去了一家藏在弄堂里的咖啡馆，手冲非常棒，氛围感拉满！希望能在这个忙碌的城市里给大家带来一点安静的时刻。#周末去哪儿 #探店',
      tags: ['Vlog', '探店', '咖啡'],
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop',
      status: '已发布',
      date: '2026-03-14',
      views: 12400,
      likes: 856,
      isLiked: false, // 是否已点赞
      duration: '05:24',
      author: 'Vibe探索家',
      authorAvatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix',
      comments: [
        { id: 101, user: '咖啡爱好者', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=A', content: '这家店我也去过！那个手冲曼特宁绝了。', time: '2小时前' },
        { id: 102, user: '城市漫游', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=B', content: '拍得太有感觉了，求相机的型号~', time: '5小时前' }
      ],
      file: null // 预设视频没有真实物理文件
    },
    {
      id: 2,
      title: 'Vue3 + Nuxt3 极速全栈开发实战',
      description: '手把手教你使用 Nuxt3 和 TailwindCSS 搭建现代化全栈应用。本期我们将完成视频管理后台和首页推荐流的打通！',
      tags: ['编程', 'Vue3', '前端开发'],
      thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
      status: '已发布',
      date: '2026-03-15',
      views: 8200,
      likes: 1200,
      isLiked: true,
      duration: '18:10',
      author: '前端小智',
      authorAvatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Aneka',
      comments: [
        { id: 201, user: '全栈学徒', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=C', content: '干货满满，先码后看！', time: '1天前' }
      ],
      file: null
    }
  ])

  const publishedVideos = computed(() => {
    return videos.value.filter(v => v.status === '已发布')
  })

  // 通过 ID 获取单个视频详情
  const getVideoById = (id: number) => {
    return videos.value.find(v => v.id === id)
  }

  // 点赞/取消点赞逻辑
  const toggleLike = (id: number) => {
    const video = getVideoById(id)
    if (video) {
      video.isLiked = !video.isLiked
      video.isLiked ? video.likes++ : video.likes--
    }
  }

  // 添加评论逻辑
  const addComment = (id: number, content: string) => {
    const video = getVideoById(id)
    if (video && content.trim()) {
      video.comments.unshift({
        id: Date.now(),
        user: '我',
        avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Me',
        content: content,
        time: '刚刚'
      })
    }
  }

  const addVideo = (videoData: any) => {
    videos.value.unshift({
      id: Date.now(),
      title: videoData.title || videoData.file.name.replace(/\.[^/.]+$/, ""),
      description: videoData.description,
      tags: videoData.tags,
      thumbnail: videoData.thumbnail,
      status: videoData.status,
      date: new Date().toISOString().split('T')[0],
      views: 0,
      likes: 0,
      isLiked: false,
      duration: videoData.duration,
      author: '我',
      authorAvatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Me',
      comments: [],
      file: videoData.file // 保存真实的 File 对象，用于详情页真实播放！
    })
  }

  const removeVideo = (id: number) => {
    const index = videos.value.findIndex(v => v.id === id)
    if (index !== -1) videos.value.splice(index, 1)
  }

  return { 
    videos, publishedVideos, getVideoById, addVideo, removeVideo, toggleLike, addComment
  }
})