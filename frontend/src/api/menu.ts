import { apiClient } from './client'
import type { GenerateMenuRequest, MenuResponse } from '../../../shared/src/types'

export async function generateMenu(request: GenerateMenuRequest): Promise<MenuResponse> {
  const { data } = await apiClient.post<MenuResponse>('/menu/generate', request)
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
