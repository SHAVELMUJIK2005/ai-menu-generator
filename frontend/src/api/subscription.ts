import { apiClient } from './client'
import type { SubscriptionStatus } from '../../../shared/src/types'

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const { data } = await apiClient.get<SubscriptionStatus>('/subscription/status')
  return data
}

// Только для разработки
export async function activatePremiumDev(): Promise<SubscriptionStatus> {
  const { data } = await apiClient.post<SubscriptionStatus>('/subscription/activate-dev')
  return data
}
