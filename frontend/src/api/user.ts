import { apiClient } from './client'
import type { UserProfile, UserStats } from '../../../shared/src/types'

export async function getProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<UserProfile>('/user/profile')
  return data
}

export async function updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const { data } = await apiClient.put<UserProfile>('/user/profile', profile)
  return data
}

export async function getStats(): Promise<UserStats> {
  const { data } = await apiClient.get<UserStats>('/user/stats')
  return data
}
