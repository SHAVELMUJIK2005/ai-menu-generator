import { Controller, Post, Body, Headers, HttpCode, Logger } from "@nestjs/common";
import { TelegramService } from "./telegram.service";

@Controller("telegram")
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(private readonly telegramService: TelegramService) {}

  /**
   * Webhook endpoint для Telegram
   * Telegram POST-ит сюда все апдейты
   */
  @Post("webhook")
  @HttpCode(200)
  async handleWebhook(
    @Body() body: object,
    @Headers("x-telegram-bot-api-secret-token") secretToken: string,
  ): Promise<void> {
    // Проверяем секретный токен если задан
    const expected = process.env.TG_WEBHOOK_SECRET;
    if (expected && secretToken !== expected) {
      this.logger.warn("Webhook: неверный secret token");
      return;
    }

    await this.telegramService.handleWebhook(body);
  }
}
