// app/api/auth.ts
import { request } from '~/utils/request'

export const authApi = {
  // 登录
  login: (data: any) => request<any>('/api/auth/login', { method: 'POST', body: data }),
  
  // 注册
  register: (data: any) => request<any>('/api/auth/register', { method: 'POST', body: data }),
  
  // 刷新 Token
  refresh: (token: string) => request<any>('/api/auth/refresh', { 
    method: 'POST', 
    headers: { Authorization: `Bearer ${token}` } 
  })
}