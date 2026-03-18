import apiClient from './client'
import type { Alert, PaginatedResponse, ApiResponse } from '../types'

export const alertApi = {
  getAll: (params?: { status?: string; severity?: string; page?: number; limit?: number; shipment_id?: string }) => {
    const qs = new URLSearchParams()
    const effectiveParams = {
      page: 1, // Default page
      limit: 50, // Default limit
      ...params, // Override with provided params
    };

    Object.entries(effectiveParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        qs.append(k, String(v));
      }
    });
    return apiClient.get<PaginatedResponse<Alert>>(`/alerts?${qs}`).then(r => r.data)
  },

  getDetail: (id: string) =>
    apiClient.get<ApiResponse<Alert>>(`/alerts/${id}`).then(r => r.data),

  create: (data: Partial<Alert>) =>
    apiClient.post<ApiResponse<Alert>>('/alerts', data).then(r => r.data),

  update: (id: string, data: Partial<Alert>) =>
    apiClient.patch<ApiResponse<Alert>>(`/alerts/${id}`, data).then(r => r.data),

  acknowledge: (id: string, action_taken?: string) =>
    apiClient.patch<ApiResponse<Alert>>(`/alerts/${id}/acknowledge`, { action_taken }).then(r => r.data),

  resolve: (id: string, resolved_by?: string, action_taken?: string) =>
    apiClient.patch<ApiResponse<Alert>>(`/alerts/${id}/resolve`, { resolved_by, action_taken }).then(r => r.data),
}
