import {
  Injectable,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получить все избранные меню пользователя
   */
  async getAll(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        menu: {
          select: {
            id: true,
            parsedMenu: true,
            shoppingList: true,
            budgetInput: true,
            daysCount: true,
            status: true,
            aiModel: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Добавить меню в избранное
   */
  async add(userId: string, menuId: string) {
    // Проверяем что меню принадлежит пользователю
    const menu = await this.prisma.menu.findFirst({
      where: { id: menuId, userId },
    });
    if (!menu) {
      throw new HttpException("Меню не найдено", HttpStatus.NOT_FOUND);
    }

    // Проверяем что ещё не в избранном
    const existing = await this.prisma.favorite.findFirst({
      where: { userId, menuId },
    });
    if (existing) {
      throw new HttpException("Уже в избранном", HttpStatus.CONFLICT);
    }

    return this.prisma.favorite.create({
      data: { userId, menuId },
    });
  }

  /**
   * Удалить из избранного
   */
  async remove(userId: string, menuId: string) {
    const existing = await this.prisma.favorite.findFirst({
      where: { userId, menuId },
    });
    if (!existing) {
      throw new HttpException("Не найдено в избранном", HttpStatus.NOT_FOUND);
    }

    await this.prisma.favorite.delete({
      where: { userId_menuId: { userId, menuId } },
    });
    return { success: true };
  }
}
