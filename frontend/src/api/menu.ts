import { apiClient } from './client'
import type { GenerateMenuRequest, MenuResponse, MenuRating, RateMenuRequest, SubstituteMealRequest } from '../../../shared/src/types'

export interface GenerateMenuJobResponse {
  menuId: string
  status: 'PENDING'
}

export async function generateMenu(request: GenerateMenuRequest): Promise<GenerateMenuJobResponse> {
  const { data } = await apiClient.post<GenerateMenuJobResponse>('/menu/generate', request)
  return data
}

export async function getMenuHistory(page = 1, limit = 20) {
  const { data } = await apiClient.get('/menu/history', { params: { page, limit } })
  return data
}

export async function getMenu(id: string): Promise<MenuResponse> {
  const { data } = await apiClient.get<MenuResponse>(`/menu/${id}`)
  return data
}

export async function rerollMenu(id: string): Promise<MenuResponse> {
  const { data } = await apiClient.post<MenuResponse>(`/menu/${id}/reroll`)
  return data
}

export async function rateMenu(id: string, request: RateMenuRequest): Promise<MenuRating> {
  const { data } = await apiClient.post<MenuRating>(`/menu/${id}/rate`, request)
  return data
}

export async function substituteMeal(id: string, request: SubstituteMealRequest): Promise<MenuResponse> {
  const { data } = await apiClient.post<MenuResponse>(`/menu/${id}/substitute`, request)
  return data
}
