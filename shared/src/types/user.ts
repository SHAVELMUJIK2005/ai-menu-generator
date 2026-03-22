export type ProfileType = 'STUDENT' | 'SPORT' | 'FAMILY' | 'SINGLE' | 'OFFICE'
export type Goal = 'LOSE_WEIGHT' | 'GAIN_WEIGHT' | 'HEALTHY' | 'CHEAP'
export type Region = 'MOSCOW' | 'SPB' | 'OTHER'
export type CookingSkill = 'BEGINNER' | 'BASIC' | 'ADVANCED'

export interface UserProfile {
  profileType: ProfileType
  goal: Goal
  dietaryRestrictions: string[]
  allergies: string[]
  dislikedProducts: string[]
  region: Region
  cookingSkill: CookingSkill
  equipment: string[]
  isPremium: boolean
}
