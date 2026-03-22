export type SubscriptionPlan = 'FREE' | 'PREMIUM'

export interface SubscriptionStatus {
  isPremium: boolean
  premiumUntil: string | null // ISO date string
  plan: SubscriptionPlan
  priceStars?: number // цена Premium в Telegram Stars
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
