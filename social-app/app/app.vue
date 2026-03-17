<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <div>
    <ClientOnly>
      <Toaster 
      theme="light"
        position="top-center" 
        :duration="1500"
        expand 
        :toastOptions="{
          class: 'vibe-toast', // 基础容器样式
          classes: {
            success: 'vibe-toast-success', // 成功状态的左侧绿边
            error: 'vibe-toast-error',     // 失败状态的左侧红边
            warning: 'vibe-toast-warning', // 警告状态的左侧黄边
            info: 'vibe-toast-info',       // 信息状态的左侧蓝边
            description: 'vibe-toast-description', // 描述文字
            closeButton: 'vibe-toast-close'        // 关闭按钮
          }
        }"
      />
    </ClientOnly>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    
    <ClientOnly>
      <LoginModal />
    </ClientOnly>
  </div>
</template>

<style>
/* 页面过渡动画定义 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px); 
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px); 
}

/* ========================================= */
/* ✨ 终极 Vibe 风格 Toast：苹果级毛玻璃质感 */
/* ========================================= */

/* ========================================= */
/* ✨ 终极 Vibe：iOS 级胶囊毛玻璃提示框 */
/* ========================================= */

.vibe-toast {
  /* 1. 胶囊形状与排版 */
  padding: 12px 20px !important;
  border-radius: 100px !important; /* 变成圆润的胶囊形 */
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #1e293b !important;
  
  /* 2. 极致的毛玻璃与光影（核心） */
  background: rgba(255, 255, 255, 0.65) !important; /* 提高透明度 */
  backdrop-filter: blur(24px) saturate(180%) !important; /* 增强模糊和色彩饱和度 */
  -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
  
  /* 3. 边缘高光与柔和阴影 */
  border: 1px solid rgba(255, 255, 255, 0.8) !important; 
  box-shadow: 
    0 10px 30px -8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6) !important; /* 内部顶光，增加 3D 质感 */

  /* 4. 内容对齐 */
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
}

/* 🚨 终结丑陋：强行抹除所有大红大绿的边框，保持纯净！ */
.vibe-toast-success,
.vibe-toast-error,
.vibe-toast-warning,
.vibe-toast-info {
  border-left: none !important;
}

/* 调整组件自带图标的大小，使其更精致 */
.vibe-toast svg {
  width: 18px !important;
  height: 18px !important;
}

@keyframes vibe-toast-in {
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
[data-sonner-toaster] {
  position: fixed !important;
  top: 24px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  z-index: 999999 !important;
  pointer-events: none !important; /* 让整个大容器透明，绝不遮挡你页面的正常点击 */
  width: 100%;
  display: flex;
  justify-content: center;
}

/* 让 Toast 气泡本身恢复可点击状态（比如点击关闭按钮） */
[data-sonner-toaster] [data-sonner-toast] {
  pointer-events: auto !important;
  position: relative !important;
}

/* 隐藏可能由于样式丢失暴露出来的原始图标占位 */
[data-sonner-toaster] svg {
  vertical-align: middle;
}
</style>
