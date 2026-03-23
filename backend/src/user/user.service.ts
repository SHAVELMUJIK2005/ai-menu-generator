import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Получить профиль пользователя по ID
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        telegramId: true,
        username: true,
        displayName: true,
        profileType: true,
        goal: true,
        dietaryRestrictions: true,
        allergies: true,
        dislikedProducts: true,
        region: true,
        cookingSkill: true,
        equipment: true,
        preferredStore: true,
        isPremium: true,
        premiumUntil: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    // BigInt не сериализуется в JSON — конвертируем в строку
    return { ...user, telegramId: user.telegramId.toString() };
  }

  /**
   * Статистика пользователя: генерации, лимиты
   */
  async getStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalMenus, todayGenerations, user] = await this.prisma.$transaction([
      this.prisma.menu.count({ where: { userId, status: "DONE" } }),
      this.prisma.menu.count({
        where: { userId, createdAt: { gte: today } },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { isPremium: true },
      }),
    ]);

    const dailyLimit = user?.isPremium ? null : 3; // null = безлимит для premium
    return {
      totalMenus,
      todayGenerations,
      dailyLimit,
      generationsLeft: dailyLimit !== null ? Math.max(0, dailyLimit - todayGenerations) : null,
    };
  }

  /**
   * Обновить профиль пользователя
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        telegramId: true,
        username: true,
        displayName: true,
        profileType: true,
        goal: true,
        dietaryRestrictions: true,
        allergies: true,
        dislikedProducts: true,
        region: true,
        cookingSkill: true,
        equipment: true,
        preferredStore: true,
        isPremium: true,
        premiumUntil: true,
        createdAt: true,
      },
    });

    // Сбрасываем кэш меню — у пользователя изменились предпочтения
    await this.redis.scanDel("menu:*");

    return { ...user, telegramId: user.telegramId.toString() };
  }
}
