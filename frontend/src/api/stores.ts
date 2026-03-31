import { apiClient } from './client'

export interface StoreInfo {
  chain: string
  name: string
  priceTag: string
  multiplier: number
  iconUrl?: string
}

export interface StorePriceComparison {
  store: string
  storeName: string
  storeIcon?: string
  priceTag: string
  totalCost: number
  foundCount: number
  totalItems: number
  isCheapest: boolean
  items: Array<{ name: string; price: number; isPromo: boolean }>
}

export async function getStores(): Promise<StoreInfo[]> {
  const { data } = await apiClient.get<StoreInfo[]>('/stores')
  return data
}

export async function compareShoppingList(
  items: Array<{ name: string; totalAmount: number; unit?: string }>,
  region?: string,
): Promise<StorePriceComparison[]> {
  const { data } = await apiClient.post<StorePriceComparison[]>('/stores/compare', { items, region })
  return data
}
