import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSubscriptionStatus, activatePremiumDev } from '../api/subscription'

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscriptionStatus,
    staleTime: 5 * 60 * 1000, // 5 минут
  })
}

// Только для разработки
export function useActivatePremiumDev() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: activatePremiumDev,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
