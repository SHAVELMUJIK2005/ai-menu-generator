import { useQuery } from '@tanstack/react-query'
import { getStores } from '../api/stores'

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: getStores,
    staleTime: Infinity, // список магазинов не меняется
  })
}
