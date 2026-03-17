// app/api/common.ts
import { request } from '~/utils/request'

export const commonApi = {
  // 上传文件 (图片、视频等)
  upload: (formData: FormData) => request<any>('/api/upload', { method: 'POST', body: formData })
}