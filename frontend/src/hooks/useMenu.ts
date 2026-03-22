import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { generateMenu, getMenuHistory, getMenu, rerollMenu, rateMenu, substituteMeal } from '../api/menu'
import type { GenerateMenuRequest, RateMenuRequest, SubstituteMealRequest } from '../../../shared/src/types'

export function useGenerateMenu() {
  return useMutation({
    mutationFn: (request: GenerateMenuRequest) => generateMenu(request),
  })
}

export function useMenuHistory(page = 1) {
  return useQuery({
    queryKey: ['menu-history', page],
    queryFn: () => getMenuHistory(page),
  })
}

export function useMenu(id: string) {
  return useQuery({
    queryKey: ['menu', id],
    queryFn: () => getMenu(id),
    enabled: !!id,
  })
}

export function useRerollMenu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rerollMenu(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['menu', id] })
      queryClient.invalidateQueries({ queryKey: ['menu-history'] })
    },
  })
}

export function useRateMenu() {
  return useMutation({
    mutationFn: ({ id, ...request }: { id: string } & RateMenuRequest) =>
      rateMenu(id, request),
  })
}

export function useSubstituteMeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...request }: { id: string } & SubstituteMealRequest) =>
      substituteMeal(id, request),
    onSuccess: (data, { id }) => {
      // Обновляем кэш с новым меню (замена блюда)
      queryClient.setQueryData(['menu', id], data)
    },
  })
}
