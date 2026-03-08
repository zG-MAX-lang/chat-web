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
  },
  // ✨ 新增：全局路由代理转发规则
  routeRules: {
    // 1. 将所有以 /api/ 开头的请求，转发到后端的 8089 端口
    '/api/**': { 
      proxy: 'http://localhost:8089/api/**' 
    },
    // 2. 将滑块验证码 /captcha/ 开头的请求，也转发到 8089 端口
    '/captcha/**': { 
      proxy: 'http://localhost:8089/captcha/**' 
    }
  }
})