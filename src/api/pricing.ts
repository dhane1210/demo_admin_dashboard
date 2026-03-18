import apiClient from './client'
import type { Job, Pricing, PricingInput, PaginatedResponse, ApiResponse } from '../types'

export const pricingApi = {
  getJobs: (page = 1, limit = 50) =>
    apiClient.get<PaginatedResponse<Job>>(`/jobs?page=${page}&limit=${limit}`).then(r => r.data),

  getJobDetail: (id: string) =>
    apiClient.get<ApiResponse<Job>>(`/jobs/${id}`).then(r => r.data),

  createJob: (data: Partial<Job>) =>
    apiClient.post<ApiResponse<Job>>('/jobs', data).then(r => r.data),

  updateJob: (id: string, data: Partial<Job>) =>
    apiClient.patch<ApiResponse<Job>>(`/jobs/${id}`, data).then(r => r.data),

  calculatePricing: (jobId: string, input: PricingInput) =>
    apiClient.post<ApiResponse<Pricing>>(`/pricing/${jobId}`, input).then(r => r.data),

  getPricing: (jobId: string) =>
    apiClient.get<ApiResponse<Pricing>>(`/pricing/${jobId}`).then(r => r.data),
}
