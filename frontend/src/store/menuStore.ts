import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MenuResponse } from '../../../shared/src/types'

interface MenuState {
  currentMenu: MenuResponse | null
  currentMenuId: string | null
  pendingMenuId: string | null
  budget: number
  setMenu: (menu: MenuResponse, id?: string) => void
  setBudget: (budget: number) => void
  setPendingMenuId: (id: string | null) => void
  clear: () => void
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      currentMenu: null,
      currentMenuId: null,
      pendingMenuId: null,
      budget: 3000,
      setMenu: (menu, id) => set({ currentMenu: menu, currentMenuId: id ?? null }),
      setBudget: (budget) => set({ budget }),
      setPendingMenuId: (id) => set({ pendingMenuId: id }),
      clear: () => set({ currentMenu: null, currentMenuId: null }),
    }),
    { name: 'menu-store' },
  ),
)
