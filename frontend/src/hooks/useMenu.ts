import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { generateMenu, getMenuHistory, getMenu, rerollMenu, rateMenu, substituteMeal } from '../api/menu'
import type { GenerateMenuRequest, RateMenuRequest, SubstituteMealRequest } from '../../../shared/src/types'

/**
 * Запускает генерацию меню и возвращает текущее состояние задачи.
 * После получения menuId — автоматически поллит GET /menu/:id через useMenu.
 */
export function useGenerateMenu() {
  const [pendingMenuId, setPendingMenuId] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (request: GenerateMenuRequest) => generateMenu(request),
    onSuccess: (data) => {
      setPendingMenuId(data.menuId)
    },
  })

  const menuQuery = useMenu(pendingMenuId ?? '')

  return {
    ...mutation,
    pendingMenuId,
    // Готовое меню — доступно когда status DONE
    menuData: menuQuery.data,
    menuStatus: menuQuery.data?.status ?? (pendingMenuId ? 'PENDING' : null),
    isGenerating: mutation.isPending || menuQuery.data?.status === 'PENDING',
  }
}

export function useMenuHistory(page = 1) {
  return useQuery({
    queryKey: ['menu-history', page],
    queryFn: () => getMenuHistory(page),
  })
}

/**
 * Поллинг меню: когда статус PENDING — опрашиваем каждые 2 секунды.
 * Когда DONE или FAILED — останавливаемся.
 */
export function useMenu(id: string) {
  return useQuery({
    queryKey: ['menu', id],
    queryFn: () => getMenu(id),
    enabled: !!id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    refetchInterval: (query: any) => {
      const status = (query.state?.data as any)?.status
      if (status === 'PENDING') return 2000
      return false
    },
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
