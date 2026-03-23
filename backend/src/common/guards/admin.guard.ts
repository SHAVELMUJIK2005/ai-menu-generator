import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import type { CurrentUserPayload } from "../decorators/current-user.decorator";

/**
 * Проверяет что telegramId текущего пользователя есть в ADMIN_TELEGRAM_IDS
 * Env: ADMIN_TELEGRAM_IDS=123456789,987654321 (через запятую)
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly adminIds: Set<string>;

  constructor() {
    const raw = process.env.ADMIN_TELEGRAM_IDS ?? "";
    this.adminIds = new Set(raw.split(",").map((s) => s.trim()).filter(Boolean));
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload | undefined;

    if (!user?.telegramId || !this.adminIds.has(user.telegramId)) {
      throw new ForbiddenException("Доступ только для администраторов");
    }

    return true;
  }
}
