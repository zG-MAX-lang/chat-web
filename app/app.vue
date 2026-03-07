<template>
 
  <div>
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
  transform: translateY(10px); /* 新页面从稍微偏下的位置淡入 */
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px); /* 老页面向上淡出 */
}
</style>