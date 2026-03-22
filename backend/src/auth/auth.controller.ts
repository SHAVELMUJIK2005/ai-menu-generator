import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { TelegramAuthDto, RefreshTokenDto, DevAuthDto } from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Авторизация через Telegram Mini App initData
   * POST /api/auth/telegram
   */
  @Post("telegram")
  @HttpCode(HttpStatus.OK)
  async telegramAuth(@Body() dto: TelegramAuthDto) {
    return this.authService.authenticateWithTelegram(dto.initData);
  }

  /**
   * Обновление access token
   * POST /api/auth/refresh
   */
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  /**
   * Авторизация для разработки без Telegram (только development)
   * POST /api/auth/dev
   */
  @Post("dev")
  @HttpCode(HttpStatus.OK)
  async devAuth(@Body() dto: DevAuthDto) {
    return this.authService.authenticateForDev(dto.telegramId, dto.username);
  }
}
