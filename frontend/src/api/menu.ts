import { apiClient } from './client'
import type { GenerateMenuRequest, MenuResponse } from '../types'

// Бэкенд возвращает MenuResponse + id созданного меню
export interface GenerateMenuApiResponse extends MenuResponse {
  id: string
}

export async function generateMenu(request: GenerateMenuRequest): Promise<GenerateMenuApiResponse> {
  const { data } = await apiClient.post<GenerateMenuApiResponse>('/menu/generate', request)
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

export async function rateMenu(id: string, rating: number): Promise<void> {
  await apiClient.post(`/menu/${id}/rate`, { rating })
}

export async function substituteMenu(
  id: string,
  dayNumber: number,
  mealType: string,
): Promise<MenuResponse> {
  const { data } = await apiClient.post<MenuResponse>(`/menu/${id}/substitute`, { dayNumber, mealType })
  return data
}
