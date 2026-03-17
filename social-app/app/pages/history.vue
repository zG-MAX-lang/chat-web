<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const historyList: Array<any> = []

// TODO(backend): 对接 GET /api/history?page=1&pageSize=20
// 返回示例: [{ id, title, cover, watchedAt, progress }]
</script>

<template>
  <div class="h-full overflow-y-auto px-6 py-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold text-slate-800">观看历史</h1>
      <p class="text-slate-500 mt-1">按时间查看你最近看过的视频。</p>

      <div v-if="historyList.length > 0" class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4" />

      <div v-else class="mt-6">
        <EmptyStateCard
          title="还没有历史记录"
          description="暂无可展示内容，后端接口接入后会自动展示。"
          cta-text="去首页看看"
          @click="navigateTo('/')"
        />
      </div>
    </div>
  </div>
</template>
