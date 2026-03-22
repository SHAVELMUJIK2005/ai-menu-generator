import { apiClient } from './client'
import type { FavoriteMenu } from '../types'

export async function getFavorites(): Promise<FavoriteMenu[]> {
  const { data } = await apiClient.get<FavoriteMenu[]>('/favorites')
  return data
}

export async function addFavorite(menuId: string): Promise<void> {
  await apiClient.post(`/favorites/${menuId}`)
}

export async function removeFavorite(menuId: string): Promise<void> {
  await apiClient.delete(`/favorites/${menuId}`)
}
