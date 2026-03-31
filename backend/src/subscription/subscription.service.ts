import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionPlan } from "@prisma/client";

// Цена Premium в Telegram Stars (1 Star ≈ 0.013 USD)
const PREMIUM_PRICE_STARS = 199; // ~2.60 USD/мес
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
   * Крон: каждый час деактивируем все истёкшие подписки
   */
  @Cron("0 * * * *")
  async deactivateAllExpired() {
    const result = await this.prisma.user.updateMany({
      where: {
        isPremium: true,
        premiumUntil: { lt: new Date() },
      },
      data: { isPremium: false },
    });
    if (result.count > 0) {
      this.logger.log(`Деактивировано ${result.count} истёкших Premium подписок`);
    }
  }

  /**
   * Создаём ссылку на инвойс Telegram Stars для оплаты Premium
   * userId передаём в invoice_payload — получим его обратно в successful_payment
   */
  async createInvoiceLink(userId: string): Promise<string> {
    const token = process.env.TG_BOT_TOKEN;
    if (!token) throw new HttpException("Telegram Bot не настроен", HttpStatus.SERVICE_UNAVAILABLE);

    const res = await fetch(`https://api.telegram.org/bot${token}/createInvoiceLink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Premium подписка",
        description: "30 дней Premium: безлимитная генерация меню + приоритетный AI",
        payload: userId, // вернётся в successful_payment.invoice_payload
        provider_token: "", // для Telegram Stars всегда пустая строка
        currency: "XTR", // Telegram Stars
        prices: [{ label: "Premium 30 дней", amount: PREMIUM_PRICE_STARS }],
      }),
    });

    const data = (await res.json()) as { ok: boolean; result?: string; description?: string };
    if (!data.ok) {
      this.logger.error("Ошибка создания инвойса:", data.description);
      throw new HttpException("Ошибка создания инвойса", HttpStatus.BAD_GATEWAY);
    }

    return data.result!;
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

  /**
   * Тоггл Premium по Telegram ID — для команды /premium в боте (только для администраторов)
   */
  async togglePremiumByTelegramId(telegramId: string): Promise<{
    isPremium: boolean;
    userId: string;
    name: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
      select: { id: true, isPremium: true, username: true, displayName: true },
    });

    if (!user) throw new HttpException("Пользователь не найден в БД", HttpStatus.NOT_FOUND);

    const newStatus = !user.isPremium;

    if (newStatus) {
      // Даём Premium без срока истечения (100 лет)
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 100);

      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: user.id },
          data: { isPremium: true, premiumUntil: expiresAt },
        }),
        this.prisma.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            plan: SubscriptionPlan.PREMIUM,
            startedAt: new Date(),
            expiresAt,
            paymentProvider: "admin",
            paymentId: `admin_grant_${Date.now()}`,
          },
          update: {
            plan: SubscriptionPlan.PREMIUM,
            startedAt: new Date(),
            expiresAt,
            paymentProvider: "admin",
            paymentId: `admin_grant_${Date.now()}`,
          },
        }),
      ]);
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isPremium: false, premiumUntil: null },
      });
    }

    const name = user.username ? `@${user.username}` : (user.displayName ?? user.id);
    this.logger.log(`Admin toggle Premium: tgid=${telegramId} → isPremium=${newStatus}`);
    return { isPremium: newStatus, userId: user.id, name };
  }
}
