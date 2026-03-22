import { apiClient } from './client'
import type { UserProfile } from '../../../shared/src/types'

export async function getProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<UserProfile>('/user/profile')
  return data
}

export async function updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const { data } = await apiClient.put<UserProfile>('/user/profile', profile)
  return data
}
