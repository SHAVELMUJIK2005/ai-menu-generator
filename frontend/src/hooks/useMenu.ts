import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { generateMenu, getRawMenu, getMenuHistory, rerollMenu, rateMenu, substituteMenu } from '../api/menu'
import type { GenerateMenuRequest } from '../types'

export function useGenerateMenu() {
  return useMutation({
    mutationFn: (request: GenerateMenuRequest) => generateMenu(request),
  })
}

export function useRerollMenu() {
  return useMutation({
    mutationFn: (id: string) => rerollMenu(id),
  })
}

export function useMenuHistory(page = 1) {
  return useQuery({
    queryKey: ['menu-history', page],
    queryFn: () => getMenuHistory(page),
  })
}

export function useMenuStatus(id: string) {
  return useQuery({
    queryKey: ['menu', id],
    queryFn: () => getRawMenu(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = (query.state?.data as { status?: string } | undefined)?.status
      if (!status || status === 'PENDING') return 2000
      return false
    },
    refetchIntervalInBackground: true,
  })
}

export function useRateMenu() {
  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) => rateMenu(id, rating),
  })
}

export function useSubstituteMenu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dayNumber, mealType }: { id: string; dayNumber: number; mealType: string }) =>
      substituteMenu(id, dayNumber, mealType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-history'] })
    },
  })
}
