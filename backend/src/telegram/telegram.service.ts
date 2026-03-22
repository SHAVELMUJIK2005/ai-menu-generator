import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Telegraf, Context } from "telegraf";

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Telegraf;

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

    // Обработка ошибок
    this.bot.catch((err, ctx) => {
      this.logger.error(`Ошибка бота для update ${ctx.updateType}:`, err);
    });
  }

  /**
   * Обработка webhook-запроса от Telegram
   */
  async handleWebhook(body: object): Promise<void> {
    if (!this.bot) return;
    await this.bot.handleUpdate(body as Parameters<typeof this.bot.handleUpdate>[0]);
  }
}
