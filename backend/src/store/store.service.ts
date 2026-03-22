import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { StoreChain, Region } from "@prisma/client";

// Коэффициенты цен по магазинам относительно среднего (avgPriceRub)
// Источник: анализ цен Яндекс.Маркет / собственные исследования, март 2026
export const STORE_MULTIPLIERS: Record<StoreChain, number> = {
  PYATEROCHKA:  0.85,  // самый дешёвый, скидки каждую неделю
  MAGNIT:       0.90,  // бюджетный, широкая сеть
  LENTA:        0.95,  // средний, хорошее качество/цена
  PEREKRESTOK:  1.10,  // выше среднего, свежие продукты
  VKUSVILL:     1.30,  // премиум, органика, без лишних добавок
};

export const STORE_LABELS: Record<StoreChain, string> = {
  PYATEROCHKA: "Пятёрочка",
  MAGNIT:      "Магнит",
  LENTA:       "Лента",
  PEREKRESTOK: "Перекрёсток",
  VKUSVILL:    "ВкусВилл",
};

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Список магазинов с ценовыми тегами для фронта
   */
  getStores() {
    return Object.entries(STORE_LABELS).map(([chain, name]) => {
      const multiplier = STORE_MULTIPLIERS[chain as StoreChain];
      const priceTag = multiplier <= 0.90 ? "₽" : multiplier <= 1.00 ? "₽₽" : multiplier <= 1.15 ? "₽₽₽" : "₽₽₽₽";
      return { chain, name, priceTag, multiplier };
    });
  }

  /**
   * Цены конкретного магазина (из StorePrices таблицы)
   * Если записей нет — возвращаем расчётные на основе multiplier
   */
  async getPricesByStore(storeChain: StoreChain, region: Region = Region.MOSCOW) {
    const storePrices = await this.prisma.storePrices.findMany({
      where: { storeChain, region },
      include: {
        product: {
          select: { canonicalName: true, category: true, unit: true, avgPriceRub: true },
        },
      },
    });

    return storePrices.map((sp) => ({
      productName: sp.product.canonicalName,
      category: sp.product.category,
      unit: sp.product.unit,
      price: sp.isPromo && sp.promoPrice ? Number(sp.promoPrice) : Number(sp.priceRub),
      isPromo: sp.isPromo,
    }));
  }

  /**
   * Получить цены всех продуктов для конкретного магазина в формате Map<canonicalName, price>
   * Используется в PromptBuilder. Если StorePrices пусты — считаем через multiplier.
   */
  async getPriceMap(storeChain: StoreChain, region: Region = Region.MOSCOW): Promise<Map<string, number>> {
    const storePrices = await this.prisma.storePrices.findMany({
      where: { storeChain, region },
      include: { product: { select: { canonicalName: true } } },
    });

    const map = new Map<string, number>();

    if (storePrices.length > 0) {
      for (const sp of storePrices) {
        const price = sp.isPromo && sp.promoPrice ? Number(sp.promoPrice) : Number(sp.priceRub);
        map.set(sp.product.canonicalName, price);
      }
    }

    return map;
  }
}
