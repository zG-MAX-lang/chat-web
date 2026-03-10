<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <div>

    <ClientOnly>
      <Toaster position="top-center" richColors />
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
</style>