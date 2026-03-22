import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ProductCategory } from "@prisma/client";

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Автокомплит поиск продуктов по названию и aliases
   */
  async search(q: string) {
    if (!q || q.length < 2) return [];
    return this.prisma.product.findMany({
      where: {
        OR: [
          { canonicalName: { contains: q, mode: "insensitive" } },
          { aliases: { has: q } },
        ],
      },
      take: 20,
      select: {
        id: true,
        canonicalName: true,
        category: true,
        unit: true,
        avgPriceRub: true,
        caloriesPer100g: true,
        proteinPer100g: true,
        fatPer100g: true,
        carbsPer100g: true,
      },
    });
  }

  /**
   * Список всех категорий
   */
  getCategories(): ProductCategory[] {
    return Object.values(ProductCategory);
  }

  /**
   * Все продукты для промпта (исключая нежелательные)
   */
  async getForPrompt(excludeNames: string[] = []) {
    return this.prisma.product.findMany({
      where: {
        canonicalName: { notIn: excludeNames },
      },
      select: {
        canonicalName: true,
        category: true,
        unit: true,
        avgPriceRub: true,
        caloriesPer100g: true,
        proteinPer100g: true,
        fatPer100g: true,
        carbsPer100g: true,
      },
      orderBy: { category: "asc" },
    });
  }
}
