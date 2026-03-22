import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile } from '../api/user'
import type { UserProfile } from '../../../shared/src/types'

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
