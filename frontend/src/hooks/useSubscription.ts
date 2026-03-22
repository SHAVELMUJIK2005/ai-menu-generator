import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSubscriptionStatus, activatePremiumDev, createInvoiceLink } from '../api/subscription'

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscriptionStatus,
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: false,
  })
}

// Покупка Premium через Telegram Stars
export function useBuyPremium() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const invoiceUrl = await createInvoiceLink()
      // Открываем встроенный платёжный экран Telegram через window.Telegram.WebApp
      const tgApp = (window as Window & { Telegram?: { WebApp?: { openInvoice?: (url: string, cb: (status: string) => void) => void } } }).Telegram?.WebApp
      if (!tgApp?.openInvoice) throw new Error('Telegram WebApp not available')
      return new Promise<void>((resolve, reject) => {
        tgApp.openInvoice!(invoiceUrl, (status: string) => {
          if (status === 'paid') resolve()
          else reject(new Error(status))
        })
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
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
