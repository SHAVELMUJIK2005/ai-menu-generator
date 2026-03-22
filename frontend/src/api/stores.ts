import { apiClient } from './client'

export interface StoreInfo {
  chain: string
  name: string
  priceTag: string
  multiplier: number
}

export async function getStores(): Promise<StoreInfo[]> {
  const { data } = await apiClient.get<StoreInfo[]>('/stores')
  return data
}
