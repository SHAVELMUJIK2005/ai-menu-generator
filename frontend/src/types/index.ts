// Shared API types (inlined from shared/src/types for standalone frontend deployment)

// user.ts
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

// menu.ts
export interface GenerateMenuRequest {
  budget: number
  days: 3 | 7
  storeChain?: string
  profileType: ProfileType
  goal: Goal
  restrictions: string[]
  allergies: string[]
  dislikedProducts: string[]
}

export interface Nutrition {
  calories: number
  protein: number
  fat: number
  carbs: number
}

export interface Ingredient {
  productId?: string
  name: string
  amount: number
  unit: string
  price: number
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  name: string
  ingredients: Ingredient[]
  recipeShort: string
  cookingMin: number
  nutrition: Nutrition
  cost: number
  videoUrl?: string
}

export interface DayTotal {
  cost: number
  calories: number
  protein: number
  fat: number
  carbs: number
}

export interface DayMenu {
  dayNumber: number
  meals: Meal[]
  dayTotal: DayTotal
}

export interface ShoppingItem {
  name: string
  totalAmount: number
  unit: string
  estimatedPrice: number
}

export interface MenuResponse {
  days: DayMenu[]
  shoppingList: ShoppingItem[]
  totalCost: number
  budgetLeft: number
  confidence: 'low' | 'medium' | 'high'
}

// api.ts
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

// auth.ts
export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse extends TokenPair {
  userId: string
  telegramId: string
  username?: string
  displayName?: string
}

// subscription.ts
export type SubscriptionPlan = 'FREE' | 'PREMIUM'

export interface SubscriptionStatus {
  isPremium: boolean
  premiumUntil: string | null
  plan: SubscriptionPlan
  priceStars?: number
}

export interface FavoriteMenu {
  userId: string
  menuId: string
  createdAt: string
  menu: {
    id: string
    parsedMenu: unknown
    shoppingList: unknown
    budgetInput: number
    daysCount: number
    status: string
    aiModel: string
    createdAt: string
  }
}
