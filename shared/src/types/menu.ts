import type { ProfileType, Goal } from './user'

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
  videoUrl?: string // опциональная ссылка на YouTube рецепт
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

export interface MenuRating {
  id: number
  menuId: string
  userId: string
  stars: number
  comment?: string
  createdAt: string
}

export interface RateMenuRequest {
  stars: number  // 1-5
  comment?: string
}

export interface SubstituteMealRequest {
  dayNumber: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
}
