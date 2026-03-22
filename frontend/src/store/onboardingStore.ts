import { create } from 'zustand'
import type { ProfileType, Goal } from '../types'

interface OnboardingState {
  // шаг онбординга (0-4)
  step: number
  // данные профиля
  profileType: ProfileType | null
  goal: Goal | null
  storeChain: string | null
  dislikedProducts: string[]
  agreementAccepted: boolean

  // действия
  setStep: (step: number) => void
  nextStep: () => void
  setProfileType: (type: ProfileType) => void
  setGoal: (goal: Goal) => void
  setStoreChain: (store: string | null) => void
  toggleDislikedProduct: (product: string) => void
  setAgreementAccepted: (val: boolean) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 0,
  profileType: null,
  goal: null,
  storeChain: null,
  dislikedProducts: [],
  agreementAccepted: false,

  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: s.step + 1 })),
  setProfileType: (profileType) => set({ profileType }),
  setGoal: (goal) => set({ goal }),
  setStoreChain: (storeChain) => set({ storeChain }),
  toggleDislikedProduct: (product) =>
    set((s) => ({
      dislikedProducts: s.dislikedProducts.includes(product)
        ? s.dislikedProducts.filter((p) => p !== product)
        : [...s.dislikedProducts, product],
    })),
  setAgreementAccepted: (agreementAccepted) => set({ agreementAccepted }),
  reset: () =>
    set({
      step: 0,
      profileType: null,
      goal: null,
      storeChain: null,
      dislikedProducts: [],
      agreementAccepted: false,
    }),
}))
