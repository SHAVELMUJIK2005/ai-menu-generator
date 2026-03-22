import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as crypto from "crypto";

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface JwtPayload {
  sub: string;
  telegramId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Валидация initData от Telegram Mini App через HMAC-SHA256
   * Документация: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
   */
  private validateTelegramInitData(initData: string): TelegramUser {
    const botToken = process.env.TG_BOT_TOKEN;
    if (!botToken) {
      throw new BadRequestException("TG_BOT_TOKEN не настроен");
    }

    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) {
      throw new UnauthorizedException("hash отсутствует в initData");
    }

    // Убираем hash из строки для проверки
    params.delete("hash");

    // Сортируем параметры и формируем data-check-string
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    // Ключ = HMAC-SHA256("WebAppData", botToken)
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    // Подпись = HMAC-SHA256(dataCheckString, secretKey)
    const expectedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (expectedHash !== hash) {
      throw new UnauthorizedException("Невалидная подпись initData");
    }

    // Парсим данные пользователя
    const userStr = params.get("user");
    if (!userStr) {
      throw new UnauthorizedException("user отсутствует в initData");
    }

    return JSON.parse(userStr) as TelegramUser;
  }

  /**
   * Авторизация через Telegram initData
   */
  async authenticateWithTelegram(initData: string) {
    const tgUser = this.validateTelegramInitData(initData);

    // Upsert пользователя в БД
    const user = await this.prisma.user.upsert({
      where: { telegramId: BigInt(tgUser.id) },
      update: {
        username: tgUser.username,
        displayName: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || undefined,
      },
      create: {
        telegramId: BigInt(tgUser.id),
        username: tgUser.username,
        displayName: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || undefined,
      },
    });

    const tokens = this.generateTokens(user.id, user.telegramId.toString());
    return { ...tokens, user: { ...user, telegramId: user.telegramId.toString() } };
  }

  /**
   * Авторизация для разработки без Telegram (только NODE_ENV=development)
   */
  async authenticateForDev(telegramId: number, username: string) {
    if (process.env.NODE_ENV !== "development") {
      throw new UnauthorizedException("Доступно только в development");
    }

    const user = await this.prisma.user.upsert({
      where: { telegramId: BigInt(telegramId) },
      update: { username },
      create: { telegramId: BigInt(telegramId), username, displayName: username },
    });

    const tokens = this.generateTokens(user.id, user.telegramId.toString());
    return { ...tokens, user: { ...user, telegramId: user.telegramId.toString() } };
  }

  /**
   * Обновление access token через refresh token
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_SECRET + "_refresh",
      });

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException("Пользователь не найден");
      }

      return this.generateTokens(user.id, user.telegramId.toString());
    } catch {
      throw new UnauthorizedException("Невалидный refresh token");
    }
  }

  private generateTokens(userId: string, telegramId: string): TokenPair {
    const payload: JwtPayload = { sub: userId, telegramId };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: "24h",
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET + "_refresh",
      expiresIn: "30d",
    });

    return { accessToken, refreshToken };
  }
}
