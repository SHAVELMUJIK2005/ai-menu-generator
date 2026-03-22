import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private checkDevMode() {
    if (process.env.NODE_ENV !== "development") {
      throw new HttpException("Доступно только в режиме разработки", HttpStatus.FORBIDDEN);
    }
  }

  /**
   * Сброс лимита генераций за сегодня для пользователя
   */
  async resetGenerationLimit(userId: string) {
    this.checkDevMode();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deleted = await this.prisma.generationLog.deleteMany({
      where: { userId, createdAt: { gte: today } },
    });

    return { deletedCount: deleted.count, message: "Лимит генераций сброшен" };
  }

  /**
   * Очистка Redis кэша меню
   */
  async clearMenuCache() {
    this.checkDevMode();
    // ioredis не имеет scan по паттерну в нашем сервисе — просто возвращаем инфо
    return { message: "Кэш очищается вручную — используй redis-cli FLUSHDB для полной очистки" };
  }

  /**
   * Статистика системы
   */
  async getSystemStats() {
    this.checkDevMode();
    const [userCount, menuCount, logCount] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.menu.count(),
      this.prisma.generationLog.count(),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = await this.prisma.generationLog.count({
      where: { createdAt: { gte: today } },
    });

    return {
      users: userCount,
      menus: menuCount,
      totalGenerations: logCount,
      todayGenerations: todayLogs,
    };
  }
}
