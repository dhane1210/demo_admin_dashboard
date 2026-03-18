import apiClient from './client'
import type { Customer, PaginatedResponse, ApiResponse } from '../types'

export const customerApi = {
  getAll: (page = 1, limit = 50) =>
    apiClient.get<PaginatedResponse<Customer>>(`/customers?page=${page}&limit=${limit}`).then(r => r.data),

  getDetail: (id: string) =>
    apiClient.get<ApiResponse<Customer>>(`/customers/${id}`).then(r => r.data),

  create: (data: Partial<Customer>) =>
    apiClient.post<ApiResponse<Customer>>('/customers', data).then(r => r.data),

  update: (id: string, data: Partial<Customer>) =>
    apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete(`/customers/${id}`).then(r => r.data),
}
