import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getFavorites, addFavorite, removeFavorite } from '../api/favorites'

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
  })
}

export function useAddFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (menuId: string) => addFavorite(menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (menuId: string) => removeFavorite(menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}
