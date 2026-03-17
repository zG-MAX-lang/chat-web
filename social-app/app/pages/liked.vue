<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const likedList: Array<any> = []

// TODO(backend): 瀵规帴 GET /api/likes?page=1&pageSize=20
// 鏀�鎸佸彇娑堢偣璧�: DELETE /api/likes/{videoId}
</script>

<template>
  <div class="h-full overflow-y-auto px-6 py-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold text-slate-800">鐐硅禐瑙嗛��</h1>
      <p class="text-slate-500 mt-1">浣犵偣璧炶繃鐨勫唴瀹逛細灞曠ず鍦ㄨ繖閲屻€�</p>

      <div v-if="likedList.length > 0" class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4" />

      <div v-else class="mt-6">
        <EmptyStateCard
          title="鏆傛椂娌℃湁鐐硅禐瑙嗛��"
          description="褰撳墠浣跨敤鍏滃簳绌烘€侊紝寰呭悗绔�杩斿洖鍒楄〃鍚庡睍绀虹湡瀹炲唴瀹广€�"
          cta-text="鍘绘帹鑽愰〉"
          @click="navigateTo('/recommend')"
        />
      </div>
    </div>
  </div>
</template>
