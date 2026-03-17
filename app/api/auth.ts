import { request } from '~/utils/request'

export const authApi = {
  login: (data: any) => request<any>('/api/auth/login', { method: 'POST', body: data }),
  register: (data: any) => request<any>('/api/auth/register', { method: 'POST', body: data }),
  refresh: (token: string) =>
    request<any>('/api/auth/refresh', {
      method: 'POST',
      body: { refreshToken: token },
      headers: { Authorization: `Bearer ${token}` }
    }),
  updateUserInfo: (data: any) => request<any>('/api/auth/update', { method: 'POST', body: data })
}
