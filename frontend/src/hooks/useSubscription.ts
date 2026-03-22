import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSubscriptionStatus, activatePremiumDev, createInvoiceLink } from '../api/subscription'
import { useWebApp } from '@tma.js/sdk-react'

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscriptionStatus,
    staleTime: 5 * 60 * 1000, // 5 минут
  })
}

// Покупка Premium через Telegram Stars
export function useBuyPremium() {
  const webApp = useWebApp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const invoiceUrl = await createInvoiceLink()
      // Открываем встроенный платёжный экран Telegram
      return new Promise<void>((resolve, reject) => {
        webApp.openInvoice(invoiceUrl, (status: string) => {
          if (status === 'paid') {
            resolve()
          } else if (status === 'cancelled' || status === 'failed') {
            reject(new Error(status))
          }
        })
      })
    },
    onSuccess: () => {
      // Обновляем статус подписки после успешной оплаты
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
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
