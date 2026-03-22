export const MENU_QUEUE = "menu-generation";

export interface MenuJobData {
  menuId: string;
  userId: string;
  daysCount: number;
  budgetInput: number;
  storeChain?: string;
}
