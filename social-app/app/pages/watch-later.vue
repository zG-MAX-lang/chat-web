<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const watchLaterList: Array<any> = []

// TODO(backend): 对接 GET /api/watch-later?page=1&pageSize=20
// 新增稍后再看: POST /api/watch-later { videoId }
// 移除稍后再看: DELETE /api/watch-later/{videoId}
</script>

<template>
  <div class="h-full overflow-y-auto px-6 py-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold text-slate-800">稍后再看</h1>
      <p class="text-slate-500 mt-1">把想看的内容先放在这里。</p>

      <div v-if="watchLaterList.length > 0" class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4" />

      <div v-else class="mt-6">
        <EmptyStateCard
          title="稍后再看列表为空"
          description="先展示默认空状态，接口完成后自动显示收藏内容。"
          cta-text="去首页"
          @click="navigateTo('/')"
        />
      </div>
    </div>
  </div>
</template>
