export type ProfileType = 'STUDENT' | 'SPORT' | 'FAMILY' | 'SINGLE' | 'OFFICE'
export type Goal = 'LOSE_WEIGHT' | 'GAIN_WEIGHT' | 'HEALTHY' | 'CHEAP'
export type Region = 'MOSCOW' | 'SPB' | 'OTHER'
export type CookingSkill = 'BEGINNER' | 'BASIC' | 'ADVANCED'

export interface UserProfile {
  id: string
  telegramId: string
  username?: string
  displayName?: string
  profileType: ProfileType | null
  goal: Goal | null
  dietaryRestrictions: string[]
  allergies: string[]
  dislikedProducts: string[]
  region: Region | null
  cookingSkill: CookingSkill | null
  equipment: string[]
  isPremium: boolean
  premiumUntil: string | null
}

export interface UserStats {
  totalMenus: number
  todayGenerations: number
  dailyLimit: number | null
  generationsLeft: number | null
}
