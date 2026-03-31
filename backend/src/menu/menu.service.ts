import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import OpenAI from "openai";
import * as crypto from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { ProductService } from "../product/product.service";
import { PromptBuilderService } from "../prompt/prompt-builder.service";
import { MenuResponseSchema, MenuResponseType, MealSchema } from "./menu.schema";
import { GenerateMenuDto } from "./dto/generate-menu.dto";
import { MenuStatus, StoreChain, Region } from "@prisma/client";
import { StoreService } from "../store/store.service";
import { TelegramService } from "../telegram/telegram.service";
import { YouTubeService } from "../youtube/youtube.service";
import { STORE_LABELS } from "../store/store.service";
import { MENU_QUEUE, MenuJobData } from "../queue/constants";

const PROMPT_VERSION = "v1.0";
const MAX_FREE_GENERATIONS_PER_DAY = 3;
const MAX_FREE_SUBSTITUTIONS_PER_DAY = 1;
const CACHE_TTL_SECONDS = 6 * 60 * 60; // 6 часов
const MAX_RETRIES = 3;
const MEAL_QUALITY_ISSUE_LIMIT = 8;

interface ProductNutritionProfile {
  canonicalName: string;
  aliases: string[];
  unit: string;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  fatPer100g: number | null;
  carbsPer100g: number | null;
}

interface NutritionRecalculateResult {
  menu: MenuResponseType;
  matchedIngredients: number;
  totalIngredients: number;
}

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly productService: ProductService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly storeService: StoreService,
    private readonly telegramService: TelegramService,
    private readonly youtubeService: YouTubeService,
    @InjectQueue(MENU_QUEUE) private readonly menuQueue: Queue<MenuJobData>,
  ) {
    // OpenRouter совместим с OpenAI SDK
    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY ?? "",
    });
  }

  /**
   * Поставить задачу генерации меню в очередь BullMQ.
   * Возвращает menuId и статус PENDING — фронт должен потом poll-ить GET /menu/:id
   */
  async generateMenu(userId: string, dto: GenerateMenuDto): Promise<{ menuId: string; status: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException("Пользователь не найден", HttpStatus.NOT_FOUND);

    // Rate limiting: не более 3 генераций в день для бесплатных
    if (!user.isPremium) {
      await this.checkRateLimit(userId);
    }

    // Создаём запись меню в статусе PENDING
    const menu = await this.prisma.menu.create({
      data: {
        userId,
        daysCount: dto.days,
        budgetInput: dto.budget,
        storeChain: dto.storeChain as StoreChain | undefined,
        promptVersion: PROMPT_VERSION,
        status: MenuStatus.PENDING,
      },
    });

    // Кладём задачу в очередь
    await this.menuQueue.add(
      "generate",
      { menuId: menu.id, userId, daysCount: dto.days, budgetInput: dto.budget, storeChain: dto.storeChain },
      { attempts: 2, backoff: { type: "fixed", delay: 5000 } },
    );

    this.logger.log(`Задача создана: menuId=${menu.id}, userId=${userId}`);
    return { menuId: menu.id, status: MenuStatus.PENDING };
  }

  /**
   * Тяжёлая работа — вызывается воркером BullMQ из MenuProcessor.
   * Генерирует меню через AI и обновляет запись в БД.
   */
  async processMenuJob(data: MenuJobData): Promise<void> {
    const { menuId, userId, daysCount, budgetInput, storeChain: storeChainStr } = data;
    const startTime = Date.now();

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      await this.prisma.menu.update({ where: { id: menuId }, data: { status: MenuStatus.FAILED } });
      return;
    }

    const storeChain = storeChainStr as StoreChain | undefined;
    const aiModel = user.isPremium ? "anthropic/claude-sonnet-4-5" : "openai/gpt-4o-mini";

    // Проверяем кэш (reroll всегда пропускает кэш — иначе вернётся то же меню)
    const dto = { days: daysCount, budget: budgetInput, storeChain: storeChainStr } as GenerateMenuDto;
    const cacheKey = this.buildCacheKey(user, dto);
    const cached = data.skipCache ? null : await this.redis.get(cacheKey);
    if (cached) {
      const parsedMenu = JSON.parse(cached) as MenuResponseType;
      await this.prisma.menu.update({
        where: { id: menuId },
        data: {
          parsedMenu: parsedMenu as object,
          shoppingList: parsedMenu.shoppingList as object,
          rawResponse: parsedMenu as object,
          status: MenuStatus.DONE,
          aiModel,
        },
      });
      this.logger.log(`Кэш-хит для menuId=${menuId}`);
      return;
    }

    const products = await this.productService.getForPrompt(user.dislikedProducts);
    const nutritionProfiles = this.buildNutritionProfiles(products);
    const storePriceMap = storeChain
      ? await this.storeService.getPriceMap(storeChain, user.region as Region ?? Region.MOSCOW)
      : undefined;

    // Если previousDishes переданы из reroll-задачи — используем их,
    // иначе собираем из истории последних 2 меню
    let previousDishes = data.previousDishes ?? [];
    if (!previousDishes.length) {
      const recentMenus = await this.prisma.menu.findMany({
        where: { userId, status: MenuStatus.DONE, id: { not: menuId } },
        orderBy: { createdAt: "desc" },
        take: 2,
        select: { parsedMenu: true },
      });
      previousDishes = recentMenus.flatMap((m) => {
        const pm = m.parsedMenu as MenuResponseType | null;
        return pm?.days.flatMap((d) => d.meals.map((meal) => meal.name)) ?? [];
      });
    }

    const prompt = this.promptBuilder.buildFullPrompt(
      {
        profileType: user.profileType,
        goal: user.goal,
        region: user.region,
        dietaryRestrictions: user.dietaryRestrictions,
        allergies: user.allergies,
        dislikedProducts: user.dislikedProducts,
        cookingSkill: user.cookingSkill,
      },
      products,
      budgetInput,
      daysCount,
      previousDishes.length ? previousDishes : undefined,
      storeChain,
      storePriceMap,
    );

    let parsedMenu: MenuResponseType | null = null;
    let lastError = "";
    let tokensIn = 0;
    let tokensOut = 0;
    let retryFeedback = "";

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        this.logger.log(`menuId=${menuId}: попытка ${attempt}/${MAX_RETRIES}`);

        const userPrompt = retryFeedback
          ? `${prompt.user}\n\nИсправь замечания из предыдущей попытки и верни НОВЫЙ вариант:\n${retryFeedback}`
          : prompt.user;

        const response = await this.openai.chat.completions.create({
          model: aiModel,
          messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.55,
          max_tokens: 4000,
          response_format: { type: "json_object" },
        });

        tokensIn = response.usage?.prompt_tokens ?? 0;
        tokensOut = response.usage?.completion_tokens ?? 0;

        const raw = response.choices[0]?.message?.content ?? "";
        const validated = MenuResponseSchema.safeParse(JSON.parse(raw));

        if (validated.success) {
          const recalculated = this.recalculateNutrition(validated.data, nutritionProfiles, budgetInput);
          const qualityIssues = this.findMealQualityIssues(recalculated.menu);

          if (qualityIssues.length > 0 && attempt < MAX_RETRIES) {
            lastError = `Низкое качество меню: ${qualityIssues.join("; ")}`;
            retryFeedback = qualityIssues.map((issue, i) => `${i + 1}. ${issue}`).join("\n");
            this.logger.warn(`menuId=${menuId}: попытка ${attempt} — отклонена по качеству`);
            continue;
          }

          if (qualityIssues.length > 0) {
            this.logger.warn(
              `menuId=${menuId}: приняли меню с замечаниями (последняя попытка): ${qualityIssues.join("; ")}`,
            );
          }

          const coveragePercent = Math.round(
            (recalculated.matchedIngredients / Math.max(recalculated.totalIngredients, 1)) * 100,
          );
          this.logger.log(
            `menuId=${menuId}: КБЖУ пересчитано по ингредиентам (${coveragePercent}% совпадений ингредиентов)`,
          );

          parsedMenu = recalculated.menu;
          break;
        } else {
          lastError = validated.error.message;
          this.logger.warn(`menuId=${menuId}: попытка ${attempt} — невалидный JSON`);
        }
      } catch (err) {
        lastError = String(err);
        this.logger.warn(`menuId=${menuId}: попытка ${attempt} — ошибка: ${lastError}`);
      }
    }

    const durationMs = Date.now() - startTime;
    const costUsd = this.estimateCost(aiModel, tokensIn, tokensOut);

    if (!parsedMenu) {
      await this.prisma.menu.update({ where: { id: menuId }, data: { status: MenuStatus.FAILED } });
      await this.saveGenerationLog(userId, aiModel, tokensIn, tokensOut, costUsd, durationMs, "error", lastError);
      throw new Error(`Не удалось сгенерировать меню после ${MAX_RETRIES} попыток: ${lastError}`);
    }

    // Считаем суммарное КБЖУ по всем дням для nutritionSummary
    const nutritionSummary = parsedMenu.days.reduce(
      (acc, day) => ({
        totalCalories: acc.totalCalories + day.dayTotal.calories,
        totalProtein: acc.totalProtein + day.dayTotal.protein,
        totalFat: acc.totalFat + day.dayTotal.fat,
        totalCarbs: acc.totalCarbs + day.dayTotal.carbs,
        avgDailyCalories: 0, // заполним ниже
      }),
      { totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, avgDailyCalories: 0 },
    );
    nutritionSummary.avgDailyCalories = Math.round(nutritionSummary.totalCalories / parsedMenu.days.length);

    // Для Premium пользователей обогащаем меню видео-рецептами
    if (user.isPremium && process.env.YOUTUBE_API_KEY) {
      const dishNames = parsedMenu.days.flatMap((d) => d.meals.map((m) => m.name));
      const videoMap = await this.youtubeService.enrichMenuWithVideos(dishNames);
      if (videoMap.size > 0) {
        parsedMenu = {
          ...parsedMenu,
          days: parsedMenu.days.map((day) => ({
            ...day,
            meals: day.meals.map((meal) => ({
              ...meal,
              videoUrl: videoMap.get(meal.name) ?? meal.videoUrl,
            })),
          })),
        };
      }
    }

    await this.prisma.menu.update({
      where: { id: menuId },
      data: {
        aiModel,
        tokensIn,
        tokensOut,
        costUsd,
        rawResponse: parsedMenu as object,
        parsedMenu: parsedMenu as object,
        shoppingList: parsedMenu.shoppingList as object,
        nutritionSummary: nutritionSummary as object,
        status: MenuStatus.DONE,
      },
    });

    await this.saveGenerationLog(userId, aiModel, tokensIn, tokensOut, costUsd, durationMs, "success");
    await this.redis.set(cacheKey, JSON.stringify(parsedMenu), CACHE_TTL_SECONDS);

    const storeName = storeChain ? STORE_LABELS[storeChain] : undefined;
    this.telegramService
      .notifyMenuReady(user.telegramId, daysCount, parsedMenu.totalCost, storeName)
      .catch(() => {});
  }

  /**
   * История меню пользователя
   */
  async getHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.menu.findMany({
        where: { userId, status: MenuStatus.DONE },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          daysCount: true,
          budgetInput: true,
          storeChain: true,
          aiModel: true,
          costUsd: true,
          parsedMenu: true,
          createdAt: true,
        },
      }),
      this.prisma.menu.count({ where: { userId, status: MenuStatus.DONE } }),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Получить меню по ID
   */
  async getById(userId: string, menuId: string) {
    const menu = await this.prisma.menu.findFirst({
      where: { id: menuId, userId },
    });
    if (!menu) throw new HttpException("Меню не найдено", HttpStatus.NOT_FOUND);
    return menu;
  }

  /**
   * Перегенерация меню (reroll) — async через BullMQ как generateMenu.
   * Возвращает { menuId, status: PENDING }, фронт poll-ит GET /menu/:id.
   */
  async reroll(userId: string, menuId: string): Promise<{ menuId: string; status: string }> {
    const original = await this.getById(userId, menuId);
    if (!original.parsedMenu) {
      throw new HttpException("Оригинальное меню ещё не готово", HttpStatus.BAD_REQUEST);
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException("Пользователь не найден", HttpStatus.NOT_FOUND);

    if (!user.isPremium) {
      await this.checkRateLimit(userId);
    }

    // Блюда из исходного меню — AI не должен их повторять
    const originalMenu = original.parsedMenu as MenuResponseType;
    const previousDishes = originalMenu.days.flatMap((d) => d.meals.map((m) => m.name));

    // Создаём новую PENDING запись
    const newMenu = await this.prisma.menu.create({
      data: {
        userId,
        daysCount: original.daysCount,
        budgetInput: original.budgetInput,
        storeChain: original.storeChain,
        promptVersion: PROMPT_VERSION,
        status: MenuStatus.PENDING,
      },
    });

    await this.menuQueue.add(
      "generate",
      {
        menuId: newMenu.id,
        userId,
        daysCount: original.daysCount,
        budgetInput: original.budgetInput,
        storeChain: original.storeChain ?? undefined,
        previousDishes,
        skipCache: true, // reroll обязан генерировать новое меню, не возвращать кэш
      },
      { attempts: 2, backoff: { type: "fixed", delay: 5000 } },
    );

    this.logger.log(`Reroll задача создана: menuId=${newMenu.id}, userId=${userId}`);
    return { menuId: newMenu.id, status: MenuStatus.PENDING };
  }

  /**
   * Оценить меню (1-5 звёзд)
   */
  async rateMenu(userId: string, menuId: string, stars: number, comment?: string) {
    await this.getById(userId, menuId); // проверяем что меню принадлежит пользователю

    return this.prisma.menuRating.upsert({
      where: { userId_menuId: { userId, menuId } },
      create: { userId, menuId, stars, comment },
      update: { stars, comment },
    });
  }

  /**
   * Замена одного блюда в меню без перегенерации всего
   * Возвращает обновлённое меню с заменённым блюдом
   */
  async substituteMeal(
    userId: string,
    menuId: string,
    dayNumber: number,
    mealType: "breakfast" | "lunch" | "dinner" | "snack",
  ): Promise<MenuResponseType> {
    const menu = await this.getById(userId, menuId);
    const parsedMenu = menu.parsedMenu as MenuResponseType;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException("Пользователь не найден", HttpStatus.NOT_FOUND);

    // Free пользователи: максимум 1 замена блюда в день
    if (!user.isPremium) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Считаем замены через generationLog с моделью gpt-4o-mini и mealType пометкой
      const substitutionsToday = await this.prisma.generationLog.count({
        where: {
          userId,
          createdAt: { gte: today },
          status: "success",
          errorMsg: "substitute",
        },
      });
      if (substitutionsToday >= MAX_FREE_SUBSTITUTIONS_PER_DAY) {
        throw new HttpException(
          "Лимит замен блюд исчерпан (1/день). Оформите Premium для безлимитного доступа.",
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const day = parsedMenu.days.find((d) => d.dayNumber === dayNumber);
    if (!day) throw new HttpException("День не найден", HttpStatus.BAD_REQUEST);

    const currentMeal = day.meals.find((m) => m.type === mealType);
    if (!currentMeal) throw new HttpException("Блюдо не найдено", HttpStatus.BAD_REQUEST);

    const aiModel = user.isPremium ? "anthropic/claude-sonnet-4-5" : "openai/gpt-4o-mini";
    const products = await this.productService.getForPrompt(user.dislikedProducts);

    // Все блюда текущего меню — исключим их из нового
    const existingDishes = parsedMenu.days.flatMap((d) => d.meals.map((m) => m.name));

    const substitutePrompt = `Замени одно блюдо в меню. Верни ТОЛЬКО JSON одного блюда без markdown.

Текущее блюдо которое нужно заменить:
- Тип: ${mealType} (${dayNumber}-й день)
- Название: ${currentMeal.name}
- Стоимость должна быть ~${currentMeal.cost} руб

Не повторяй эти блюда: ${existingDishes.join(", ")}

Профиль: ${user.profileType ?? "не указан"}, цель: ${user.goal ?? "не указана"}
Бюджет на блюдо: ~${currentMeal.cost} руб

Требования качества:
- Блюдо должно быть реально вкусным и домашним, без странных сочетаний
- Не используй экспериментальные комбинации типа мясо+сладкие соусы, рыба+сладкие топпинги
- Для ${mealType === "snack" ? "перекуса" : "основного блюда"} используй типичный формат и адекватный состав ингредиентов
- Название конкретное и аппетитное

Доступные продукты (краткий список):
${products.slice(0, 30).map((p) => `${p.canonicalName}:${Math.round(Number(p.avgPriceRub))}р/${p.unit}`).join(", ")}

Верни JSON строго в формате:
{
  "type": "${mealType}",
  "name": "Название блюда",
  "ingredients": [{"name": "Продукт", "amount": 100, "unit": "г", "price": 30}],
  "recipeShort": "Краткий рецепт",
  "cookingMin": 15,
  "nutrition": {"calories": 350, "protein": 20, "fat": 8, "carbs": 45},
  "cost": ${currentMeal.cost}
}`;

    const response = await this.openai.chat.completions.create({
      model: aiModel,
      messages: [
        { role: "system", content: this.promptBuilder.buildSystemPrompt() },
        { role: "user", content: substitutePrompt },
      ],
      temperature: 0.55,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    let newMeal: MenuResponseType["days"][0]["meals"][0];
    try {
      const parsed = JSON.parse(raw);
      const validated = MealSchema.safeParse(parsed);
      if (!validated.success) {
        this.logger.warn(`Substitute meal validation failed: ${validated.error.message}`);
        throw new Error("Invalid meal format from AI");
      }
      newMeal = validated.data;
    } catch {
      throw new HttpException("Не удалось сгенерировать альтернативное блюдо", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Обновляем меню: заменяем блюдо и пересчитываем totals/КБЖУ
    const draftMenu: MenuResponseType = {
      ...parsedMenu,
      days: parsedMenu.days.map((d) => {
        if (d.dayNumber !== dayNumber) return d;
        return {
          ...d,
          meals: d.meals.map((m) => (m.type === mealType ? newMeal : m)),
        };
      }),
    };

    const nutritionProfiles = this.buildNutritionProfiles(products);
    const updatedMenu = this.recalculateNutrition(draftMenu, nutritionProfiles, menu.budgetInput).menu;

    // Сохраняем обновлённое меню в БД
    await this.prisma.menu.update({
      where: { id: menuId },
      data: {
        parsedMenu: updatedMenu as object,
        rawResponse: updatedMenu as object,
      },
    });

    // Инвалидируем кэш
    const cacheKey = `menu:${menuId}`;
    await this.redis.del(cacheKey);

    // Логируем замену для подсчёта лимита у free пользователей
    await this.saveGenerationLog(userId, aiModel, 0, 0, 0, 0, "success", "substitute");

    return updatedMenu;
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  private buildNutritionProfiles(
    products: Array<{
      canonicalName: string;
      aliases?: string[];
      unit: string;
      caloriesPer100g: unknown;
      proteinPer100g: unknown;
      fatPer100g: unknown;
      carbsPer100g: unknown;
    }>,
  ): ProductNutritionProfile[] {
    return products.map((product) => ({
      canonicalName: product.canonicalName,
      aliases: product.aliases ?? [],
      unit: product.unit,
      caloriesPer100g: this.toNumberOrNull(product.caloriesPer100g),
      proteinPer100g: this.toNumberOrNull(product.proteinPer100g),
      fatPer100g: this.toNumberOrNull(product.fatPer100g),
      carbsPer100g: this.toNumberOrNull(product.carbsPer100g),
    }));
  }

  private recalculateNutrition(
    menu: MenuResponseType,
    products: ProductNutritionProfile[],
    budgetInput: number,
  ): NutritionRecalculateResult {
    let matchedIngredients = 0;
    let totalIngredients = 0;
    let totalCost = 0;

    const days = menu.days.map((day) => {
      let dayCalories = 0;
      let dayProtein = 0;
      let dayFat = 0;
      let dayCarbs = 0;
      let dayCost = 0;

      const meals = day.meals.map((meal) => {
        let mealCalories = 0;
        let mealProtein = 0;
        let mealFat = 0;
        let mealCarbs = 0;
        let mealMatched = 0;

        for (const ingredient of meal.ingredients) {
          totalIngredients++;

          const product = this.findNutritionProduct(ingredient.name, products);
          if (!product) continue;

          const factor = this.amountToHundredFactor(ingredient.amount, ingredient.unit, product.unit);
          if (factor === null) continue;

          mealCalories += (product.caloriesPer100g ?? 0) * factor;
          mealProtein += (product.proteinPer100g ?? 0) * factor;
          mealFat += (product.fatPer100g ?? 0) * factor;
          mealCarbs += (product.carbsPer100g ?? 0) * factor;
          mealMatched++;
          matchedIngredients++;
        }

        const coverage = meal.ingredients.length > 0 ? mealMatched / meal.ingredients.length : 0;
        const nutrition = coverage >= 0.5 && mealMatched > 0
          ? {
              calories: Math.max(0, Math.round(mealCalories)),
              protein: Math.max(0, this.roundToOneDecimal(mealProtein)),
              fat: Math.max(0, this.roundToOneDecimal(mealFat)),
              carbs: Math.max(0, this.roundToOneDecimal(mealCarbs)),
            }
          : { ...meal.nutrition };

        dayCalories += nutrition.calories;
        dayProtein += nutrition.protein;
        dayFat += nutrition.fat;
        dayCarbs += nutrition.carbs;
        dayCost += Math.round(meal.cost);

        return {
          ...meal,
          nutrition,
          cost: Math.round(meal.cost),
        };
      });

      const dayTotal = {
        cost: dayCost,
        calories: Math.max(0, Math.round(dayCalories)),
        protein: Math.max(0, this.roundToOneDecimal(dayProtein)),
        fat: Math.max(0, this.roundToOneDecimal(dayFat)),
        carbs: Math.max(0, this.roundToOneDecimal(dayCarbs)),
      };

      totalCost += dayTotal.cost;

      return {
        ...day,
        meals,
        dayTotal,
      };
    });

    return {
      menu: {
        ...menu,
        days,
        totalCost,
        budgetLeft: budgetInput - totalCost,
      },
      matchedIngredients,
      totalIngredients,
    };
  }

  private findMealQualityIssues(menu: MenuResponseType): string[] {
    const issues: string[] = [];
    const seenMeals = new Set<string>();

    for (const day of menu.days) {
      for (const meal of day.meals) {
        if (issues.length >= MEAL_QUALITY_ISSUE_LIMIT) return issues;

        const normalizedName = this.normalizeText(meal.name);
        if (normalizedName && seenMeals.has(normalizedName)) {
          issues.push(`Повторяется блюдо "${meal.name}"`);
        }
        if (normalizedName) {
          seenMeals.add(normalizedName);
        }

        if (meal.recipeShort.trim().length < 24) {
          issues.push(`Слишком короткий рецепт у блюда "${meal.name}"`);
        }

        if (meal.type !== "snack" && meal.ingredients.length < 2) {
          issues.push(`Слишком простой состав у блюда "${meal.name}"`);
        }

        const mealName = meal.name.toLowerCase();
        if (meal.type === "breakfast" && this.containsAny(mealName, ["суп", "борщ", "щи", "рагу", "жаркое", "гуляш"])) {
          issues.push(`Завтрак "${meal.name}" выглядит как неуместное блюдо для утра`);
        }

        if (meal.type === "snack" && this.containsAny(mealName, ["суп", "борщ", "плов", "котлет", "рагу", "жаркое", "гуляш"])) {
          issues.push(`Перекус "${meal.name}" слишком тяжёлый`);
        }

        if (
          (meal.type === "lunch" || meal.type === "dinner")
          && this.containsAny(mealName, ["чай", "кофе", "компот", "сок", "смузи", "кефир", "йогурт"])
        ) {
          issues.push(`"${meal.name}" не подходит как полноценный ${meal.type === "lunch" ? "обед" : "ужин"}`);
        }

        if (meal.type === "snack" && meal.cookingMin > 25) {
          issues.push(`Перекус "${meal.name}" готовится слишком долго`);
        }

        const ingredientText = meal.ingredients.map((i) => i.name.toLowerCase()).join(" ");
        const hasSweet = this.containsAny(ingredientText, ["варенье", "джем", "сироп", "сгущ", "шоколад"]);
        const hasMeatOrFish = this.containsAny(ingredientText, ["кур", "говяд", "свин", "фарш", "рыб", "лосос", "тунц", "селед"]);
        if ((meal.type === "lunch" || meal.type === "dinner") && hasSweet && hasMeatOrFish) {
          issues.push(`В "${meal.name}" конфликт вкусов: сладкое с мясом/рыбой`);
        }
      }
    }

    return issues;
  }

  private findNutritionProduct(name: string, products: ProductNutritionProfile[]): ProductNutritionProfile | null {
    const normalizedName = this.normalizeText(name);
    if (!normalizedName) return null;

    for (const product of products) {
      if (this.normalizeText(product.canonicalName) === normalizedName) {
        return product;
      }
      if (product.aliases.some((alias) => this.normalizeText(alias) === normalizedName)) {
        return product;
      }
    }

    const queryTokens = this.tokenize(normalizedName);
    if (!queryTokens.length) return null;

    let best: ProductNutritionProfile | null = null;
    let bestScore = 0;

    for (const product of products) {
      const candidates = [product.canonicalName, ...product.aliases];
      for (const candidate of candidates) {
        const candidateTokens = this.tokenize(candidate);
        if (!candidateTokens.length) continue;

        let matched = 0;
        for (const queryToken of queryTokens) {
          if (candidateTokens.some((token) => token === queryToken || token.startsWith(queryToken) || queryToken.startsWith(token))) {
            matched++;
          }
        }

        const recall = matched / queryTokens.length;
        const precision = matched / candidateTokens.length;
        const score = recall * 0.7 + precision * 0.3;
        if (score > bestScore) {
          bestScore = score;
          best = product;
        }
      }
    }

    return bestScore >= 0.52 ? best : null;
  }

  private amountToHundredFactor(amount: number, unit: string, productUnit: string): number | null {
    if (!Number.isFinite(amount) || amount <= 0) return null;

    const normalized = unit.toLowerCase().replace(/\s+/g, "").replace(",", ".");
    const fallbackUnit = productUnit.toLowerCase();

    if (normalized === "г" || normalized === "гр" || normalized === "gram" || normalized === "grams") {
      return amount / 100;
    }
    if (normalized === "кг" || normalized === "kg") {
      return amount * 10;
    }
    if (normalized === "мл" || normalized === "ml") {
      return amount / 100;
    }
    if (normalized === "л" || normalized === "l") {
      return amount * 10;
    }
    if (normalized === "шт" || normalized === "штука" || normalized === "шт.") {
      return (amount * 55) / 100;
    }
    if (normalized === "ст.л" || normalized === "стл" || normalized === "tbsp") {
      return (amount * 15) / 100;
    }
    if (normalized === "ч.л" || normalized === "чл" || normalized === "tsp") {
      return (amount * 5) / 100;
    }

    if (fallbackUnit === "шт") {
      return (amount * 55) / 100;
    }

    return amount / 100;
  }

  private tokenize(value: string): string[] {
    const stopWords = new Set([
      "и", "в", "на", "с", "по", "для", "из", "без", "или", "со", "под", "над",
      "г", "гр", "кг", "мл", "л", "шт", "свежий", "свежая", "свежие", "домашний", "домашняя",
      "вареный", "варёный", "жареный", "запеченный", "запечённый", "отварной", "нарезка",
    ]);

    return this.normalizeText(value)
      .split(" ")
      .filter((token) => token.length > 1 && !stopWords.has(token));
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .replace(/[«»"'()\[\],.%]/g, " ")
      .replace(/[^a-zа-яё0-9\s]/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private containsAny(source: string, terms: string[]): boolean {
    return terms.some((term) => source.includes(term));
  }

  private toNumberOrNull(value: unknown): number | null {
    if (value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private roundToOneDecimal(value: number): number {
    return Math.round(value * 10) / 10;
  }

  private async checkRateLimit(userId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Считаем меню созданные сегодня (включая кэш-хиты и pending)
    const count = await this.prisma.menu.count({
      where: {
        userId,
        createdAt: { gte: today },
      },
    });

    if (count >= MAX_FREE_GENERATIONS_PER_DAY) {
      throw new HttpException(
        "Лимит генераций на сегодня исчерпан. Оформите Premium для безлимитного доступа.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private buildCacheKey(user: { id: string; profileType: unknown; goal: unknown; dietaryRestrictions: string[] }, dto: GenerateMenuDto): string {
    const data = `${user.id}:${user.profileType}:${user.goal}:${dto.budget}:${dto.days}:${dto.storeChain ?? "none"}:${user.dietaryRestrictions.join(",")}`;
    return `menu:${crypto.createHash("md5").update(data).digest("hex")}`;
  }

  private estimateCost(model: string, tokensIn: number, tokensOut: number): number {
    // Приблизительные цены OpenRouter
    if (model.includes("claude")) {
      return (tokensIn * 0.000003 + tokensOut * 0.000015);
    }
    if (model.includes("gemini")) {
      return (tokensIn * 0.000000075 + tokensOut * 0.0000003);
    }
    return (tokensIn * 0.0000004 + tokensOut * 0.0000012);
  }

  private async saveGenerationLog(
    userId: string, model: string, tokensIn: number, tokensOut: number,
    costUsd: number, durationMs: number, status: string, errorMsg?: string,
  ) {
    await this.prisma.generationLog.create({
      data: { userId, model, tokensIn, tokensOut, costUsd, durationMs, status, errorMsg },
    });
  }
}
