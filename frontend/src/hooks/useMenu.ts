import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { generateMenu, getMenuHistory, getMenu, rerollMenu, rateMenu, substituteMeal } from '../api/menu'
import type { MenuRecord } from '../api/menu'
import type { GenerateMenuRequest, RateMenuRequest, SubstituteMealRequest } from '../../../shared/src/types'
import { useMenuStore } from '../store/menuStore'

/**
 * Единый хук для генерации и reroll меню.
 * pendingMenuId персистируется в store (localStorage) — выживает при
 * перезагрузке WebView на мобильном Telegram.
 */
export function useMenuJob() {
  const { pendingMenuId, setPendingMenuId } = useMenuStore()

  const generateMutation = useMutation({
    mutationFn: (request: GenerateMenuRequest) => generateMenu(request),
    onSuccess: (data) => setPendingMenuId(data.menuId),
  })

  const rerollMutation = useMutation({
    mutationFn: (id: string) => rerollMenu(id),
    onSuccess: (data) => setPendingMenuId(data.menuId),
  })

  const menuQuery = useMenu(pendingMenuId ?? '')
  const menuStatus = menuQuery.data?.status ?? (pendingMenuId ? 'PENDING' : null)

  return {
    startGenerate: generateMutation.mutate,
    startReroll: rerollMutation.mutate,
    isPending: generateMutation.isPending || rerollMutation.isPending,
    pendingMenuId,
    menuData: menuQuery.data,
    menuStatus,
    isActive:
      generateMutation.isPending ||
      rerollMutation.isPending ||
      menuQuery.data?.status === 'PENDING',
    error: generateMutation.error || rerollMutation.error,
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
 */
export function useMenu(id: string) {
  return useQuery<MenuRecord>({
    queryKey: ['menu', id],
    queryFn: () => getMenu(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = (query.state?.data as MenuRecord | undefined)?.status
      if (!status || status === 'PENDING') return 2000
      return false
    },
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
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
      queryClient.setQueryData(['menu', id], (old: MenuRecord | undefined) =>
        old ? { ...old, parsedMenu: data } : old,
      )
    },
  })
}
