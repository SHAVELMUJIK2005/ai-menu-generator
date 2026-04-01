import { apiClient } from './client'
import type { GenerateMenuRequest, MenuResponse } from '../types'

// Реальная структура ответа GET /menu/:id от Prisma
interface MenuRecord {
  id: string
  status: 'PENDING' | 'DONE' | 'ERROR' | 'FAILED'
  parsedMenu: MenuResponse | null
  daysCount: number
  budgetInput: number
}

export interface GeneratePendingResponse {
  menuId: string
  status: string
}

export interface GenerateMenuApiResponse extends MenuResponse {
  id: string
}

export async function generateMenu(request: GenerateMenuRequest): Promise<GenerateMenuApiResponse> {
  const { data } = await apiClient.post<GeneratePendingResponse>('/menu/generate', request)
  // Бэкенд вернул PENDING — поллим до готовности (макс 120 сек)
  return pollMenuReady(data.menuId)
}

export async function getMenuHistory(page = 1, limit = 20) {
  const { data } = await apiClient.get('/menu/history', { params: { page, limit } })
  return data
}

export async function getRawMenu(id: string): Promise<MenuRecord> {
  const { data } = await apiClient.get<MenuRecord>(`/menu/${id}`)
  return data
}

async function pollMenuReady(menuId: string): Promise<GenerateMenuApiResponse> {
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000))
    const record = await getRawMenu(menuId)
    if (record.status === 'DONE' && record.parsedMenu?.days?.length) {
      return { ...record.parsedMenu, id: menuId }
    }
    if (record.status === 'FAILED' || record.status === 'ERROR') {
      throw new Error('Генерация меню завершилась с ошибкой')
    }
  }
  throw new Error('Timeout: меню не готово за 2 минуты')
}

export async function rerollMenu(id: string): Promise<MenuResponse> {
  const { data } = await apiClient.post<GeneratePendingResponse>(`/menu/${id}/reroll`)
  const targetId = data.menuId ?? id
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000))
    const record = await getRawMenu(targetId)
    if (record.status === 'DONE' && record.parsedMenu?.days?.length) {
      return { ...record.parsedMenu, id: targetId } as MenuResponse
    }
    if (record.status === 'FAILED' || record.status === 'ERROR') {
      throw new Error('Перегенерация завершилась с ошибкой')
    }
  }
  throw new Error('Reroll timeout')
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
