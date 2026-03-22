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
   * Сравнение итоговой стоимости списка покупок по всем магазинам
   * shoppingList — массив { name, totalAmount } из меню
   */
  async compareShoppingList(
    shoppingList: Array<{ name: string; totalAmount: number; unit?: string }>,
    region: Region = Region.MOSCOW,
  ) {
    const productNames = shoppingList.map((i) => i.name);

    const storePrices = await this.prisma.storePrices.findMany({
      where: {
        region,
        product: { canonicalName: { in: productNames } },
      },
      include: { product: { select: { canonicalName: true, unit: true, avgPriceRub: true } } },
    });

    const stores = Object.values(StoreChain);

    const result = stores.map((store) => {
      let totalCost = 0;
      let foundCount = 0;
      const items: Array<{ name: string; price: number; isPromo: boolean }> = [];

      for (const item of shoppingList) {
        const sp = storePrices.find(
          (p) => p.product.canonicalName === item.name && p.storeChain === store,
        );

        if (sp) {
          // Цена за 100г/100мл/шт → масштабируем по количеству
          const unitPrice = sp.isPromo && sp.promoPrice ? Number(sp.promoPrice) : Number(sp.priceRub);
          // В нашей базе цены за 100г (или за шт), totalAmount в граммах/шт
          const factor = sp.product.unit === "шт" ? item.totalAmount : item.totalAmount / 100;
          const cost = Math.round(unitPrice * factor);

          totalCost += cost;
          foundCount++;
          items.push({ name: item.name, price: unitPrice, isPromo: sp.isPromo });
        } else {
          // Продукт не найден в StorePrices — берём avg с multiplier
          const avgPrice = Number(
            storePrices.find((p) => p.product.canonicalName === item.name)?.product.avgPriceRub ?? 0,
          );
          const fallbackPrice = Math.round(avgPrice * STORE_MULTIPLIERS[store]);
          const unit = storePrices.find((p) => p.product.canonicalName === item.name)?.product.unit ?? "г";
          const factor = unit === "шт" ? item.totalAmount : item.totalAmount / 100;
          totalCost += Math.round(fallbackPrice * factor);
          items.push({ name: item.name, price: fallbackPrice, isPromo: false });
        }
      }

      return {
        store,
        storeName: STORE_LABELS[store],
        priceTag: this.getStores().find((s) => s.chain === store)?.priceTag ?? "₽₽",
        totalCost,
        foundCount,
        totalItems: shoppingList.length,
        items,
      };
    });

    // Сортируем по цене, помечаем самый дешёвый
    result.sort((a, b) => a.totalCost - b.totalCost);
    return result.map((r, i) => ({ ...r, isCheapest: i === 0 }));
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
