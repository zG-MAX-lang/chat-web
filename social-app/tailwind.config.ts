// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  // 确保包含所有可能使用 Tailwind 类的文件路径
  content: [
    './app/**/*.{js,vue,ts}', // 针对 Nuxt 4 的 app 目录结构
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        sunset: {
          'cream': '#FFFDF7', 
          'orange': '#FF8C42', 
          'rose': '#F75C5C',   
          'purple': '#6A4C93', 
          'dark': '#4A3F35',   
          'muted': '#8A7F75',  
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config