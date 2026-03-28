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
   * Продукты для промпта — берём не более MAX_PER_CATEGORY на категорию,
   * сортируем по цене (дешевле = популярнее для бюджетных меню).
   * Ограничивает размер промпта до ~2000 токенов вместо ~8000.
   */
  async getForPrompt(excludeNames: string[] = []) {
    const MAX_PER_CATEGORY = 6;

    const all = await this.prisma.product.findMany({
      where: { canonicalName: { notIn: excludeNames } },
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
      orderBy: [{ category: "asc" }, { avgPriceRub: "asc" }],
    });

    // Группируем по категории и берём топ N из каждой
    const byCategory = new Map<string, typeof all>();
    for (const p of all) {
      const list = byCategory.get(p.category) ?? [];
      if (list.length < MAX_PER_CATEGORY) {
        list.push(p);
        byCategory.set(p.category, list);
      }
    }

    return [...byCategory.values()].flat();
  }
}
