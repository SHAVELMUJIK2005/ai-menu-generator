import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
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
import { STORE_LABELS } from "../store/store.service";

const PROMPT_VERSION = "v1.0";
const MAX_FREE_GENERATIONS_PER_DAY = 3;
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
  ) {
    // OpenRouter совместим с OpenAI SDK
    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY ?? "",
    });
  }

  /**
   * Генерация меню через AI
   */
  async generateMenu(userId: string, dto: GenerateMenuDto): Promise<MenuResponseType> {
    const startTime = Date.now();

    // Получаем профиль пользователя
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException("Пользователь не найден", HttpStatus.NOT_FOUND);

    // Rate limiting: не более 3 генераций в день для бесплатных
    if (!user.isPremium) {
      await this.checkRateLimit(userId);
    }

    // Выбираем модель (premium — Claude, free — GPT-4o-mini)
    const aiModel = user.isPremium
      ? "anthropic/claude-sonnet-4-5"
      : "openai/gpt-4o-mini";

    // Проверяем кэш Redis
    const cacheKey = this.buildCacheKey(user, dto);
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.log(`Кэш-хит для userId=${userId}`);
      return JSON.parse(cached) as MenuResponseType;
    }

    // Получаем продукты из БД (исключаем нежелательные)
    const products = await this.productService.getForPrompt(user.dislikedProducts);

    // Загружаем цены выбранного магазина (если указан)
    const storeChain = dto.storeChain as StoreChain | undefined;
    const storePriceMap = storeChain
      ? await this.storeService.getPriceMap(storeChain, user.region as Region ?? Region.MOSCOW)
      : undefined;

    // Строим промпт с реальными ценами магазина
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
      dto.budget,
      dto.days,
      undefined,
      storeChain,
      storePriceMap,
    );

    // Генерация с retry до 3 раз
    let parsedMenu: MenuResponseType | null = null;
    let lastError = "";
    let tokensIn = 0;
    let tokensOut = 0;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        this.logger.log(`Попытка генерации ${attempt}/${MAX_RETRIES}, модель: ${aiModel}`);

        const response = await this.openai.chat.completions.create({
          model: aiModel,
          messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: "json_object" },
        });

        tokensIn = response.usage?.prompt_tokens ?? 0;
        tokensOut = response.usage?.completion_tokens ?? 0;

        const raw = response.choices[0]?.message?.content ?? "";
        const parsed = JSON.parse(raw);
        const validated = MenuResponseSchema.safeParse(parsed);

        if (validated.success) {
          parsedMenu = validated.data;
          break;
        } else {
          lastError = validated.error.message;
          this.logger.warn(`Попытка ${attempt}: невалидный JSON — ${lastError}`);
        }
      } catch (err) {
        lastError = String(err);
        this.logger.warn(`Попытка ${attempt}: ошибка — ${lastError}`);
      }
    }

    const durationMs = Date.now() - startTime;
    const costUsd = this.estimateCost(aiModel, tokensIn, tokensOut);

    if (!parsedMenu) {
      // Сохраняем лог ошибки
      await this.saveGenerationLog(userId, aiModel, tokensIn, tokensOut, costUsd, durationMs, "error", lastError);
      throw new HttpException("Не удалось сгенерировать меню. Попробуйте ещё раз.", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Сохраняем меню в БД
    await this.prisma.menu.create({
      data: {
        userId,
        daysCount: dto.days,
        budgetInput: dto.budget,
        storeChain: dto.storeChain as StoreChain | undefined,
        promptVersion: PROMPT_VERSION,
        aiModel,
        tokensIn,
        tokensOut,
        costUsd,
        rawResponse: parsedMenu as object,
        parsedMenu: parsedMenu as object,
        shoppingList: parsedMenu.shoppingList as object,
        status: MenuStatus.DONE,
      },
    });

    // Сохраняем лог
    await this.saveGenerationLog(userId, aiModel, tokensIn, tokensOut, costUsd, durationMs, "success");

    // Кэшируем результат на 6 часов
    await this.redis.set(cacheKey, JSON.stringify(parsedMenu), CACHE_TTL_SECONDS);

    // Уведомляем пользователя в Telegram (fire-and-forget)
    const storeName = storeChain ? STORE_LABELS[storeChain] : undefined;
    this.telegramService
      .notifyMenuReady(user.telegramId, dto.days, parsedMenu.totalCost, storeName)
      .catch(() => {}); // не блокируем ответ

    return parsedMenu;
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
   * Перегенерация меню (reroll) — исключает блюда из предыдущего
   */
  async reroll(userId: string, menuId: string): Promise<MenuResponseType> {
    const original = await this.getById(userId, menuId);
    const originalMenu = original.parsedMenu as MenuResponseType;

    // Список блюд из предыдущего меню
    const previousDishes = originalMenu.days
      .flatMap((d) => d.meals.map((m) => m.name));

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException("Пользователь не найден", HttpStatus.NOT_FOUND);

    const aiModel = user.isPremium ? "anthropic/claude-sonnet-4-5" : "openai/gpt-4o-mini";
    const products = await this.productService.getForPrompt(user.dislikedProducts);

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
      original.budgetInput,
      original.daysCount,
      previousDishes,
    );

    const response = await this.openai.chat.completions.create({
      model: aiModel,
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
      temperature: 0.9,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const validated = MenuResponseSchema.safeParse(JSON.parse(raw));
    if (!validated.success) {
      throw new HttpException("Ошибка генерации нового меню", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const tokensIn = response.usage?.prompt_tokens ?? 0;
    const tokensOut = response.usage?.completion_tokens ?? 0;
    const costUsd = this.estimateCost(aiModel, tokensIn, tokensOut);

    await this.prisma.menu.create({
      data: {
        userId,
        daysCount: original.daysCount,
        budgetInput: original.budgetInput,
        storeChain: original.storeChain,
        promptVersion: PROMPT_VERSION,
        aiModel,
        tokensIn,
        tokensOut,
        costUsd,
        rawResponse: validated.data as object,
        parsedMenu: validated.data as object,
        shoppingList: validated.data.shoppingList as object,
        status: MenuStatus.DONE,
      },
    });

    return validated.data;
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  private async checkRateLimit(userId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await this.prisma.generationLog.count({
      where: {
        userId,
        createdAt: { gte: today },
        status: "success",
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
    const data = `${user.profileType}:${user.goal}:${dto.budget}:${dto.days}:${user.dietaryRestrictions.join(",")}`;
    return `menu:${crypto.createHash("md5").update(data).digest("hex")}`;
  }

  private estimateCost(model: string, tokensIn: number, tokensOut: number): number {
    // Приблизительные цены OpenRouter
    if (model.includes("claude")) {
      return (tokensIn * 0.000003 + tokensOut * 0.000015);
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
