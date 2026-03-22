import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MenuResponse } from '../types'

interface MenuState {
  currentMenu: MenuResponse | null
  currentMenuId: string | null
  budget: number
  days: 3 | 7
  likedMeals: string[]
  setMenu: (menu: MenuResponse, id?: string) => void
  setBudget: (budget: number) => void
  setDays: (days: 3 | 7) => void
  toggleLikedMeal: (mealName: string) => void
  clear: () => void
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      currentMenu: null,
      currentMenuId: null,
      budget: 3000,
      days: 3,
      likedMeals: [],
      setMenu: (menu, id) => set({ currentMenu: menu, currentMenuId: id ?? null }),
      setBudget: (budget) => set({ budget }),
      setDays: (days) => set({ days }),
      toggleLikedMeal: (mealName) =>
        set((s) => ({
          likedMeals: s.likedMeals.includes(mealName)
            ? s.likedMeals.filter((n) => n !== mealName)
            : [...s.likedMeals, mealName],
        })),
      clear: () => set({ currentMenu: null, currentMenuId: null }),
    }),
    { name: 'menu-store' },
  ),
)
