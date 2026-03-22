import { useQuery, useMutation } from '@tanstack/react-query'
import { getStores, compareShoppingList } from '../api/stores'

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: getStores,
    staleTime: Infinity,
  })
}

export function useComparePrices() {
  return useMutation({
    mutationFn: ({ items, region }: {
      items: Array<{ name: string; totalAmount: number; unit?: string }>
      region?: string
    }) => compareShoppingList(items, region),
  })
}
