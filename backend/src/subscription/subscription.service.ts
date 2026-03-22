import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionPlan } from "@prisma/client";

// Цена Premium в Telegram Stars (1 Star ≈ 0.013 USD)
const PREMIUM_PRICE_STARS = 250; // ~3.25 USD/мес
const PREMIUM_DURATION_DAYS = 30;

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Текущий статус подписки пользователя
   */
  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        isPremium: true,
        premiumUntil: true,
        subscription: true,
      },
    });

    if (!user) throw new HttpException("Пользователь не найден", HttpStatus.NOT_FOUND);

    // Проверяем не истекла ли подписка
    if (user.isPremium && user.premiumUntil && user.premiumUntil < new Date()) {
      // Деактивируем истёкшую подписку
      await this.deactivateExpired(userId);
      return { isPremium: false, premiumUntil: null, plan: SubscriptionPlan.FREE };
    }

    return {
      isPremium: user.isPremium,
      premiumUntil: user.premiumUntil,
      plan: user.isPremium ? SubscriptionPlan.PREMIUM : SubscriptionPlan.FREE,
      priceStars: PREMIUM_PRICE_STARS,
    };
  }

  /**
   * Активация Premium после успешной оплаты через Telegram Stars
   * Telegram присылает invoice_payload + payment провайдер подтверждает
   */
  async activatePremium(userId: string, paymentId: string, provider = "telegram_stars") {
    // Проверяем нет ли уже активной подписки
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, premiumUntil: true },
    });
    if (!user) throw new HttpException("Пользователь не найден", HttpStatus.NOT_FOUND);

    const now = new Date();
    // Если есть ещё активная подписка — продлеваем от её конца, иначе от сейчас
    const startFrom =
      user.isPremium && user.premiumUntil && user.premiumUntil > now
        ? user.premiumUntil
        : now;

    const expiresAt = new Date(startFrom);
    expiresAt.setDate(expiresAt.getDate() + PREMIUM_DURATION_DAYS);

    // Транзакция: обновляем User + создаём/обновляем Subscription
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { isPremium: true, premiumUntil: expiresAt },
      }),
      this.prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan: SubscriptionPlan.PREMIUM,
          startedAt: now,
          expiresAt,
          paymentProvider: provider,
          paymentId,
        },
        update: {
          plan: SubscriptionPlan.PREMIUM,
          startedAt: now,
          expiresAt,
          paymentProvider: provider,
          paymentId,
        },
      }),
    ]);

    this.logger.log(`Premium активирован для userId=${userId} до ${expiresAt.toISOString()}`);
    return { isPremium: true, premiumUntil: expiresAt };
  }

  /**
   * Деактивация истёкшей подписки
   */
  private async deactivateExpired(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isPremium: false },
    });
    this.logger.log(`Premium истёк для userId=${userId}`);
  }

  /**
   * Dev-only: активация Premium без оплаты (для тестирования)
   */
  async activatePremiumDev(userId: string) {
    if (process.env.NODE_ENV !== "development") {
      throw new HttpException("Только в режиме разработки", HttpStatus.FORBIDDEN);
    }
    return this.activatePremium(userId, "dev-test", "dev");
  }
}
