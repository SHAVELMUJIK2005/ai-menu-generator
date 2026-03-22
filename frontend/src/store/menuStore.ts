import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MenuResponse } from '../../../shared/src/types'

interface MenuState {
  currentMenu: MenuResponse | null
  currentMenuId: string | null
  budget: number
  setMenu: (menu: MenuResponse, id?: string) => void
  setBudget: (budget: number) => void
  clear: () => void
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      currentMenu: null,
      currentMenuId: null,
      budget: 3000,
      setMenu: (menu, id) => set({ currentMenu: menu, currentMenuId: id ?? null }),
      setBudget: (budget) => set({ budget }),
      clear: () => set({ currentMenu: null, currentMenuId: null }),
    }),
    { name: 'menu-store' },
  ),
)
