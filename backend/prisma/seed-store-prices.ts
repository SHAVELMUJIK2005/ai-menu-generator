if (process.env.NODE_ENV !== "production") { require("dotenv").config(); }
import { PrismaClient, StoreChain, Region, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const MULTIPLIERS: Record<StoreChain, number> = {
  PYATEROCHKA:  0.85,
  MAGNIT:       0.90,
  LENTA:        0.95,
  PEREKRESTOK:  1.10,
  VKUSVILL:     1.30,
};

const REGION_ADJUSTMENT: Record<Region, number> = {
  MOSCOW: 1.00,
  SPB:    0.97,
  OTHER:  0.88,
};

// Детерминированный разброс ±7% — одни и те же данные при каждом запуске
function variance(productId: number, store: string): number {
  const hash = (productId * 31 + store.charCodeAt(0) * 17) % 100;
  return 1 + (hash - 50) * 0.0014;
}

async function main() {
  console.log("Заполняем StorePrices для всех продуктов...");

  const products = await prisma.product.findMany({
    select: { id: true, avgPriceRub: true },
  });

  const stores = Object.values(StoreChain);
  const regions = [Region.MOSCOW, Region.SPB, Region.OTHER];
  const parsedAt = new Date();

  // Очищаем старые данные
  await prisma.storePrices.deleteMany({});
  console.log("Старые записи удалены.");

  const rows: Prisma.StorePricesCreateManyInput[] = [];

  for (const product of products) {
    const avg = Number(product.avgPriceRub);

    for (const store of stores) {
      for (const region of regions) {
        const price = Math.max(1, Math.round(avg * MULTIPLIERS[store] * REGION_ADJUSTMENT[region] * variance(product.id, store)));

        // Каждый 4-й продукт в Пятёрочке/Магните — по акции (-20%)
        const isPromo = (store === StoreChain.PYATEROCHKA || store === StoreChain.MAGNIT)
          && (product.id % 4 === 0);
        const promoPrice = isPromo ? Math.max(1, Math.round(price * 0.80)) : null;

        rows.push({ productId: product.id, storeChain: store, region, priceRub: price, isPromo, promoPrice, parsedAt });
      }
    }
  }

  // Вставляем батчами по 500
  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    await prisma.storePrices.createMany({ data: rows.slice(i, i + BATCH) });
  }

  console.log(`✓ Создано ${rows.length} записей (${products.length} продуктов × ${stores.length} магазинов × ${regions.length} регионов)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
