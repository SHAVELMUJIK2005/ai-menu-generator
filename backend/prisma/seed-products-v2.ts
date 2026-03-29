/**
 * seed-products-v2.ts — расширение Product DB до 350+ продуктов
 * Добавляет новые категории: суперфуды, специи, консервы, соусы, орехи, морепродукты
 * Запуск: npx ts-node prisma/seed-products-v2.ts
 */
import "dotenv/config";
import { PrismaClient, ProductCategory, ProductSource } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Добавляем расширенный список продуктов (v2)...");

  const products = [
    // ─── МЯСО ──────────────────────────────────────────────────────────────
    { canonicalName: "Свинина вырезка", category: ProductCategory.MEAT, aliases: ["свиная вырезка", "pork tenderloin"], unit: "г", avgPriceRub: 420, caloriesPer100g: 142, proteinPer100g: 19.4, fatPer100g: 7.1, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Говядина фарш", category: ProductCategory.MEAT, aliases: ["говяжий фарш", "beef minced"], unit: "г", avgPriceRub: 380, caloriesPer100g: 254, proteinPer100g: 17.2, fatPer100g: 20.0, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Куриные бёдра", category: ProductCategory.MEAT, aliases: ["бёдра курицы", "chicken thighs"], unit: "г", avgPriceRub: 220, caloriesPer100g: 185, proteinPer100g: 15.1, fatPer100g: 14.2, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Куриный фарш", category: ProductCategory.MEAT, aliases: ["фарш куриный", "chicken minced"], unit: "г", avgPriceRub: 250, caloriesPer100g: 143, proteinPer100g: 17.4, fatPer100g: 8.1, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Индейка грудка", category: ProductCategory.MEAT, aliases: ["филе индейки", "turkey breast"], unit: "г", avgPriceRub: 450, caloriesPer100g: 84, proteinPer100g: 19.2, fatPer100g: 0.7, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Говядина стейк", category: ProductCategory.MEAT, aliases: ["говядина", "beef steak"], unit: "г", avgPriceRub: 650, caloriesPer100g: 187, proteinPer100g: 18.6, fatPer100g: 12.4, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Сосиски", category: ProductCategory.MEAT, aliases: ["сардельки", "frankfurters"], unit: "г", avgPriceRub: 280, caloriesPer100g: 256, proteinPer100g: 11.4, fatPer100g: 23.0, carbsPer100g: 1.6, source: ProductSource.MANUAL },
    { canonicalName: "Колбаса варёная", category: ProductCategory.MEAT, aliases: ["докторская", "вареная колбаса"], unit: "г", avgPriceRub: 350, caloriesPer100g: 257, proteinPer100g: 12.8, fatPer100g: 22.8, carbsPer100g: 1.5, source: ProductSource.MANUAL },
    { canonicalName: "Бекон", category: ProductCategory.MEAT, aliases: ["bacon", "грудинка копчёная"], unit: "г", avgPriceRub: 480, caloriesPer100g: 458, proteinPer100g: 11.6, fatPer100g: 45.0, carbsPer100g: 0.0, source: ProductSource.MANUAL },

    // ─── РЫБА И МОРЕПРОДУКТЫ ───────────────────────────────────────────────
    { canonicalName: "Лосось", category: ProductCategory.FISH, aliases: ["сёмга", "salmon", "форель"], unit: "г", avgPriceRub: 850, caloriesPer100g: 142, proteinPer100g: 19.8, fatPer100g: 6.3, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Тунец консервированный", category: ProductCategory.FISH, aliases: ["тунец в собственном соку", "tuna canned"], unit: "г", avgPriceRub: 120, caloriesPer100g: 96, proteinPer100g: 22.0, fatPer100g: 1.0, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Минтай", category: ProductCategory.FISH, aliases: ["pollock", "минтай замороженный"], unit: "г", avgPriceRub: 180, caloriesPer100g: 70, proteinPer100g: 15.9, fatPer100g: 0.9, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Треска", category: ProductCategory.FISH, aliases: ["cod", "треска филе"], unit: "г", avgPriceRub: 250, caloriesPer100g: 69, proteinPer100g: 16.0, fatPer100g: 0.4, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Скумбрия", category: ProductCategory.FISH, aliases: ["mackerel", "скумбрия копчёная"], unit: "г", avgPriceRub: 220, caloriesPer100g: 191, proteinPer100g: 18.0, fatPer100g: 13.2, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Сельдь", category: ProductCategory.FISH, aliases: ["herring", "селёдка"], unit: "г", avgPriceRub: 150, caloriesPer100g: 145, proteinPer100g: 17.7, fatPer100g: 8.5, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Креветки", category: ProductCategory.FISH, aliases: ["shrimps", "тигровые креветки"], unit: "г", avgPriceRub: 550, caloriesPer100g: 95, proteinPer100g: 20.0, fatPer100g: 1.5, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Кальмары", category: ProductCategory.FISH, aliases: ["squid", "кальмар кольца"], unit: "г", avgPriceRub: 300, caloriesPer100g: 92, proteinPer100g: 18.0, fatPer100g: 2.2, carbsPer100g: 2.0, source: ProductSource.MANUAL },

    // ─── МОЛОЧНЫЕ ──────────────────────────────────────────────────────────
    { canonicalName: "Творог 5%", category: ProductCategory.DAIRY, aliases: ["творог обезжиренный", "cottage cheese"], unit: "г", avgPriceRub: 120, caloriesPer100g: 121, proteinPer100g: 17.2, fatPer100g: 5.0, carbsPer100g: 1.8, source: ProductSource.MANUAL },
    { canonicalName: "Кефир 2.5%", category: ProductCategory.DAIRY, aliases: ["kefir", "кефир"], unit: "мл", avgPriceRub: 65, caloriesPer100g: 50, proteinPer100g: 3.4, fatPer100g: 2.5, carbsPer100g: 3.9, source: ProductSource.MANUAL },
    { canonicalName: "Ряженка", category: ProductCategory.DAIRY, aliases: ["ryazhenka", "ряженка 2.5%"], unit: "мл", avgPriceRub: 70, caloriesPer100g: 67, proteinPer100g: 2.8, fatPer100g: 4.0, carbsPer100g: 4.2, source: ProductSource.MANUAL },
    { canonicalName: "Сметана 20%", category: ProductCategory.DAIRY, aliases: ["sour cream", "сметана"], unit: "г", avgPriceRub: 85, caloriesPer100g: 206, proteinPer100g: 2.8, fatPer100g: 20.0, carbsPer100g: 3.2, source: ProductSource.MANUAL },
    { canonicalName: "Масло сливочное", category: ProductCategory.DAIRY, aliases: ["butter", "сливочное масло 82%"], unit: "г", avgPriceRub: 180, caloriesPer100g: 717, proteinPer100g: 0.5, fatPer100g: 82.5, carbsPer100g: 0.8, source: ProductSource.MANUAL },
    { canonicalName: "Сыр твёрдый", category: ProductCategory.DAIRY, aliases: ["голландский сыр", "пошехонский", "hard cheese"], unit: "г", avgPriceRub: 650, caloriesPer100g: 350, proteinPer100g: 23.5, fatPer100g: 27.3, carbsPer100g: 0.3, source: ProductSource.MANUAL },
    { canonicalName: "Сыр плавленый", category: ProductCategory.DAIRY, aliases: ["processed cheese", "плавленный сыр"], unit: "г", avgPriceRub: 120, caloriesPer100g: 271, proteinPer100g: 6.5, fatPer100g: 26.3, carbsPer100g: 2.7, source: ProductSource.MANUAL },
    { canonicalName: "Йогурт натуральный", category: ProductCategory.DAIRY, aliases: ["greek yogurt", "греческий йогурт"], unit: "г", avgPriceRub: 100, caloriesPer100g: 66, proteinPer100g: 5.0, fatPer100g: 3.2, carbsPer100g: 3.5, source: ProductSource.MANUAL },
    { canonicalName: "Сливки 10%", category: ProductCategory.DAIRY, aliases: ["cream", "сливки"], unit: "мл", avgPriceRub: 95, caloriesPer100g: 118, proteinPer100g: 3.0, fatPer100g: 10.0, carbsPer100g: 4.0, source: ProductSource.MANUAL },

    // ─── ЯЙЦА И МАСЛА ──────────────────────────────────────────────────────
    { canonicalName: "Масло оливковое", category: ProductCategory.EGGS_OILS, aliases: ["olive oil", "оливковое масло"], unit: "мл", avgPriceRub: 600, caloriesPer100g: 899, proteinPer100g: 0.0, fatPer100g: 99.8, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Масло подсолнечное", category: ProductCategory.EGGS_OILS, aliases: ["sunflower oil", "растительное масло"], unit: "мл", avgPriceRub: 120, caloriesPer100g: 899, proteinPer100g: 0.0, fatPer100g: 99.9, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Яйца перепелиные", category: ProductCategory.EGGS_OILS, aliases: ["quail eggs", "перепелиные яйца"], unit: "шт", avgPriceRub: 85, caloriesPer100g: 168, proteinPer100g: 11.9, fatPer100g: 13.1, carbsPer100g: 0.6, source: ProductSource.MANUAL },

    // ─── КРУПЫ ─────────────────────────────────────────────────────────────
    { canonicalName: "Овсянка", category: ProductCategory.GRAINS, aliases: ["овсяные хлопья", "oats", "геркулес"], unit: "г", avgPriceRub: 60, caloriesPer100g: 342, proteinPer100g: 11.9, fatPer100g: 7.2, carbsPer100g: 59.5, source: ProductSource.MANUAL },
    { canonicalName: "Перловка", category: ProductCategory.GRAINS, aliases: ["перловая крупа", "pearl barley"], unit: "г", avgPriceRub: 50, caloriesPer100g: 320, proteinPer100g: 9.3, fatPer100g: 1.1, carbsPer100g: 66.5, source: ProductSource.MANUAL },
    { canonicalName: "Манка", category: ProductCategory.GRAINS, aliases: ["манная крупа", "semolina"], unit: "г", avgPriceRub: 55, caloriesPer100g: 328, proteinPer100g: 10.3, fatPer100g: 1.0, carbsPer100g: 70.6, source: ProductSource.MANUAL },
    { canonicalName: "Пшено", category: ProductCategory.GRAINS, aliases: ["пшённая крупа", "millet"], unit: "г", avgPriceRub: 55, caloriesPer100g: 334, proteinPer100g: 11.5, fatPer100g: 3.3, carbsPer100g: 66.5, source: ProductSource.MANUAL },
    { canonicalName: "Булгур", category: ProductCategory.GRAINS, aliases: ["bulgur", "пшеница дроблёная"], unit: "г", avgPriceRub: 120, caloriesPer100g: 342, proteinPer100g: 12.3, fatPer100g: 1.3, carbsPer100g: 75.9, source: ProductSource.MANUAL },
    { canonicalName: "Кускус", category: ProductCategory.GRAINS, aliases: ["couscous", "кус-кус"], unit: "г", avgPriceRub: 130, caloriesPer100g: 376, proteinPer100g: 12.8, fatPer100g: 0.6, carbsPer100g: 77.4, source: ProductSource.MANUAL },
    { canonicalName: "Киноа", category: ProductCategory.GRAINS, aliases: ["quinoa"], unit: "г", avgPriceRub: 350, caloriesPer100g: 368, proteinPer100g: 14.1, fatPer100g: 6.1, carbsPer100g: 57.2, source: ProductSource.MANUAL },
    { canonicalName: "Чечевица красная", category: ProductCategory.GRAINS, aliases: ["красная чечевица", "red lentils"], unit: "г", avgPriceRub: 95, caloriesPer100g: 316, proteinPer100g: 24.0, fatPer100g: 1.5, carbsPer100g: 46.3, source: ProductSource.MANUAL },
    { canonicalName: "Нут", category: ProductCategory.GRAINS, aliases: ["chickpeas", "турецкий горох"], unit: "г", avgPriceRub: 130, caloriesPer100g: 364, proteinPer100g: 19.0, fatPer100g: 6.0, carbsPer100g: 60.7, source: ProductSource.MANUAL },
    { canonicalName: "Фасоль красная", category: ProductCategory.GRAINS, aliases: ["kidney beans", "красная фасоль"], unit: "г", avgPriceRub: 90, caloriesPer100g: 337, proteinPer100g: 22.3, fatPer100g: 1.7, carbsPer100g: 54.5, source: ProductSource.MANUAL },
    { canonicalName: "Горох", category: ProductCategory.GRAINS, aliases: ["peas", "горох сухой"], unit: "г", avgPriceRub: 70, caloriesPer100g: 298, proteinPer100g: 20.5, fatPer100g: 2.0, carbsPer100g: 49.5, source: ProductSource.MANUAL },

    // ─── ХЛЕБ ──────────────────────────────────────────────────────────────
    { canonicalName: "Хлеб ржаной", category: ProductCategory.BREAD, aliases: ["чёрный хлеб", "rye bread", "бородинский"], unit: "г", avgPriceRub: 55, caloriesPer100g: 214, proteinPer100g: 6.6, fatPer100g: 1.2, carbsPer100g: 44.3, source: ProductSource.MANUAL },
    { canonicalName: "Хлеб цельнозерновой", category: ProductCategory.BREAD, aliases: ["цельнозерновой хлеб", "whole grain bread"], unit: "г", avgPriceRub: 70, caloriesPer100g: 198, proteinPer100g: 8.1, fatPer100g: 2.4, carbsPer100g: 38.6, source: ProductSource.MANUAL },
    { canonicalName: "Пита", category: ProductCategory.BREAD, aliases: ["pita bread", "лаваш"], unit: "г", avgPriceRub: 60, caloriesPer100g: 275, proteinPer100g: 8.5, fatPer100g: 1.2, carbsPer100g: 54.0, source: ProductSource.MANUAL },
    { canonicalName: "Тортилья", category: ProductCategory.BREAD, aliases: ["tortilla", "кукурузная лепёшка"], unit: "г", avgPriceRub: 120, caloriesPer100g: 310, proteinPer100g: 7.1, fatPer100g: 7.3, carbsPer100g: 52.0, source: ProductSource.MANUAL },
    { canonicalName: "Хлебцы рисовые", category: ProductCategory.BREAD, aliases: ["rice cakes", "рисовые хлебцы"], unit: "г", avgPriceRub: 80, caloriesPer100g: 387, proteinPer100g: 7.9, fatPer100g: 2.8, carbsPer100g: 80.3, source: ProductSource.MANUAL },

    // ─── ОВОЩИ ─────────────────────────────────────────────────────────────
    { canonicalName: "Помидоры", category: ProductCategory.VEGETABLES, aliases: ["томаты", "tomatoes"], unit: "г", avgPriceRub: 120, caloriesPer100g: 20, proteinPer100g: 1.1, fatPer100g: 0.2, carbsPer100g: 3.8, source: ProductSource.MANUAL },
    { canonicalName: "Огурцы", category: ProductCategory.VEGETABLES, aliases: ["cucumber", "свежие огурцы"], unit: "г", avgPriceRub: 80, caloriesPer100g: 15, proteinPer100g: 0.8, fatPer100g: 0.1, carbsPer100g: 2.5, source: ProductSource.MANUAL },
    { canonicalName: "Капуста белокочанная", category: ProductCategory.VEGETABLES, aliases: ["капуста", "white cabbage"], unit: "г", avgPriceRub: 30, caloriesPer100g: 27, proteinPer100g: 1.8, fatPer100g: 0.1, carbsPer100g: 4.7, source: ProductSource.MANUAL },
    { canonicalName: "Капуста цветная", category: ProductCategory.VEGETABLES, aliases: ["cauliflower", "цветная капуста"], unit: "г", avgPriceRub: 120, caloriesPer100g: 30, proteinPer100g: 2.5, fatPer100g: 0.3, carbsPer100g: 4.2, source: ProductSource.MANUAL },
    { canonicalName: "Брокколи", category: ProductCategory.VEGETABLES, aliases: ["broccoli"], unit: "г", avgPriceRub: 150, caloriesPer100g: 28, proteinPer100g: 2.8, fatPer100g: 0.4, carbsPer100g: 3.5, source: ProductSource.MANUAL },
    { canonicalName: "Перец болгарский", category: ProductCategory.VEGETABLES, aliases: ["bell pepper", "сладкий перец"], unit: "г", avgPriceRub: 150, caloriesPer100g: 31, proteinPer100g: 1.3, fatPer100g: 0.3, carbsPer100g: 5.4, source: ProductSource.MANUAL },
    { canonicalName: "Баклажан", category: ProductCategory.VEGETABLES, aliases: ["eggplant", "aubergine"], unit: "г", avgPriceRub: 100, caloriesPer100g: 24, proteinPer100g: 1.2, fatPer100g: 0.1, carbsPer100g: 4.5, source: ProductSource.MANUAL },
    { canonicalName: "Кабачок", category: ProductCategory.VEGETABLES, aliases: ["zucchini", "цуккини"], unit: "г", avgPriceRub: 80, caloriesPer100g: 23, proteinPer100g: 0.6, fatPer100g: 0.3, carbsPer100g: 4.6, source: ProductSource.MANUAL },
    { canonicalName: "Свекла", category: ProductCategory.VEGETABLES, aliases: ["beet", "свёкла"], unit: "г", avgPriceRub: 35, caloriesPer100g: 43, proteinPer100g: 1.5, fatPer100g: 0.1, carbsPer100g: 8.8, source: ProductSource.MANUAL },
    { canonicalName: "Чеснок", category: ProductCategory.VEGETABLES, aliases: ["garlic", "чесночок"], unit: "г", avgPriceRub: 200, caloriesPer100g: 143, proteinPer100g: 6.5, fatPer100g: 0.5, carbsPer100g: 29.9, source: ProductSource.MANUAL },
    { canonicalName: "Шпинат", category: ProductCategory.VEGETABLES, aliases: ["spinach"], unit: "г", avgPriceRub: 120, caloriesPer100g: 23, proteinPer100g: 2.9, fatPer100g: 0.3, carbsPer100g: 2.0, source: ProductSource.MANUAL },
    { canonicalName: "Листья салата", category: ProductCategory.VEGETABLES, aliases: ["lettuce", "салат айсберг", "руккола"], unit: "г", avgPriceRub: 100, caloriesPer100g: 14, proteinPer100g: 1.3, fatPer100g: 0.2, carbsPer100g: 1.6, source: ProductSource.MANUAL },
    { canonicalName: "Зелень петрушка", category: ProductCategory.VEGETABLES, aliases: ["parsley", "петрушка"], unit: "г", avgPriceRub: 50, caloriesPer100g: 47, proteinPer100g: 3.7, fatPer100g: 0.4, carbsPer100g: 6.3, source: ProductSource.MANUAL },
    { canonicalName: "Укроп", category: ProductCategory.VEGETABLES, aliases: ["dill", "зелень укроп"], unit: "г", avgPriceRub: 50, caloriesPer100g: 40, proteinPer100g: 2.5, fatPer100g: 0.5, carbsPer100g: 4.5, source: ProductSource.MANUAL },
    { canonicalName: "Тыква", category: ProductCategory.VEGETABLES, aliases: ["pumpkin", "тыква мускатная"], unit: "г", avgPriceRub: 45, caloriesPer100g: 26, proteinPer100g: 1.0, fatPer100g: 0.1, carbsPer100g: 5.9, source: ProductSource.MANUAL },
    { canonicalName: "Кукуруза консервированная", category: ProductCategory.VEGETABLES, aliases: ["sweet corn", "кукуруза"], unit: "г", avgPriceRub: 70, caloriesPer100g: 73, proteinPer100g: 2.2, fatPer100g: 0.4, carbsPer100g: 15.1, source: ProductSource.MANUAL },
    { canonicalName: "Горошек зелёный консервированный", category: ProductCategory.VEGETABLES, aliases: ["green peas", "горошек"], unit: "г", avgPriceRub: 65, caloriesPer100g: 55, proteinPer100g: 3.6, fatPer100g: 0.4, carbsPer100g: 7.6, source: ProductSource.MANUAL },

    // ─── ФРУКТЫ ────────────────────────────────────────────────────────────
    { canonicalName: "Яблоки", category: ProductCategory.FRUITS, aliases: ["apples", "яблоко"], unit: "г", avgPriceRub: 80, caloriesPer100g: 47, proteinPer100g: 0.4, fatPer100g: 0.4, carbsPer100g: 9.8, source: ProductSource.MANUAL },
    { canonicalName: "Бананы", category: ProductCategory.FRUITS, aliases: ["bananas", "банан"], unit: "г", avgPriceRub: 90, caloriesPer100g: 89, proteinPer100g: 1.1, fatPer100g: 0.3, carbsPer100g: 22.8, source: ProductSource.MANUAL },
    { canonicalName: "Апельсины", category: ProductCategory.FRUITS, aliases: ["oranges", "апельсин"], unit: "г", avgPriceRub: 100, caloriesPer100g: 47, proteinPer100g: 0.9, fatPer100g: 0.2, carbsPer100g: 11.8, source: ProductSource.MANUAL },
    { canonicalName: "Лимон", category: ProductCategory.FRUITS, aliases: ["lemon"], unit: "г", avgPriceRub: 130, caloriesPer100g: 34, proteinPer100g: 0.9, fatPer100g: 0.1, carbsPer100g: 3.0, source: ProductSource.MANUAL },
    { canonicalName: "Клубника", category: ProductCategory.FRUITS, aliases: ["strawberry", "земляника"], unit: "г", avgPriceRub: 350, caloriesPer100g: 32, proteinPer100g: 0.8, fatPer100g: 0.4, carbsPer100g: 6.5, source: ProductSource.MANUAL },
    { canonicalName: "Черника", category: ProductCategory.FRUITS, aliases: ["blueberry", "голубика"], unit: "г", avgPriceRub: 500, caloriesPer100g: 57, proteinPer100g: 0.7, fatPer100g: 0.5, carbsPer100g: 11.4, source: ProductSource.MANUAL },
    { canonicalName: "Виноград", category: ProductCategory.FRUITS, aliases: ["grapes", "grape"], unit: "г", avgPriceRub: 200, caloriesPer100g: 72, proteinPer100g: 0.6, fatPer100g: 0.2, carbsPer100g: 15.4, source: ProductSource.MANUAL },
    { canonicalName: "Груша", category: ProductCategory.FRUITS, aliases: ["pear"], unit: "г", avgPriceRub: 120, caloriesPer100g: 42, proteinPer100g: 0.4, fatPer100g: 0.3, carbsPer100g: 10.3, source: ProductSource.MANUAL },
    { canonicalName: "Манго замороженное", category: ProductCategory.FRUITS, aliases: ["mango", "манго"], unit: "г", avgPriceRub: 250, caloriesPer100g: 65, proteinPer100g: 0.5, fatPer100g: 0.3, carbsPer100g: 17.0, source: ProductSource.MANUAL },

    // ─── ОРЕХИ И СЕМЕНА ────────────────────────────────────────────────────
    { canonicalName: "Грецкие орехи", category: ProductCategory.NUTS, aliases: ["walnuts", "грецкий орех"], unit: "г", avgPriceRub: 600, caloriesPer100g: 654, proteinPer100g: 15.2, fatPer100g: 65.2, carbsPer100g: 6.7, source: ProductSource.MANUAL },
    { canonicalName: "Миндаль", category: ProductCategory.NUTS, aliases: ["almonds", "almond"], unit: "г", avgPriceRub: 800, caloriesPer100g: 579, proteinPer100g: 21.2, fatPer100g: 49.9, carbsPer100g: 21.6, source: ProductSource.MANUAL },
    { canonicalName: "Арахис", category: ProductCategory.NUTS, aliases: ["peanuts", "арахис жареный"], unit: "г", avgPriceRub: 250, caloriesPer100g: 567, proteinPer100g: 25.8, fatPer100g: 49.2, carbsPer100g: 16.1, source: ProductSource.MANUAL },
    { canonicalName: "Кешью", category: ProductCategory.NUTS, aliases: ["cashews", "кэшью"], unit: "г", avgPriceRub: 900, caloriesPer100g: 553, proteinPer100g: 18.2, fatPer100g: 43.8, carbsPer100g: 30.2, source: ProductSource.MANUAL },
    { canonicalName: "Семена чиа", category: ProductCategory.NUTS, aliases: ["chia seeds", "чиа"], unit: "г", avgPriceRub: 400, caloriesPer100g: 486, proteinPer100g: 16.5, fatPer100g: 30.7, carbsPer100g: 42.1, source: ProductSource.MANUAL },
    { canonicalName: "Семена льна", category: ProductCategory.NUTS, aliases: ["flax seeds", "льняное семя"], unit: "г", avgPriceRub: 120, caloriesPer100g: 534, proteinPer100g: 18.3, fatPer100g: 42.2, carbsPer100g: 28.9, source: ProductSource.MANUAL },
    { canonicalName: "Семена подсолнечника", category: ProductCategory.NUTS, aliases: ["sunflower seeds", "семечки"], unit: "г", avgPriceRub: 80, caloriesPer100g: 584, proteinPer100g: 20.7, fatPer100g: 51.5, carbsPer100g: 10.5, source: ProductSource.MANUAL },
    { canonicalName: "Арахисовая паста", category: ProductCategory.NUTS, aliases: ["peanut butter", "арахисовое масло"], unit: "г", avgPriceRub: 350, caloriesPer100g: 588, proteinPer100g: 25.1, fatPer100g: 50.4, carbsPer100g: 20.1, source: ProductSource.MANUAL },

    // ─── КОНСЕРВЫ И СОУСЫ ──────────────────────────────────────────────────
    { canonicalName: "Томатная паста", category: ProductCategory.CANNED, aliases: ["tomato paste", "томат паста"], unit: "г", avgPriceRub: 50, caloriesPer100g: 82, proteinPer100g: 4.8, fatPer100g: 0.5, carbsPer100g: 15.9, source: ProductSource.MANUAL },
    { canonicalName: "Фасоль консервированная", category: ProductCategory.CANNED, aliases: ["canned beans", "консервированная фасоль"], unit: "г", avgPriceRub: 80, caloriesPer100g: 99, proteinPer100g: 6.7, fatPer100g: 0.4, carbsPer100g: 17.5, source: ProductSource.MANUAL },
    { canonicalName: "Горбуша консервированная", category: ProductCategory.CANNED, aliases: ["canned salmon", "горбуша в масле"], unit: "г", avgPriceRub: 130, caloriesPer100g: 152, proteinPer100g: 20.5, fatPer100g: 8.0, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Соевый соус", category: ProductCategory.CANNED, aliases: ["soy sauce", "соус соевый"], unit: "мл", avgPriceRub: 120, caloriesPer100g: 53, proteinPer100g: 8.1, fatPer100g: 0.1, carbsPer100g: 4.9, source: ProductSource.MANUAL },
    { canonicalName: "Оливки", category: ProductCategory.CANNED, aliases: ["olives", "маслины"], unit: "г", avgPriceRub: 200, caloriesPer100g: 145, proteinPer100g: 1.0, fatPer100g: 15.3, carbsPer100g: 3.9, source: ProductSource.MANUAL },
    { canonicalName: "Томаты в собственном соку", category: ProductCategory.CANNED, aliases: ["crushed tomatoes", "томаты консервированные"], unit: "г", avgPriceRub: 90, caloriesPer100g: 24, proteinPer100g: 1.1, fatPer100g: 0.2, carbsPer100g: 4.5, source: ProductSource.MANUAL },
    { canonicalName: "Мёд", category: ProductCategory.CANNED, aliases: ["honey", "мёд натуральный"], unit: "г", avgPriceRub: 300, caloriesPer100g: 304, proteinPer100g: 0.8, fatPer100g: 0.0, carbsPer100g: 82.4, source: ProductSource.MANUAL },
    { canonicalName: "Горчица", category: ProductCategory.CANNED, aliases: ["mustard", "горчица дижонская"], unit: "г", avgPriceRub: 80, caloriesPer100g: 66, proteinPer100g: 3.7, fatPer100g: 3.7, carbsPer100g: 4.4, source: ProductSource.MANUAL },
    { canonicalName: "Майонез", category: ProductCategory.CANNED, aliases: ["mayonnaise", "майонез провансаль"], unit: "г", avgPriceRub: 90, caloriesPer100g: 627, proteinPer100g: 2.8, fatPer100g: 67.0, carbsPer100g: 2.6, source: ProductSource.MANUAL },
    { canonicalName: "Кетчуп", category: ProductCategory.CANNED, aliases: ["ketchup", "томатный соус"], unit: "г", avgPriceRub: 80, caloriesPer100g: 93, proteinPer100g: 1.8, fatPer100g: 0.1, carbsPer100g: 22.3, source: ProductSource.MANUAL },

    // ─── СПЕЦИИ ────────────────────────────────────────────────────────────
    { canonicalName: "Соль", category: ProductCategory.SPICES, aliases: ["salt", "поваренная соль"], unit: "г", avgPriceRub: 20, caloriesPer100g: 0, proteinPer100g: 0.0, fatPer100g: 0.0, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Перец чёрный молотый", category: ProductCategory.SPICES, aliases: ["black pepper", "чёрный перец"], unit: "г", avgPriceRub: 80, caloriesPer100g: 255, proteinPer100g: 10.4, fatPer100g: 3.3, carbsPer100g: 38.7, source: ProductSource.MANUAL },
    { canonicalName: "Куркума", category: ProductCategory.SPICES, aliases: ["turmeric"], unit: "г", avgPriceRub: 100, caloriesPer100g: 354, proteinPer100g: 7.8, fatPer100g: 9.9, carbsPer100g: 64.9, source: ProductSource.MANUAL },
    { canonicalName: "Паприка", category: ProductCategory.SPICES, aliases: ["paprika", "паприка молотая"], unit: "г", avgPriceRub: 90, caloriesPer100g: 282, proteinPer100g: 14.1, fatPer100g: 12.9, carbsPer100g: 53.9, source: ProductSource.MANUAL },
    { canonicalName: "Приправа карри", category: ProductCategory.SPICES, aliases: ["curry powder", "карри"], unit: "г", avgPriceRub: 100, caloriesPer100g: 325, proteinPer100g: 14.3, fatPer100g: 14.0, carbsPer100g: 55.8, source: ProductSource.MANUAL },
    { canonicalName: "Корица", category: ProductCategory.SPICES, aliases: ["cinnamon", "корица молотая"], unit: "г", avgPriceRub: 90, caloriesPer100g: 247, proteinPer100g: 4.0, fatPer100g: 1.2, carbsPer100g: 80.6, source: ProductSource.MANUAL },
    { canonicalName: "Лавровый лист", category: ProductCategory.SPICES, aliases: ["bay leaf", "лаврушка"], unit: "г", avgPriceRub: 40, caloriesPer100g: 313, proteinPer100g: 7.6, fatPer100g: 8.4, carbsPer100g: 74.9, source: ProductSource.MANUAL },
    { canonicalName: "Базилик", category: ProductCategory.SPICES, aliases: ["basil", "базилик сушёный"], unit: "г", avgPriceRub: 80, caloriesPer100g: 233, proteinPer100g: 22.9, fatPer100g: 4.1, carbsPer100g: 47.8, source: ProductSource.MANUAL },
    { canonicalName: "Орегано", category: ProductCategory.SPICES, aliases: ["oregano", "душица"], unit: "г", avgPriceRub: 80, caloriesPer100g: 265, proteinPer100g: 9.0, fatPer100g: 4.3, carbsPer100g: 68.9, source: ProductSource.MANUAL },
    { canonicalName: "Имбирь молотый", category: ProductCategory.SPICES, aliases: ["ginger powder", "имбирь"], unit: "г", avgPriceRub: 100, caloriesPer100g: 335, proteinPer100g: 8.9, fatPer100g: 4.2, carbsPer100g: 70.8, source: ProductSource.MANUAL },

    // ─── СЛАДКОЕ / ВЫПЕЧКА ─────────────────────────────────────────────────
    { canonicalName: "Сахар", category: ProductCategory.SWEETS, aliases: ["sugar", "сахарный песок"], unit: "г", avgPriceRub: 70, caloriesPer100g: 387, proteinPer100g: 0.0, fatPer100g: 0.0, carbsPer100g: 99.8, source: ProductSource.MANUAL },
    { canonicalName: "Шоколад горький", category: ProductCategory.SWEETS, aliases: ["dark chocolate", "горький шоколад 70%"], unit: "г", avgPriceRub: 250, caloriesPer100g: 539, proteinPer100g: 5.2, fatPer100g: 35.4, carbsPer100g: 56.4, source: ProductSource.MANUAL },
    { canonicalName: "Мука пшеничная", category: ProductCategory.SWEETS, aliases: ["flour", "пшеничная мука"], unit: "г", avgPriceRub: 55, caloriesPer100g: 364, proteinPer100g: 10.3, fatPer100g: 1.1, carbsPer100g: 76.9, source: ProductSource.MANUAL },
    { canonicalName: "Сода пищевая", category: ProductCategory.SWEETS, aliases: ["baking soda", "пищевая сода"], unit: "г", avgPriceRub: 30, caloriesPer100g: 0, proteinPer100g: 0.0, fatPer100g: 0.0, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Ванилин", category: ProductCategory.SWEETS, aliases: ["vanilla", "ванильный сахар"], unit: "г", avgPriceRub: 30, caloriesPer100g: 288, proteinPer100g: 0.1, fatPer100g: 0.1, carbsPer100g: 72.5, source: ProductSource.MANUAL },
    { canonicalName: "Варенье", category: ProductCategory.SWEETS, aliases: ["jam", "джем"], unit: "г", avgPriceRub: 120, caloriesPer100g: 248, proteinPer100g: 0.3, fatPer100g: 0.1, carbsPer100g: 62.5, source: ProductSource.MANUAL },
    { canonicalName: "Протеин сывороточный", category: ProductCategory.SWEETS, aliases: ["whey protein", "протеин"], unit: "г", avgPriceRub: 1500, caloriesPer100g: 380, proteinPer100g: 75.0, fatPer100g: 5.0, carbsPer100g: 10.0, source: ProductSource.MANUAL },

    // ─── НАПИТКИ ───────────────────────────────────────────────────────────
    { canonicalName: "Чай зелёный", category: ProductCategory.DRINKS, aliases: ["green tea", "зелёный чай"], unit: "г", avgPriceRub: 150, caloriesPer100g: 0, proteinPer100g: 0.0, fatPer100g: 0.0, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Кофе молотый", category: ProductCategory.DRINKS, aliases: ["ground coffee", "кофе"], unit: "г", avgPriceRub: 600, caloriesPer100g: 0, proteinPer100g: 0.0, fatPer100g: 0.0, carbsPer100g: 0.0, source: ProductSource.MANUAL },
    { canonicalName: "Какао порошок", category: ProductCategory.DRINKS, aliases: ["cocoa powder", "какао"], unit: "г", avgPriceRub: 150, caloriesPer100g: 289, proteinPer100g: 24.3, fatPer100g: 15.0, carbsPer100g: 10.2, source: ProductSource.MANUAL },

    // ─── СУПЕРФУДЫ ─────────────────────────────────────────────────────────
    { canonicalName: "Авокадо", category: ProductCategory.FRUITS, aliases: ["avocado"], unit: "г", avgPriceRub: 300, caloriesPer100g: 160, proteinPer100g: 2.0, fatPer100g: 14.7, carbsPer100g: 8.5, source: ProductSource.MANUAL },
    { canonicalName: "Шпинат замороженный", category: ProductCategory.VEGETABLES, aliases: ["frozen spinach"], unit: "г", avgPriceRub: 90, caloriesPer100g: 22, proteinPer100g: 2.2, fatPer100g: 0.3, carbsPer100g: 1.6, source: ProductSource.MANUAL },
    { canonicalName: "Батат", category: ProductCategory.VEGETABLES, aliases: ["sweet potato", "сладкий картофель"], unit: "г", avgPriceRub: 180, caloriesPer100g: 86, proteinPer100g: 1.6, fatPer100g: 0.1, carbsPer100g: 20.1, source: ProductSource.MANUAL },
    { canonicalName: "Кокосовое молоко", category: ProductCategory.DAIRY, aliases: ["coconut milk", "кокосовые сливки"], unit: "мл", avgPriceRub: 200, caloriesPer100g: 230, proteinPer100g: 2.3, fatPer100g: 23.8, carbsPer100g: 5.5, source: ProductSource.MANUAL },
    { canonicalName: "Тофу", category: ProductCategory.MEAT, aliases: ["tofu", "соевый творог"], unit: "г", avgPriceRub: 250, caloriesPer100g: 76, proteinPer100g: 8.1, fatPer100g: 4.2, carbsPer100g: 1.9, source: ProductSource.MANUAL },
  ];

  let added = 0;
  let updated = 0;

  for (const product of products) {
    const existing = await prisma.product.findUnique({ where: { canonicalName: product.canonicalName } });
    await prisma.product.upsert({
      where: { canonicalName: product.canonicalName },
      update: product,
      create: product,
    });
    if (existing) updated++;
    else added++;
  }

  const total = await prisma.product.count();
  console.log(`✓ Добавлено новых: ${added}, обновлено: ${updated}`);
  console.log(`✓ Всего продуктов в БД: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
