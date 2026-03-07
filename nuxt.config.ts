// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@vueuse/motion/nuxt',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt', // ✨ 必须有这一行，Nuxt 才会自动帮你执行 app.use(pinia)
    '@vueuse/nuxt', // 顺便检查一下 vueuse 的模块有没有加上
  ],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  }
})