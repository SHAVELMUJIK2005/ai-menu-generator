import { z } from "zod";

const IngredientSchema = z.object({
  name: z.string(),
  amount: z.number(),
  unit: z.string(),
  price: z.number(),
});

const NutritionSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  fat: z.number(),
  carbs: z.number(),
});

const MealSchema = z.object({
  type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  name: z.string(),
  ingredients: z.array(IngredientSchema),
  recipeShort: z.string(),
  cookingMin: z.number(),
  nutrition: NutritionSchema,
  cost: z.number(),
  videoUrl: z.string().url().optional(), // YouTube URL, добавляется для Premium
});

const DayTotalSchema = z.object({
  cost: z.number(),
  calories: z.number(),
  protein: z.number(),
  fat: z.number(),
  carbs: z.number(),
});

const DayMenuSchema = z.object({
  dayNumber: z.number(),
  meals: z.array(MealSchema),
  dayTotal: DayTotalSchema,
});

const ShoppingItemSchema = z.object({
  name: z.string(),
  totalAmount: z.number(),
  unit: z.string(),
  estimatedPrice: z.number(),
});

export const MenuResponseSchema = z.object({
  days: z.array(DayMenuSchema),
  shoppingList: z.array(ShoppingItemSchema),
  totalCost: z.number(),
  budgetLeft: z.number(),
  confidence: z.enum(["low", "medium", "high"]),
});

export type MenuResponseType = z.infer<typeof MenuResponseSchema>;
