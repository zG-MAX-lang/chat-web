import tailwindcss from '@tailwindcss/vite'; // 导入插件
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  // 移除 modules 数组中的 '@nuxtjs/tailwindcss'
  modules: [
    '@vueuse/nuxt' // 如果你有这个模块，保留它
  ],
  // 添加 CSS 入口文件
  css: ['~/assets/css/main.css'],
  // 配置 Vite 插件
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})