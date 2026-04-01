import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Telegraf, Context } from "telegraf";
import { SubscriptionService } from "../subscription/subscription.service";

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Telegraf;

  constructor(private readonly subscriptionService: SubscriptionService) {}

  // URL Mini App — при деплое подставляется реальный домен
  private readonly miniAppUrl =
    process.env.MINI_APP_URL ?? "https://t.me/your_bot/app";

  onModuleInit() {
    const token = process.env.TG_BOT_TOKEN;
    if (!token) {
      this.logger.warn("TG_BOT_TOKEN не задан — Telegram Bot отключён");
      return;
    }

    this.bot = new Telegraf(token);
    this.setupHandlers();

    // В production используем webhook, в dev — long polling
    if (process.env.NODE_ENV === "production" && process.env.WEBHOOK_DOMAIN) {
      const webhookUrl = `https://${process.env.WEBHOOK_DOMAIN}/api/telegram/webhook`;
      this.bot.telegram
        .setWebhook(webhookUrl)
        .then(() => this.logger.log(`Webhook установлен: ${webhookUrl}`))
        .catch((e) => this.logger.error("Ошибка установки webhook", e));
    } else {
      // Long polling только для разработки
      this.bot.launch().then(() => this.logger.log("Telegram Bot запущен (polling)"));
    }
  }

  private setupHandlers() {
    // Команда /start — показываем кнопку открыть Mini App
    this.bot.start((ctx: Context) => {
      const firstName = ctx.from?.first_name ?? "друг";
      return ctx.reply(
        `Привет, ${firstName}! 🥗\n\nЯ помогу составить персональное меню питания на неделю, учитывая твой бюджет и цены в российских магазинах.\n\nНажми кнопку ниже, чтобы начать:`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🍽 Составить меню",
                  web_app: { url: this.miniAppUrl },
                },
              ],
            ],
          },
        },
      );
    });

    // Команда /help
    this.bot.help((ctx: Context) => {
      return ctx.reply(
        "📋 *AI Menu Generator*\n\n" +
          "Генерирую персональное меню питания с учётом:\n" +
          "• Твоего профиля (один/семья)\n" +
          "• Бюджета и цен в российских магазинах\n" +
          "• Предпочтений и ограничений\n\n" +
          "Команды:\n" +
          "/start — открыть приложение\n" +
          "/menu — быстрый старт генерации меню",
        { parse_mode: "Markdown" },
      );
    });

    // Команда /menu — быстрый старт
    this.bot.command("menu", (ctx: Context) => {
      return ctx.reply("Открываю генератор меню:", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🚀 Открыть",
                web_app: { url: this.miniAppUrl },
              },
            ],
          ],
        },
      });
    });

    // Команда /premium <telegramId> — тоггл Premium (только для администраторов)
    this.bot.command("premium", async (ctx: Context) => {
      try {
        const adminIds = new Set(
          (process.env.ADMIN_TELEGRAM_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
        );

        const callerId = String(ctx.from?.id ?? "");
        if (!adminIds.has(callerId)) {
          await ctx.reply("⛔ Нет доступа");
          return;
        }

        const text = "text" in ctx.message! ? (ctx.message!.text as string) : "";
        const targetId = text.split(/\s+/)[1]?.trim() ?? "";

        if (!targetId || !/^\d+$/.test(targetId)) {
          await ctx.reply("Использование: /premium <telegramId>\nПример: /premium 123456789");
          return;
        }

        const result = await this.subscriptionService.togglePremiumByTelegramId(targetId);
        const status = result.isPremium ? "✅ Premium включён" : "❌ Premium отключён";
        await ctx.reply(`${status}\nПользователь: ${result.name}\nTelegram ID: ${targetId}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "неизвестная ошибка";
        this.logger.error("Ошибка в команде /premium:", e);
        await ctx.reply(`⚠️ Ошибка: ${msg}`).catch(() => {});
      }
    });

    // Подтверждение платежа (обязательно в течение 10 сек)
    this.bot.on("pre_checkout_query", async (ctx) => {
      await ctx.answerPreCheckoutQuery(true);
    });

    // Успешная оплата — активируем Premium
    this.bot.on("successful_payment", async (ctx) => {
      const payment = ctx.message?.successful_payment;
      if (!payment) return;

      // userId мы передали в invoice_payload при создании инвойса
      const userId = payment.invoice_payload;
      const paymentId = payment.telegram_payment_charge_id;

      try {
        await this.subscriptionService.activatePremium(userId, paymentId, "telegram_stars");
        await ctx.reply("✅ Premium активирован! 30 дней безлимитной генерации меню.");
        this.logger.log(`Stars оплата: userId=${userId}, paymentId=${paymentId}`);
      } catch (e) {
        this.logger.error("Ошибка активации Premium после оплаты:", e);
        await ctx.reply("⚠️ Оплата прошла, но возникла ошибка активации. Напишите в поддержку.");
      }
    });

    // Обработка ошибок
    this.bot.catch((err, ctx) => {
      this.logger.error(`Ошибка бота для update ${ctx.updateType}:`, err);
    });
  }

  /**
   * Отправить уведомление пользователю о готовом меню
   */
  async notifyMenuReady(telegramId: bigint, daysCount: number, totalCost: number, storeName?: string) {
    if (!this.bot) return;
    try {
      const storeText = storeName ? ` для покупок в ${storeName}` : "";
      await this.bot.telegram.sendMessage(
        Number(telegramId),
        `✅ *Меню на ${daysCount} ${daysCount === 1 ? "день" : daysCount < 5 ? "дня" : "дней"} готово!*\n\n` +
        `💰 Бюджет: ~${totalCost} ₽${storeText}\n\n` +
        `Открой приложение, чтобы посмотреть меню и список покупок 👇`,
        { parse_mode: "Markdown" },
      );
    } catch (e) {
      // Пользователь мог заблокировать бота — не падаем
      this.logger.warn(`Не удалось отправить уведомление telegramId=${telegramId}:`, e);
    }
  }

  /**
   * Обработка webhook-запроса от Telegram
   */
  async handleWebhook(body: object): Promise<void> {
    if (!this.bot) return;
    await this.bot.handleUpdate(body as Parameters<typeof this.bot.handleUpdate>[0]);
  }
}
