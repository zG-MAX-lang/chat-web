<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const favoriteList: Array<any> = []

// TODO(backend): 瀵规帴 GET /api/favorites?page=1&pageSize=20
// 鏂板�炴敹钘�: POST /api/favorites { videoId, folderId? }
// 鍙栨秷鏀惰棌: DELETE /api/favorites/{videoId}
</script>

<template>
  <div class="h-full overflow-y-auto px-6 py-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold text-slate-800">鎴戠殑鏀惰棌</h1>
      <p class="text-slate-500 mt-1">鏀惰棌澶逛腑鐨勮�嗛�戜細鍦ㄨ繖閲屽睍绀恒€�</p>

      <div v-if="favoriteList.length > 0" class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4" />

      <div v-else class="mt-6">
        <EmptyStateCard
          title="鏀惰棌澶规殏鏃犲唴瀹�"
          description="褰撳墠涓哄厹搴曠┖鎬佸睍绀猴紝绛夊緟鍚庣��鏁版嵁鎺ュ叆銆�"
          cta-text="鍘诲彂鐜板唴瀹�"
          @click="navigateTo('/recommend')"
        />
      </div>
    </div>
  </div>
</template>
