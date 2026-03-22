// Shared types for AI Menu Generator

export interface User {
  id: string;
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  createdAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
  priceRub: number;
  ingredients: Ingredient[];
}

export interface Ingredient {
  name: string;
  weightGrams: number;
  priceRub: number;
  store?: string;
}

export interface MenuPlan {
  id: string;
  userId: string;
  weekStart: Date;
  days: DayMenu[];
  totalBudgetRub: number;
  createdAt: Date;
}

export interface DayMenu {
  date: Date;
  breakfast: MenuItem;
  lunch: MenuItem;
  dinner: MenuItem;
  snacks: MenuItem[];
  totalCalories: number;
  totalPriceRub: number;
}

export interface UserPreferences {
  userId: string;
  weeklyBudgetRub: number;
  dailyCalories?: number;
  dietType?: DietType;
  excludedIngredients: string[];
  preferredStores: string[];
}

export type DietType = 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'lowCarb';

export interface GenerateMenuRequest {
  userId: string;
  weeklyBudgetRub: number;
  preferences: Partial<UserPreferences>;
}

export interface GenerateMenuResponse {
  menuPlan: MenuPlan;
  estimatedTotalCost: number;
  savingsTips: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
