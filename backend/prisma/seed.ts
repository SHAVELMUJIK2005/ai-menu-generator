import "dotenv/config";
import { PrismaClient, ProductCategory, ProductSource } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Заполняем базу тестовыми продуктами...");

  const products = [
    {
      canonicalName: "Гречка",
      category: ProductCategory.GRAINS,
      aliases: ["гречневая крупа", "buckwheat"],
      unit: "г",
      avgPriceRub: 85,
      caloriesPer100g: 313,
      proteinPer100g: 12.6,
      fatPer100g: 3.3,
      carbsPer100g: 57.1,
      source: ProductSource.MANUAL,
    },
    {
      canonicalName: "Куриная грудка",
      category: ProductCategory.MEAT,
      aliases: ["грудка курицы", "chicken breast", "куриное филе"],
      unit: "г",
      avgPriceRub: 380,
      caloriesPer100g: 113,
      proteinPer100g: 23.6,
      fatPer100g: 1.9,
      carbsPer100g: 0.4,
      source: ProductSource.MANUAL,
    },
    {
      canonicalName: "Молоко 2.5%",
      category: ProductCategory.DAIRY,
      aliases: ["молоко", "milk"],
      unit: "мл",
      avgPriceRub: 75,
      caloriesPer100g: 52,
      proteinPer100g: 2.8,
      fatPer100g: 2.5,
      carbsPer100g: 4.7,
      source: ProductSource.MANUAL,
    },
    {
      canonicalName: "Яйца С1",
      category: ProductCategory.EGGS_OILS,
      aliases: ["яйцо", "яйца", "eggs"],
      unit: "шт",
      avgPriceRub: 95,
      caloriesPer100g: 157,
      proteinPer100g: 12.7,
      fatPer100g: 11.5,
      carbsPer100g: 0.7,
      source: ProductSource.MANUAL,
    },
    {
      canonicalName: "Картофель",
      category: ProductCategory.VEGETABLES,
      aliases: ["картошка", "potato"],
      unit: "г",
      avgPriceRub: 35,
      caloriesPer100g: 77,
      proteinPer100g: 2.0,
      fatPer100g: 0.4,
      carbsPer100g: 16.3,
      source: ProductSource.MANUAL,
    },
    {
      canonicalName: "Морковь",
      category: ProductCategory.VEGETABLES,
      aliases: ["carrot"],
      unit: "г",
      avgPriceRub: 30,
      caloriesPer100g: 41,
      proteinPer100g: 0.9,
      fatPer100g: 0.1,
      carbsPer100g: 9.6,
      source: ProductSource.MANUAL,
    },
    {
      canonicalName: "Лук репчатый",
      category: ProductCategory.VEGETABLES,
      aliases: ["лук", "onion"],
      unit: "г",
      avgPriceRub: 25,
      caloriesPer100g: 41,
      proteinPer100g: 1.4,
      fatPer100g: 0.0,
      carbsPer100g: 8.2,
      source: ProductSource.MANUAL,
    },
    {
      canonicalName: "Рис",
      category: ProductCategory.GRAINS,
      aliases: ["рис круглозерный", "rice"],
      unit: "г",
      avgPriceRub: 70,
      caloriesPer100g: 344,
      proteinPer100g: 6.7,
      fatPer100g: 0.7,
      carbsPer100g: 78.9,
      source: ProductSource.MANUAL,
    },
    {
      canonicalName: "Макароны",
      category: ProductCategory.GRAINS,
      aliases: ["паста", "pasta", "спагетти"],
      unit: "г",
      avgPriceRub: 65,
      caloriesPer100g: 338,
      proteinPer100g: 10.4,
      fatPer100g: 1.1,
      carbsPer100g: 69.7,
      source: ProductSource.MANUAL,
    },
    {
      canonicalName: "Хлеб белый",
      category: ProductCategory.BREAD,
      aliases: ["батон", "белый хлеб", "white bread"],
      unit: "г",
      avgPriceRub: 45,
      caloriesPer100g: 242,
      proteinPer100g: 8.1,
      fatPer100g: 1.0,
      carbsPer100g: 48.8,
      source: ProductSource.MANUAL,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { canonicalName: product.canonicalName },
      update: product,
      create: product,
    });
  }

  console.log(`✓ Добавлено ${products.length} продуктов`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
