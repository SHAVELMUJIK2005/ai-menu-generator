import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile, getStats } from '../api/user'
import type { UserProfile } from '../types'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    retry: false,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useStats() {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: getStats,
    staleTime: 60 * 1000, // 1 минута
    retry: false,
  })
}
