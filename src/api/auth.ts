import apiClient from './client'
import type { ApiResponse } from '../types'

export const authApi = {
  login: (credentials: { username: string; password: any }) =>
    apiClient.post<ApiResponse<{ token: string }>>('/auth/login', credentials).then(r => r.data),
}
