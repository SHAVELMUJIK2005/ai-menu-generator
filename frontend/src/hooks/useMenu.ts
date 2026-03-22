import { useMutation, useQuery } from '@tanstack/react-query'
import { generateMenu, getMenuHistory, rerollMenu } from '../api/menu'
import type { GenerateMenuRequest } from '../../../shared/src/types'

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

export function useRerollMenu() {
  return useMutation({
    mutationFn: (id: string) => rerollMenu(id),
  })
}
