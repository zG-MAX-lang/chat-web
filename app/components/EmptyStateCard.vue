<script setup lang="ts">
defineProps<{
  title: string
  description: string
  ctaText?: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div class="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur-sm p-8 text-center shadow-sm">
    <p class="text-lg font-semibold text-slate-700">{{ title }}</p>
    <p class="mt-2 text-sm text-slate-500">{{ description }}</p>
    <button
      v-if="ctaText"
      class="mt-5 rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      @click="emit('click')"
    >
      {{ ctaText }}
    </button>
  </div>
</template>
