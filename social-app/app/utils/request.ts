import { toast } from 'vue-sonner'
import type { FetchOptions } from 'ofetch'

type ApiResult<T = unknown> = {
  code: number
  msg?: string
  message?: string
  data: T
}

type QueueItem = {
  resolve: () => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let requestsQueue: QueueItem[] = []

const TOKEN_ERROR_CODES = [401, 4011, 4012, 4013, 4014]

const fetchInstance = $fetch.create({
  onRequest({ request, options }) {
    const token = useCookie<string | null>('access_token').value
    const url = request.toString()

    options.headers = new Headers(options.headers || {})
    if (token && !url.includes('/refresh')) {
      options.headers.set('Authorization', `Bearer ${token}`)
    }

    options.timeout = 10000
  }
})

type CustomFetchOptions = Parameters<typeof $fetch>[1]

export const request = async <T = unknown>(
  url: string,
  options: CustomFetchOptions = {} as CustomFetchOptions
): Promise<ApiResult<T>> => {
  try {
    const response = await fetchInstance<ApiResult<T>>(url, options as FetchOptions<'json'>)

    const code = response.code
    const message = response.msg || response.message || '请求失败'

    if (code === 1 || code === 200) {
      return response
    }

    if (TOKEN_ERROR_CODES.includes(code) && !url.includes('/refresh')) {
      return handleUnauthorized<T>(url, options as FetchOptions<'json'>)
    }

    toast.error(message)
    throw new Error(message)
  } catch (error: any) {
    const status = error?.response?.status
    const data = error?.response?._data || {}
    const backendCode = data.code
    const backendMessage = data.msg || data.message

    if (
      status === 401 ||
      (TOKEN_ERROR_CODES.includes(backendCode) && !url.includes('/refresh'))
    ) {
      return handleUnauthorized<T>(url, options as FetchOptions<'json'>)
    }

    if (backendMessage) {
      toast.error(backendMessage)
      throw new Error(backendMessage)
    }

    toast.error('网络连接异常，请稍后重试')
    throw error
  }
}

const handleUnauthorized = async <T = unknown>(
  url: string,
  options: FetchOptions<'json'>
): Promise<ApiResult<T>> => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      requestsQueue.push({
        resolve: () => {
          request<T>(url, options as CustomFetchOptions).then(resolve).catch(reject)
        },
        reject
      })
    })
  }

  isRefreshing = true

  try {
    const refreshTokenCookie = useCookie<string | null>('refresh_token')
    if (!refreshTokenCookie.value) {
      throw new Error('登录已过期')
    }

    const refreshRes = await $fetch<ApiResult<{ accessToken?: string; token?: string; refreshToken?: string }>>(
      '/api/auth/refresh',
      {
        method: 'POST',
        body: { refreshToken: refreshTokenCookie.value },
        headers: {
          Authorization: `Bearer ${refreshTokenCookie.value}`
        }
      }
    )

    if (refreshRes.code !== 1 && refreshRes.code !== 200) {
      throw new Error(refreshRes.msg || refreshRes.message || '刷新 Token 失败')
    }

    const accessTokenCookie = useCookie<string | null>('access_token')
    accessTokenCookie.value = refreshRes.data?.accessToken || refreshRes.data?.token || null
    if (refreshRes.data?.refreshToken) {
      refreshTokenCookie.value = refreshRes.data.refreshToken
    }

    requestsQueue.forEach((item) => item.resolve())
    requestsQueue = []

    return await request<T>(url, options as CustomFetchOptions)
  } catch (refreshError) {
    requestsQueue.forEach((item) => item.reject(refreshError))
    requestsQueue = []

    useCookie<string | null>('access_token').value = null
    useCookie<string | null>('refresh_token').value = null

    toast.warning('登录状态已过期，请重新登录')

    if (import.meta.client) {
      window.location.href = '/'
    }

    throw refreshError
  } finally {
    isRefreshing = false
  }
}

