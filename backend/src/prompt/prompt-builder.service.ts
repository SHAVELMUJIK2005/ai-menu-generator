import { Injectable } from "@nestjs/common";
import { ProfileType, Goal, Region, StoreChain } from "@prisma/client";
import { STORE_LABELS, STORE_MULTIPLIERS } from "../store/store.service";

interface UserContext {
  profileType?: ProfileType | null;
  goal?: Goal | null;
  region?: Region | null;
  dietaryRestrictions: string[];
  allergies: string[];
  dislikedProducts: string[];
  cookingSkill?: string | null;
}

interface ProductForPrompt {
  canonicalName: string;
  category: string;
  unit: string;
  avgPriceRub: unknown;
  caloriesPer100g: unknown;
  proteinPer100g: unknown;
  fatPer100g: unknown;
  carbsPer100g: unknown;
}

@Injectable()
export class PromptBuilderService {
  buildSystemPrompt(): string {
    return `Ты — опытный нутрициолог и кулинар, составляющий реальные меню для россиян.
Ты НЕ врач и НЕ даёшь медицинских рекомендаций.
Ты работаешь строго с реальными продуктами из российских магазинов.

ТРЕБОВАНИЯ К БЛЮДАМ:
- Называй блюда конкретно: не "каша с мясом", а "гречневая каша с тушёной свининой и луком"
- Завтрак: каши, омлеты, сырники, бутерброды, йогурт с фруктами — сытные и быстрые
- Обед: первое (суп/борщ/щи) ИЛИ полноценное горячее с гарниром
- Ужин: горячее блюдо — мясо/рыба/птица с овощами или гарниром
- Перекус: лёгкий — фрукты, орехи, кефир, творог
- Используй разные методы готовки: варка, тушение, запекание, жарка, пароварка
- recipeShort — 2-3 предложения с конкретными шагами (что делать, не просто "приготовить")

Всегда отвечай ТОЛЬКО валидным JSON без пояснений, markdown или лишних символов.`;
  }

  buildUserContext(user: UserContext): string {
    const profileMap: Record<string, string> = {
      STUDENT: "студент",
      SPORT: "спортсмен",
      FAMILY: "семья",
      SINGLE: "один человек",
      OFFICE: "офисный работник",
    };
    const goalMap: Record<string, string> = {
      LOSE_WEIGHT: "снижение веса",
      GAIN_WEIGHT: "набор мышечной массы",
      HEALTHY: "правильное питание",
      CHEAP: "максимальная экономия",
    };

    const regionMap: Record<string, string> = {
      MOSCOW: "Москва",
      SPB: "Санкт-Петербург",
      OTHER: "регион России",
    };

    // Определяем текущий сезон для сезонных рекомендаций
    const month = new Date().getMonth() + 1;
    const season =
      month >= 3 && month <= 5 ? "весна" :
      month >= 6 && month <= 8 ? "лето" :
      month >= 9 && month <= 11 ? "осень" : "зима";

    const lines = [
      `Профиль: ${profileMap[user.profileType ?? ""] ?? "не указан"}`,
      `Цель: ${goalMap[user.goal ?? ""] ?? "не указана"}`,
      `Регион: ${regionMap[user.region ?? ""] ?? "Россия"}`,
      `Сезон: ${season}`,
    ];
    if (user.dietaryRestrictions.length) lines.push(`Ограничения: ${user.dietaryRestrictions.join(", ")}`);
    if (user.allergies.length) lines.push(`Аллергии: ${user.allergies.join(", ")}`);
    if (user.dislikedProducts.length) lines.push(`Не любит: ${user.dislikedProducts.join(", ")}`);
    if (user.cookingSkill) lines.push(`Навык готовки: ${user.cookingSkill}`);

    return lines.join("\n");
  }

  buildBudgetContext(budgetRub: number, days: number): string {
    const dailyBudget = Math.floor(budgetRub / days);
    return [
      `Бюджет: ${budgetRub} руб на ${days} ${days === 1 ? "день" : days < 5 ? "дня" : "дней"}`,
      `Дневной бюджет: ~${dailyBudget} руб`,
      `Стратегия: используй бюджетные крупы и сезонные овощи как основу, мясо — в умеренных количествах`,
    ].join("\n");
  }

  buildProductsContext(
    products: ProductForPrompt[],
    storeChain?: StoreChain | null,
    storePriceMap?: Map<string, number>,
  ): string {
    const storeLabel = storeChain ? STORE_LABELS[storeChain] : null;
    const multiplier = storeChain ? STORE_MULTIPLIERS[storeChain] : 1;

    const lines = products.map((p) => {
      // Приоритет: реальная цена из StorePrices → расчётная через multiplier → avg
      const avgPrice = Number(p.avgPriceRub);
      const price = storePriceMap?.get(p.canonicalName)
        ?? Math.round(avgPrice * multiplier);

      const cal = p.caloriesPer100g ? Math.round(Number(p.caloriesPer100g)) : "?";
      const prot = p.proteinPer100g ? Math.round(Number(p.proteinPer100g) * 10) / 10 : "?";
      const fat = p.fatPer100g ? Math.round(Number(p.fatPer100g) * 10) / 10 : "?";
      const carb = p.carbsPer100g ? Math.round(Number(p.carbsPer100g) * 10) / 10 : "?";
      return `${p.canonicalName}:${price}р/${p.unit}(${cal}ккал,б${prot},ж${fat},у${carb})`;
    });

    const header = storeLabel
      ? `Доступные продукты в ${storeLabel} (цены актуальны для выбранного магазина):`
      : "Доступные продукты (средние цены по России):";

    return `${header}\n${lines.join("\n")}`;
  }

  buildOutputFormat(days: number): string {
    return `Верни ТОЛЬКО JSON следующей структуры (без markdown, без пояснений):
{
  "days": [
    {
      "dayNumber": 1,
      "meals": [
        {
          "type": "breakfast",
          "name": "Название блюда",
          "ingredients": [
            {"name": "Продукт", "amount": 100, "unit": "г", "price": 30}
          ],
          "recipeShort": "Краткий рецепт 1-2 предложения",
          "cookingMin": 15,
          "nutrition": {"calories": 350, "protein": 20, "fat": 8, "carbs": 45},
          "cost": 120
        }
      ],
      "dayTotal": {"cost": 350, "calories": 1800, "protein": 90, "fat": 60, "carbs": 200}
    }
  ],
  "shoppingList": [
    {"name": "Продукт", "totalAmount": 500, "unit": "г", "estimatedPrice": 150}
  ],
  "totalCost": ${days * 350},
  "budgetLeft": 0,
  "confidence": "high"
}
Сгенерируй меню на ${days} ${days === 1 ? "день" : days < 5 ? "дня" : "дней"}.
Для каждого дня: breakfast, lunch, dinner (можно добавить snack).`;
  }

  buildSafetyRules(): string {
    return [
      "ПРАВИЛА:",
      "1. Используй ТОЛЬКО продукты из предоставленного списка",
      "2. Не выдумывай продукты которых нет в списке",
      "3. Не давай медицинских рекомендаций",
      "4. Цены должны быть реалистичными и соответствовать бюджету",
      "5. Блюда должны быть реальными блюдами домашней русской кухни",
      "6. НЕ повторяй одно блюдо дважды в меню (разные дни — разные блюда)",
      "7. Каждый день должен иметь РАЗНЫЕ блюда (не гречка каждый день)",
      "8. Чередуй белки: день 1 — курица, день 2 — говядина/свинина, день 3 — рыба/яйца",
      "9. КБЖУ рассчитывай точно на основе количества каждого ингредиента",
      "10. cookingMin должен быть реалистичным (каша 20мин, борщ 60мин, омлет 10мин)",
      "11. confidence: 'low' если бюджет < 200р/день, 'medium' если 200-400р, 'high' если > 400р",
    ].join("\n");
  }

  buildFullPrompt(
    user: UserContext,
    products: ProductForPrompt[],
    budgetRub: number,
    days: number,
    previousDishes?: string[],
    storeChain?: StoreChain | null,
    storePriceMap?: Map<string, number>,
  ): { system: string; user: string } {
    const userLines = [
      this.buildUserContext(user),
      "",
      this.buildBudgetContext(budgetRub, days),
      "",
      this.buildProductsContext(products, storeChain, storePriceMap),
      "",
      this.buildOutputFormat(days),
      "",
      this.buildSafetyRules(),
    ];

    if (previousDishes?.length) {
      userLines.push("", `НЕ повторяй эти блюда: ${previousDishes.join(", ")}`);
    }

    return {
      system: this.buildSystemPrompt(),
      user: userLines.join("\n"),
    };
  }
}
