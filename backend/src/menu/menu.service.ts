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
import { MenuResponseSchema, MenuResponseType } from "./menu.schema";
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
    const aiModel = user.isPremium ? "anthropic/claude-sonnet-4-5" : "google/gemini-flash-1.5";

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

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        this.logger.log(`menuId=${menuId}: попытка ${attempt}/${MAX_RETRIES}`);

        const response = await this.openai.chat.completions.create({
          model: aiModel,
          messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user },
          ],
          temperature: 0.7,
          max_tokens: 2800,
          response_format: { type: "json_object" },
        });

        tokensIn = response.usage?.prompt_tokens ?? 0;
        tokensOut = response.usage?.completion_tokens ?? 0;

        const raw = response.choices[0]?.message?.content ?? "";
        const validated = MenuResponseSchema.safeParse(JSON.parse(raw));

        if (validated.success) {
          parsedMenu = validated.data;
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

    const aiModel = user.isPremium ? "anthropic/claude-sonnet-4-5" : "google/gemini-flash-1.5";
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
      temperature: 0.8,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    let newMeal: MenuResponseType["days"][0]["meals"][0];
    try {
      newMeal = JSON.parse(raw);
    } catch {
      throw new HttpException("Не удалось сгенерировать альтернативное блюдо", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Обновляем меню: заменяем блюдо
    const updatedMenu: MenuResponseType = {
      ...parsedMenu,
      days: parsedMenu.days.map((d) => {
        if (d.dayNumber !== dayNumber) return d;
        return {
          ...d,
          meals: d.meals.map((m) => (m.type === mealType ? newMeal : m)),
          dayTotal: {
            ...d.dayTotal,
            cost: d.dayTotal.cost - currentMeal.cost + (newMeal.cost ?? currentMeal.cost),
          },
        };
      }),
    };

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
