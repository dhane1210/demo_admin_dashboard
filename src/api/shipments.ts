import apiClient from './client'
import type { Shipment, PaginatedResponse, ApiResponse, ShipmentSearchParams } from '../types'

export const shipmentApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get<PaginatedResponse<Shipment>>(`/shipments?page=${page}&limit=${limit}`).then(r => r.data),

  getDashboardStats: () =>
    apiClient.get<ApiResponse<Record<string, number>>>('/shipments/dashboard').then(r => r.data),

  search: (params: ShipmentSearchParams) => {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.append(k, String(v)) })
    return apiClient.get<PaginatedResponse<Shipment>>(`/shipments/search?${qs}`).then(r => r.data)
  },

  getDetail: (id: string) =>
    apiClient.get<ApiResponse<Shipment>>(`/shipments/${id}`).then(r => r.data),

  create: (data: Partial<Shipment>) =>
    apiClient.post<ApiResponse<Shipment>>('/shipments', data).then(r => r.data),

  update: (id: string, data: Partial<Shipment>) =>
    apiClient.patch<ApiResponse<Shipment>>(`/shipments/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete(`/shipments/${id}`).then(r => r.data),

  track: (shipment_number: string, sealine?: string) =>
    apiClient.post<ApiResponse<Shipment>>('/shipments/track', { shipment_number, sealine }).then(r => r.data),
}
