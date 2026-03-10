import { toast } from 'vue-sonner'
import { useAuthStore } from '~/stores/auth'

// ================= 1. 核心锁与队列 =================
let isRefreshing = false
let requestsQueue: Array<() => void> = []

// ================= 2. 底层实例 =================
const fetchInstance = $fetch.create({
  onRequest({ options }) {
    const authStore = useAuthStore()
    const token = authStore.accessToken

    options.headers = new Headers(options.headers)
    if (token) {
      options.headers.set('Authorization', `Bearer ${token}`)
    }
    options.timeout = 10000 
  }
  // 💡 删除了原有的 onResponseError，统一集中在外层处理
})

// ================= 3. 终极包装器 =================
export const request = async <T = any>(url: string, options: any = {}): Promise<T> => {
  const authStore = useAuthStore()

  try {
    // 发起真实的请求
    const response = await fetchInstance<any>(url, options)

    // 【情况 A】：HTTP 状态码是 200 的情况
    // 兼容后端不同的字段命名习惯（message 还是 msg）
    const resCode = response.code || response.status
    const resMessage = response.message || response.msg || '业务处理失败'

    if (resCode === 200) {
      return response // 真正成功，放行
    }

    if (resCode === 401) {
      return handleUnauthorized(url, options, authStore) // 走无感刷新
    }

    // HTTP 200 下的业务报错 (如：密码错误)
    toast.error(resMessage)
    return Promise.reject(new Error(resMessage))

  } catch (error: any) {
    // 【情况 B】：HTTP 状态码不是 2xx 的情况 (如后端抛异常导致 HTTP 400 或 500)
    // ofetch 会直接抛出异常跳到这里！我们必须从 error.response._data 中提取报错！
    
    const errorResponse = error.response
    
    // ✨ 核心修复：精准提取后端抛出的真实错误提示（如 "账号已存在"）
    const backendErrorMsg = errorResponse?._data?.message || errorResponse?._data?.msg
    
    // 特殊拦截 HTTP 401 状态码
    if (errorResponse?.status === 401 || errorResponse?._data?.code === 401) {
      return handleUnauthorized(url, options, authStore)
    }

    // 弹出报错提示
    if (backendErrorMsg) {
      // 成功提取到后端的业务提示："账号已存在"
      toast.error(backendErrorMsg)
    } else {
      // 后端连 JSON 都不返回时的兜底机制
      const status = errorResponse?.status
      if (status === 500) toast.error('服务器内部出错了')
      else if (status === 404) toast.error('请求的接口不存在')
      else toast.error('网络连接异常')
    }

    return Promise.reject(error)
  }
}

// ================= 4. 抽离的无感刷新业务代码 =================
const handleUnauthorized = (url: string, options: any, authStore: any): Promise<any> => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      requestsQueue.push(() => {
        resolve(request(url, options)) 
      })
    })
  }

  isRefreshing = true
  return authStore.refreshAccessToken().then(() => {
    requestsQueue.forEach((cb) => cb())
    requestsQueue = []
    return request(url, options) // 重发当前失败的请求
  }).catch((refreshError: any) => {
    requestsQueue = []
    authStore.logout()
    navigateTo('/')
    toast.warning('登录状态已过期，请重新登录')
    return Promise.reject(refreshError)
  }).finally(() => {
    isRefreshing = false
  })
}