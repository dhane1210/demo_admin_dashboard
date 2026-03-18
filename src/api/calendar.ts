import apiClient from './client'
import type { CalendarEvent, ApiResponse } from '../types'

export const calendarApi = {
  getEvents: (params?: { start_date?: string; end_date?: string }) => {
    const qs = new URLSearchParams()
    if (params?.start_date) qs.append('start_date', params.start_date)
    if (params?.end_date) qs.append('end_date', params.end_date)
    return apiClient.get<ApiResponse<CalendarEvent[]>>(`/calendar/events?${qs}`).then(r => r.data)
  },

  createEvent: (data: Partial<CalendarEvent>) =>
    apiClient.post<ApiResponse<CalendarEvent>>('/calendar/events', data).then(r => r.data),

  updateEvent: (id: string, data: Partial<CalendarEvent>) =>
    apiClient.patch<ApiResponse<CalendarEvent>>(`/calendar/events/${id}`, data).then(r => r.data),

  deleteEvent: (id: string) =>
    apiClient.delete(`/calendar/events/${id}`).then(r => r.data),

  syncFromShipments: () =>
    apiClient.post('/calendar/events/sync').then(r => r.data),
}
