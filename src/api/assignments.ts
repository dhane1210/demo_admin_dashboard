import apiClient from './client'
import type { Assignment, PaginatedResponse, ApiResponse } from '../types'

export interface CreateAssignmentInput {
  shipment_id: string
  customer_id?: string
  customer_name: string
  customer_email: string
  notes?: string
}

export const assignmentApi = {
  getAll: (page: number = 1, limit: number = 20, customer_id?: string, shipment_id?: string) => {
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (customer_id) qs.append('customer_id', customer_id)
    if (shipment_id) qs.append('shipment_id', shipment_id)
    return apiClient.get<PaginatedResponse<Assignment>>(`/assignments?${qs}`).then(r => r.data)
  },

  create: (data: CreateAssignmentInput) =>
    apiClient.post<ApiResponse<Assignment>>('/assignments', data).then(r => r.data),

  getByTrackingId: (trackingId: string) =>
    apiClient.get<ApiResponse<Assignment>>(`/assignments/${trackingId}`).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete(`/assignments/${id}`).then(r => r.data),

  sendEmail: (id: string) =>
    apiClient.post<ApiResponse<{ message: string }>>(`/assignments/${id}/send`).then(r => r.data),
}
