import "dotenv/config";
import { PrismaClient, ProductCategory, ProductSource } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const products = [
  // ─── МОЛОЧНЫЕ ───────────────────────────────────────────────────────
  { canonicalName: "Молоко 2.5%", category: ProductCategory.DAIRY, aliases: ["молоко", "milk"], unit: "мл", avgPriceRub: 75, caloriesPer100g: 52, proteinPer100g: 2.8, fatPer100g: 2.5, carbsPer100g: 4.7 },
  { canonicalName: "Кефир 1%", category: ProductCategory.DAIRY, aliases: ["кефир"], unit: "мл", avgPriceRub: 65, caloriesPer100g: 40, proteinPer100g: 2.8, fatPer100g: 1.0, carbsPer100g: 4.0 },
  { canonicalName: "Творог 5%", category: ProductCategory.DAIRY, aliases: ["творог", "cottage cheese"], unit: "г", avgPriceRub: 160, caloriesPer100g: 121, proteinPer100g: 17.2, fatPer100g: 5.0, carbsPer100g: 1.8 },
  { canonicalName: "Сыр Российский", category: ProductCategory.DAIRY, aliases: ["сыр", "cheese"], unit: "г", avgPriceRub: 580, caloriesPer100g: 364, proteinPer100g: 23.0, fatPer100g: 30.0, carbsPer100g: 0.0 },
  { canonicalName: "Сметана 15%", category: ProductCategory.DAIRY, aliases: ["сметана", "sour cream"], unit: "г", avgPriceRub: 90, caloriesPer100g: 158, proteinPer100g: 2.6, fatPer100g: 15.0, carbsPer100g: 3.0 },
  { canonicalName: "Йогурт натуральный", category: ProductCategory.DAIRY, aliases: ["йогурт", "yogurt"], unit: "г", avgPriceRub: 80, caloriesPer100g: 68, proteinPer100g: 5.0, fatPer100g: 3.2, carbsPer100g: 3.5 },
  { canonicalName: "Молоко 3.2%", category: ProductCategory.DAIRY, aliases: ["молоко жирное"], unit: "мл", avgPriceRub: 85, caloriesPer100g: 59, proteinPer100g: 2.9, fatPer100g: 3.2, carbsPer100g: 4.7 },
  { canonicalName: "Ряженка", category: ProductCategory.DAIRY, aliases: ["ряженка", "baked milk"], unit: "мл", avgPriceRub: 70, caloriesPer100g: 85, proteinPer100g: 2.8, fatPer100g: 4.0, carbsPer100g: 4.2 },
  { canonicalName: "Творог 0%", category: ProductCategory.DAIRY, aliases: ["творог обезжиренный"], unit: "г", avgPriceRub: 130, caloriesPer100g: 71, proteinPer100g: 16.5, fatPer100g: 0.1, carbsPer100g: 1.3 },
  { canonicalName: "Сливки 10%", category: ProductCategory.DAIRY, aliases: ["сливки"], unit: "мл", avgPriceRub: 120, caloriesPer100g: 118, proteinPer100g: 2.8, fatPer100g: 10.0, carbsPer100g: 4.0 },
  { canonicalName: "Масло сливочное 82%", category: ProductCategory.DAIRY, aliases: ["сливочное масло", "butter"], unit: "г", avgPriceRub: 180, caloriesPer100g: 748, proteinPer100g: 0.5, fatPer100g: 82.5, carbsPer100g: 0.8 },

  // ─── МЯСО / ПТИЦА ───────────────────────────────────────────────────
  { canonicalName: "Куриная грудка", category: ProductCategory.MEAT, aliases: ["грудка курицы", "chicken breast", "куриное филе"], unit: "г", avgPriceRub: 380, caloriesPer100g: 113, proteinPer100g: 23.6, fatPer100g: 1.9, carbsPer100g: 0.4 },
  { canonicalName: "Куриное бедро", category: ProductCategory.MEAT, aliases: ["бедро курицы", "chicken thigh"], unit: "г", avgPriceRub: 220, caloriesPer100g: 185, proteinPer100g: 18.0, fatPer100g: 12.0, carbsPer100g: 0.0 },
  { canonicalName: "Свинина шейка", category: ProductCategory.MEAT, aliases: ["шейка свиная", "свинина"], unit: "г", avgPriceRub: 420, caloriesPer100g: 343, proteinPer100g: 13.0, fatPer100g: 31.0, carbsPer100g: 0.0 },
  { canonicalName: "Говядина", category: ProductCategory.MEAT, aliases: ["говяжье мясо", "beef"], unit: "г", avgPriceRub: 520, caloriesPer100g: 187, proteinPer100g: 20.0, fatPer100g: 12.0, carbsPer100g: 0.0 },
  { canonicalName: "Фарш куриный", category: ProductCategory.MEAT, aliases: ["куриный фарш", "chicken mince"], unit: "г", avgPriceRub: 280, caloriesPer100g: 143, proteinPer100g: 17.0, fatPer100g: 8.0, carbsPer100g: 0.0 },
  { canonicalName: "Фарш смешанный", category: ProductCategory.MEAT, aliases: ["фарш говядина свинина", "mixed mince"], unit: "г", avgPriceRub: 350, caloriesPer100g: 255, proteinPer100g: 15.0, fatPer100g: 21.0, carbsPer100g: 0.0 },
  { canonicalName: "Куриные голени", category: ProductCategory.MEAT, aliases: ["голени курицы", "chicken drumsticks"], unit: "г", avgPriceRub: 180, caloriesPer100g: 158, proteinPer100g: 19.0, fatPer100g: 9.0, carbsPer100g: 0.0 },
  { canonicalName: "Индейка грудка", category: ProductCategory.MEAT, aliases: ["индейка", "turkey breast"], unit: "г", avgPriceRub: 420, caloriesPer100g: 104, proteinPer100g: 19.2, fatPer100g: 2.6, carbsPer100g: 0.0 },

  // ─── РЫБА ───────────────────────────────────────────────────────────
  { canonicalName: "Минтай", category: ProductCategory.FISH, aliases: ["minty", "pollock"], unit: "г", avgPriceRub: 180, caloriesPer100g: 72, proteinPer100g: 16.0, fatPer100g: 1.0, carbsPer100g: 0.0 },
  { canonicalName: "Горбуша", category: ProductCategory.FISH, aliases: ["pink salmon"], unit: "г", avgPriceRub: 280, caloriesPer100g: 142, proteinPer100g: 21.0, fatPer100g: 6.0, carbsPer100g: 0.0 },
  { canonicalName: "Треска", category: ProductCategory.FISH, aliases: ["cod", "треска свежая"], unit: "г", avgPriceRub: 320, caloriesPer100g: 69, proteinPer100g: 16.0, fatPer100g: 0.6, carbsPer100g: 0.0 },
  { canonicalName: "Сельдь", category: ProductCategory.FISH, aliases: ["herring", "selid"], unit: "г", avgPriceRub: 150, caloriesPer100g: 145, proteinPer100g: 17.0, fatPer100g: 9.0, carbsPer100g: 0.0 },
  { canonicalName: "Скумбрия", category: ProductCategory.FISH, aliases: ["mackerel"], unit: "г", avgPriceRub: 200, caloriesPer100g: 191, proteinPer100g: 18.0, fatPer100g: 13.0, carbsPer100g: 0.0 },
  { canonicalName: "Тунец консервированный", category: ProductCategory.FISH, aliases: ["тунец", "tuna"], unit: "г", avgPriceRub: 250, caloriesPer100g: 96, proteinPer100g: 22.0, fatPer100g: 0.7, carbsPer100g: 0.0 },

  // ─── КРУПЫ ──────────────────────────────────────────────────────────
  { canonicalName: "Гречка", category: ProductCategory.GRAINS, aliases: ["гречневая крупа", "buckwheat"], unit: "г", avgPriceRub: 85, caloriesPer100g: 313, proteinPer100g: 12.6, fatPer100g: 3.3, carbsPer100g: 57.1 },
  { canonicalName: "Рис", category: ProductCategory.GRAINS, aliases: ["рис круглозерный", "rice"], unit: "г", avgPriceRub: 70, caloriesPer100g: 344, proteinPer100g: 6.7, fatPer100g: 0.7, carbsPer100g: 78.9 },
  { canonicalName: "Овсянка", category: ProductCategory.GRAINS, aliases: ["овсяные хлопья", "oatmeal", "геркулес"], unit: "г", avgPriceRub: 60, caloriesPer100g: 352, proteinPer100g: 11.9, fatPer100g: 6.1, carbsPer100g: 61.8 },
  { canonicalName: "Пшено", category: ProductCategory.GRAINS, aliases: ["пшённая крупа", "millet"], unit: "г", avgPriceRub: 50, caloriesPer100g: 348, proteinPer100g: 11.5, fatPer100g: 3.3, carbsPer100g: 66.5 },
  { canonicalName: "Булгур", category: ProductCategory.GRAINS, aliases: ["bulgur"], unit: "г", avgPriceRub: 90, caloriesPer100g: 342, proteinPer100g: 12.3, fatPer100g: 1.3, carbsPer100g: 75.9 },
  { canonicalName: "Макароны", category: ProductCategory.GRAINS, aliases: ["паста", "pasta"], unit: "г", avgPriceRub: 65, caloriesPer100g: 338, proteinPer100g: 10.4, fatPer100g: 1.1, carbsPer100g: 69.7 },
  { canonicalName: "Спагетти", category: ProductCategory.GRAINS, aliases: ["spaghetti"], unit: "г", avgPriceRub: 75, caloriesPer100g: 344, proteinPer100g: 10.7, fatPer100g: 1.3, carbsPer100g: 70.5 },
  { canonicalName: "Перловка", category: ProductCategory.GRAINS, aliases: ["перловая крупа", "barley"], unit: "г", avgPriceRub: 45, caloriesPer100g: 320, proteinPer100g: 9.3, fatPer100g: 1.1, carbsPer100g: 66.9 },
  { canonicalName: "Кукурузная крупа", category: ProductCategory.GRAINS, aliases: ["кукурузная каша", "cornmeal"], unit: "г", avgPriceRub: 55, caloriesPer100g: 325, proteinPer100g: 8.3, fatPer100g: 1.2, carbsPer100g: 71.0 },

  // ─── ОВОЩИ ──────────────────────────────────────────────────────────
  { canonicalName: "Картофель", category: ProductCategory.VEGETABLES, aliases: ["картошка", "potato"], unit: "г", avgPriceRub: 35, caloriesPer100g: 77, proteinPer100g: 2.0, fatPer100g: 0.4, carbsPer100g: 16.3 },
  { canonicalName: "Морковь", category: ProductCategory.VEGETABLES, aliases: ["carrot"], unit: "г", avgPriceRub: 30, caloriesPer100g: 41, proteinPer100g: 0.9, fatPer100g: 0.1, carbsPer100g: 9.6 },
  { canonicalName: "Лук репчатый", category: ProductCategory.VEGETABLES, aliases: ["лук", "onion"], unit: "г", avgPriceRub: 25, caloriesPer100g: 41, proteinPer100g: 1.4, fatPer100g: 0.0, carbsPer100g: 8.2 },
  { canonicalName: "Капуста белокочанная", category: ProductCategory.VEGETABLES, aliases: ["капуста", "cabbage"], unit: "г", avgPriceRub: 28, caloriesPer100g: 27, proteinPer100g: 1.8, fatPer100g: 0.1, carbsPer100g: 4.7 },
  { canonicalName: "Помидоры", category: ProductCategory.VEGETABLES, aliases: ["томаты", "tomatoes"], unit: "г", avgPriceRub: 120, caloriesPer100g: 20, proteinPer100g: 1.1, fatPer100g: 0.2, carbsPer100g: 3.7 },
  { canonicalName: "Огурцы", category: ProductCategory.VEGETABLES, aliases: ["cucumber"], unit: "г", avgPriceRub: 90, caloriesPer100g: 15, proteinPer100g: 0.8, fatPer100g: 0.1, carbsPer100g: 2.5 },
  { canonicalName: "Перец болгарский", category: ProductCategory.VEGETABLES, aliases: ["болгарский перец", "bell pepper"], unit: "г", avgPriceRub: 180, caloriesPer100g: 31, proteinPer100g: 1.3, fatPer100g: 0.3, carbsPer100g: 5.4 },
  { canonicalName: "Кабачок", category: ProductCategory.VEGETABLES, aliases: ["zucchini", "цуккини"], unit: "г", avgPriceRub: 60, caloriesPer100g: 24, proteinPer100g: 0.6, fatPer100g: 0.3, carbsPer100g: 4.6 },
  { canonicalName: "Свёкла", category: ProductCategory.VEGETABLES, aliases: ["свекла", "beet"], unit: "г", avgPriceRub: 30, caloriesPer100g: 43, proteinPer100g: 1.5, fatPer100g: 0.1, carbsPer100g: 9.6 },
  { canonicalName: "Чеснок", category: ProductCategory.VEGETABLES, aliases: ["garlic"], unit: "г", avgPriceRub: 150, caloriesPer100g: 143, proteinPer100g: 6.5, fatPer100g: 0.5, carbsPer100g: 29.9 },
  { canonicalName: "Брокколи", category: ProductCategory.VEGETABLES, aliases: ["broccoli"], unit: "г", avgPriceRub: 130, caloriesPer100g: 34, proteinPer100g: 2.8, fatPer100g: 0.4, carbsPer100g: 6.6 },
  { canonicalName: "Цветная капуста", category: ProductCategory.VEGETABLES, aliases: ["cauliflower"], unit: "г", avgPriceRub: 110, caloriesPer100g: 30, proteinPer100g: 2.5, fatPer100g: 0.3, carbsPer100g: 5.4 },
  { canonicalName: "Баклажан", category: ProductCategory.VEGETABLES, aliases: ["eggplant", "aubergine"], unit: "г", avgPriceRub: 90, caloriesPer100g: 24, proteinPer100g: 1.2, fatPer100g: 0.1, carbsPer100g: 4.5 },
  { canonicalName: "Тыква", category: ProductCategory.VEGETABLES, aliases: ["pumpkin"], unit: "г", avgPriceRub: 45, caloriesPer100g: 28, proteinPer100g: 1.0, fatPer100g: 0.1, carbsPer100g: 6.5 },
  { canonicalName: "Шпинат", category: ProductCategory.VEGETABLES, aliases: ["spinach"], unit: "г", avgPriceRub: 100, caloriesPer100g: 23, proteinPer100g: 2.9, fatPer100g: 0.4, carbsPer100g: 2.0 },
  { canonicalName: "Сельдерей", category: ProductCategory.VEGETABLES, aliases: ["celery"], unit: "г", avgPriceRub: 80, caloriesPer100g: 13, proteinPer100g: 0.9, fatPer100g: 0.1, carbsPer100g: 2.1 },

  // ─── ФРУКТЫ ─────────────────────────────────────────────────────────
  { canonicalName: "Яблоки", category: ProductCategory.FRUITS, aliases: ["яблоко", "apple"], unit: "г", avgPriceRub: 90, caloriesPer100g: 52, proteinPer100g: 0.3, fatPer100g: 0.2, carbsPer100g: 13.8 },
  { canonicalName: "Бананы", category: ProductCategory.FRUITS, aliases: ["банан", "banana"], unit: "г", avgPriceRub: 80, caloriesPer100g: 89, proteinPer100g: 1.1, fatPer100g: 0.3, carbsPer100g: 22.8 },
  { canonicalName: "Апельсины", category: ProductCategory.FRUITS, aliases: ["апельсин", "orange"], unit: "г", avgPriceRub: 100, caloriesPer100g: 47, proteinPer100g: 0.9, fatPer100g: 0.2, carbsPer100g: 11.8 },
  { canonicalName: "Лимоны", category: ProductCategory.FRUITS, aliases: ["лимон", "lemon"], unit: "г", avgPriceRub: 120, caloriesPer100g: 29, proteinPer100g: 1.1, fatPer100g: 0.3, carbsPer100g: 9.3 },
  { canonicalName: "Груши", category: ProductCategory.FRUITS, aliases: ["груша", "pear"], unit: "г", avgPriceRub: 110, caloriesPer100g: 57, proteinPer100g: 0.4, fatPer100g: 0.3, carbsPer100g: 15.2 },
  { canonicalName: "Мандарины", category: ProductCategory.FRUITS, aliases: ["мандарин", "tangerine"], unit: "г", avgPriceRub: 130, caloriesPer100g: 53, proteinPer100g: 0.8, fatPer100g: 0.2, carbsPer100g: 13.3 },

  // ─── ХЛЕБ ───────────────────────────────────────────────────────────
  { canonicalName: "Хлеб белый", category: ProductCategory.BREAD, aliases: ["батон", "white bread"], unit: "г", avgPriceRub: 45, caloriesPer100g: 242, proteinPer100g: 8.1, fatPer100g: 1.0, carbsPer100g: 48.8 },
  { canonicalName: "Хлеб чёрный", category: ProductCategory.BREAD, aliases: ["ржаной хлеб", "black bread", "бородинский"], unit: "г", avgPriceRub: 40, caloriesPer100g: 201, proteinPer100g: 6.8, fatPer100g: 1.3, carbsPer100g: 40.7 },
  { canonicalName: "Лаваш", category: ProductCategory.BREAD, aliases: ["тонкий лаваш", "lavash"], unit: "г", avgPriceRub: 35, caloriesPer100g: 277, proteinPer100g: 9.1, fatPer100g: 1.1, carbsPer100g: 57.9 },
  { canonicalName: "Хлебцы цельнозерновые", category: ProductCategory.BREAD, aliases: ["хлебцы", "crispbread"], unit: "г", avgPriceRub: 90, caloriesPer100g: 295, proteinPer100g: 9.6, fatPer100g: 1.4, carbsPer100g: 61.4 },

  // ─── ЯЙЦА / МАСЛА ───────────────────────────────────────────────────
  { canonicalName: "Яйца С1", category: ProductCategory.EGGS_OILS, aliases: ["яйцо", "eggs"], unit: "шт", avgPriceRub: 95, caloriesPer100g: 157, proteinPer100g: 12.7, fatPer100g: 11.5, carbsPer100g: 0.7 },
  { canonicalName: "Масло подсолнечное", category: ProductCategory.EGGS_OILS, aliases: ["подсолнечное масло", "sunflower oil"], unit: "мл", avgPriceRub: 110, caloriesPer100g: 884, proteinPer100g: 0.0, fatPer100g: 100.0, carbsPer100g: 0.0 },
  { canonicalName: "Масло оливковое", category: ProductCategory.EGGS_OILS, aliases: ["оливковое масло", "olive oil"], unit: "мл", avgPriceRub: 450, caloriesPer100g: 884, proteinPer100g: 0.0, fatPer100g: 100.0, carbsPer100g: 0.0 },

  // ─── БАКАЛЕЯ ────────────────────────────────────────────────────────
  { canonicalName: "Мука пшеничная", category: ProductCategory.GROCERY, aliases: ["мука", "flour"], unit: "г", avgPriceRub: 55, caloriesPer100g: 364, proteinPer100g: 10.3, fatPer100g: 1.1, carbsPer100g: 74.9 },
  { canonicalName: "Сахар", category: ProductCategory.GROCERY, aliases: ["sugar"], unit: "г", avgPriceRub: 60, caloriesPer100g: 399, proteinPer100g: 0.0, fatPer100g: 0.0, carbsPer100g: 99.8 },
  { canonicalName: "Соль", category: ProductCategory.GROCERY, aliases: ["salt"], unit: "г", avgPriceRub: 20, caloriesPer100g: 0, proteinPer100g: 0.0, fatPer100g: 0.0, carbsPer100g: 0.0 },
  { canonicalName: "Томатная паста", category: ProductCategory.GROCERY, aliases: ["томат паста", "tomato paste"], unit: "г", avgPriceRub: 45, caloriesPer100g: 82, proteinPer100g: 4.8, fatPer100g: 0.5, carbsPer100g: 17.3 },
  { canonicalName: "Соевый соус", category: ProductCategory.GROCERY, aliases: ["соевый", "soy sauce"], unit: "мл", avgPriceRub: 80, caloriesPer100g: 53, proteinPer100g: 8.1, fatPer100g: 0.0, carbsPer100g: 4.9 },
  { canonicalName: "Уксус 9%", category: ProductCategory.GROCERY, aliases: ["уксус", "vinegar"], unit: "мл", avgPriceRub: 25, caloriesPer100g: 11, proteinPer100g: 0.0, fatPer100g: 0.0, carbsPer100g: 0.0 },
  { canonicalName: "Горчица", category: ProductCategory.GROCERY, aliases: ["mustard"], unit: "г", avgPriceRub: 50, caloriesPer100g: 143, proteinPer100g: 5.7, fatPer100g: 6.4, carbsPer100g: 12.7 },
  { canonicalName: "Майонез", category: ProductCategory.GROCERY, aliases: ["mayonnaise"], unit: "г", avgPriceRub: 70, caloriesPer100g: 680, proteinPer100g: 2.8, fatPer100g: 73.5, carbsPer100g: 2.4 },
  { canonicalName: "Томаты в собственном соку", category: ProductCategory.GROCERY, aliases: ["томаты консервированные", "canned tomatoes"], unit: "г", avgPriceRub: 85, caloriesPer100g: 32, proteinPer100g: 1.6, fatPer100g: 0.3, carbsPer100g: 6.0 },
  { canonicalName: "Оливки", category: ProductCategory.GROCERY, aliases: ["olives"], unit: "г", avgPriceRub: 120, caloriesPer100g: 145, proteinPer100g: 1.0, fatPer100g: 15.3, carbsPer100g: 3.8 },
  { canonicalName: "Растительное масло для жарки", category: ProductCategory.GROCERY, aliases: ["масло для жарки"], unit: "мл", avgPriceRub: 100, caloriesPer100g: 884, proteinPer100g: 0.0, fatPer100g: 100.0, carbsPer100g: 0.0 },

  // ─── ЗАМОРОЗКА ──────────────────────────────────────────────────────
  { canonicalName: "Замороженные овощи смесь", category: ProductCategory.FROZEN, aliases: ["овощная смесь замороженная", "frozen vegetables"], unit: "г", avgPriceRub: 120, caloriesPer100g: 55, proteinPer100g: 3.0, fatPer100g: 0.5, carbsPer100g: 10.0 },
  { canonicalName: "Замороженный горошек", category: ProductCategory.FROZEN, aliases: ["горошек замороженный", "frozen peas"], unit: "г", avgPriceRub: 90, caloriesPer100g: 73, proteinPer100g: 5.4, fatPer100g: 0.4, carbsPer100g: 11.3 },
  { canonicalName: "Замороженная кукуруза", category: ProductCategory.FROZEN, aliases: ["кукуруза замороженная", "frozen corn"], unit: "г", avgPriceRub: 85, caloriesPer100g: 86, proteinPer100g: 3.2, fatPer100g: 1.0, carbsPer100g: 17.0 },
  { canonicalName: "Замороженная брокколи", category: ProductCategory.FROZEN, aliases: ["брокколи замороженная", "frozen broccoli"], unit: "г", avgPriceRub: 110, caloriesPer100g: 28, proteinPer100g: 2.8, fatPer100g: 0.4, carbsPer100g: 5.0 },
  { canonicalName: "Замороженные ягоды", category: ProductCategory.FROZEN, aliases: ["ягоды замороженные", "frozen berries"], unit: "г", avgPriceRub: 150, caloriesPer100g: 50, proteinPer100g: 0.8, fatPer100g: 0.3, carbsPer100g: 11.5 },

  // ─── НАПИТКИ ────────────────────────────────────────────────────────
  { canonicalName: "Чай чёрный", category: ProductCategory.DRINKS, aliases: ["чай", "black tea"], unit: "г", avgPriceRub: 150, caloriesPer100g: 0, proteinPer100g: 0.0, fatPer100g: 0.0, carbsPer100g: 0.0 },
  { canonicalName: "Кофе молотый", category: ProductCategory.DRINKS, aliases: ["кофе", "coffee"], unit: "г", avgPriceRub: 500, caloriesPer100g: 0, proteinPer100g: 0.0, fatPer100g: 0.0, carbsPer100g: 0.0 },
  { canonicalName: "Какао порошок", category: ProductCategory.DRINKS, aliases: ["какао", "cocoa"], unit: "г", avgPriceRub: 120, caloriesPer100g: 289, proteinPer100g: 24.3, fatPer100g: 15.0, carbsPer100g: 10.2 },

  // ─── ПРОЧЕЕ (орехи, мёд, бобовые) ──────────────────────────────────
  { canonicalName: "Грецкие орехи", category: ProductCategory.OTHER, aliases: ["орехи", "walnuts"], unit: "г", avgPriceRub: 600, caloriesPer100g: 654, proteinPer100g: 15.2, fatPer100g: 65.2, carbsPer100g: 7.0 },
  { canonicalName: "Мёд", category: ProductCategory.OTHER, aliases: ["honey"], unit: "г", avgPriceRub: 350, caloriesPer100g: 304, proteinPer100g: 0.8, fatPer100g: 0.0, carbsPer100g: 80.3 },
  { canonicalName: "Фасоль красная", category: ProductCategory.OTHER, aliases: ["фасоль", "red beans", "бобы"], unit: "г", avgPriceRub: 80, caloriesPer100g: 337, proteinPer100g: 21.0, fatPer100g: 2.0, carbsPer100g: 54.3 },
  { canonicalName: "Чечевица", category: ProductCategory.OTHER, aliases: ["lentils"], unit: "г", avgPriceRub: 90, caloriesPer100g: 295, proteinPer100g: 24.0, fatPer100g: 1.1, carbsPer100g: 46.3 },
  { canonicalName: "Нут", category: ProductCategory.OTHER, aliases: ["chickpeas", "горох нут"], unit: "г", avgPriceRub: 100, caloriesPer100g: 364, proteinPer100g: 19.0, fatPer100g: 6.0, carbsPer100g: 60.6 },
  { canonicalName: "Миндаль", category: ProductCategory.OTHER, aliases: ["almonds"], unit: "г", avgPriceRub: 700, caloriesPer100g: 575, proteinPer100g: 21.2, fatPer100g: 49.4, carbsPer100g: 13.5 },
  { canonicalName: "Семена подсолнечника", category: ProductCategory.OTHER, aliases: ["семечки", "sunflower seeds"], unit: "г", avgPriceRub: 80, caloriesPer100g: 601, proteinPer100g: 20.7, fatPer100g: 52.9, carbsPer100g: 10.5 },
  { canonicalName: "Изюм", category: ProductCategory.OTHER, aliases: ["raisins", "сухофрукты"], unit: "г", avgPriceRub: 180, caloriesPer100g: 264, proteinPer100g: 1.8, fatPer100g: 0.0, carbsPer100g: 66.0 },

  // ─── МОЛОЧНЫЕ (доп.) ────────────────────────────────────────────────
  { canonicalName: "Творог 9%", category: ProductCategory.DAIRY, aliases: ["творог жирный"], unit: "г", avgPriceRub: 180, caloriesPer100g: 159, proteinPer100g: 16.7, fatPer100g: 9.0, carbsPer100g: 2.0 },
  { canonicalName: "Сыр Пармезан", category: ProductCategory.DAIRY, aliases: ["пармезан", "parmesan"], unit: "г", avgPriceRub: 1200, caloriesPer100g: 392, proteinPer100g: 35.7, fatPer100g: 26.0, carbsPer100g: 0.0 },
  { canonicalName: "Сыр Моцарелла", category: ProductCategory.DAIRY, aliases: ["моцарелла", "mozzarella"], unit: "г", avgPriceRub: 450, caloriesPer100g: 280, proteinPer100g: 18.0, fatPer100g: 22.0, carbsPer100g: 0.0 },
  { canonicalName: "Сыр Фета", category: ProductCategory.DAIRY, aliases: ["фета", "feta"], unit: "г", avgPriceRub: 380, caloriesPer100g: 264, proteinPer100g: 14.2, fatPer100g: 21.3, carbsPer100g: 4.1 },
  { canonicalName: "Молоко 1.5%", category: ProductCategory.DAIRY, aliases: ["молоко нежирное"], unit: "мл", avgPriceRub: 70, caloriesPer100g: 44, proteinPer100g: 2.8, fatPer100g: 1.5, carbsPer100g: 4.7 },
  { canonicalName: "Кефир 2.5%", category: ProductCategory.DAIRY, aliases: ["кефир жирный"], unit: "мл", avgPriceRub: 75, caloriesPer100g: 53, proteinPer100g: 2.9, fatPer100g: 2.5, carbsPer100g: 4.0 },
  { canonicalName: "Простокваша", category: ProductCategory.DAIRY, aliases: ["простокваша"], unit: "мл", avgPriceRub: 65, caloriesPer100g: 59, proteinPer100g: 2.9, fatPer100g: 2.5, carbsPer100g: 4.1 },
  { canonicalName: "Сметана 20%", category: ProductCategory.DAIRY, aliases: ["сметана жирная"], unit: "г", avgPriceRub: 100, caloriesPer100g: 206, proteinPer100g: 2.5, fatPer100g: 20.0, carbsPer100g: 3.4 },
  { canonicalName: "Глазированный сырок", category: ProductCategory.DAIRY, aliases: ["сырок глазированный"], unit: "шт", avgPriceRub: 35, caloriesPer100g: 315, proteinPer100g: 8.5, fatPer100g: 18.0, carbsPer100g: 30.0 },

  // ─── МЯСО (доп.) ────────────────────────────────────────────────────
  { canonicalName: "Свинина вырезка", category: ProductCategory.MEAT, aliases: ["вырезка свиная", "pork tenderloin"], unit: "г", avgPriceRub: 480, caloriesPer100g: 142, proteinPer100g: 19.4, fatPer100g: 7.1, carbsPer100g: 0.0 },
  { canonicalName: "Куриные крылья", category: ProductCategory.MEAT, aliases: ["крылья курицы", "chicken wings"], unit: "г", avgPriceRub: 160, caloriesPer100g: 186, proteinPer100g: 18.0, fatPer100g: 12.0, carbsPer100g: 0.0 },
  { canonicalName: "Утка", category: ProductCategory.MEAT, aliases: ["утиное мясо", "duck"], unit: "г", avgPriceRub: 380, caloriesPer100g: 308, proteinPer100g: 16.0, fatPer100g: 28.0, carbsPer100g: 0.0 },
  { canonicalName: "Кролик", category: ProductCategory.MEAT, aliases: ["крольчатина", "rabbit"], unit: "г", avgPriceRub: 560, caloriesPer100g: 183, proteinPer100g: 21.0, fatPer100g: 11.0, carbsPer100g: 0.0 },
  { canonicalName: "Колбаса варёная", category: ProductCategory.MEAT, aliases: ["докторская", "вареная колбаса"], unit: "г", avgPriceRub: 320, caloriesPer100g: 257, proteinPer100g: 13.7, fatPer100g: 22.8, carbsPer100g: 0.0 },
  { canonicalName: "Сосиски куриные", category: ProductCategory.MEAT, aliases: ["сосиски", "chicken sausages"], unit: "г", avgPriceRub: 280, caloriesPer100g: 220, proteinPer100g: 13.0, fatPer100g: 18.0, carbsPer100g: 2.0 },
  { canonicalName: "Говяжий фарш", category: ProductCategory.MEAT, aliases: ["фарш говяжий", "beef mince"], unit: "г", avgPriceRub: 420, caloriesPer100g: 254, proteinPer100g: 17.2, fatPer100g: 20.0, carbsPer100g: 0.0 },
  { canonicalName: "Печень куриная", category: ProductCategory.MEAT, aliases: ["куриная печень", "chicken liver"], unit: "г", avgPriceRub: 180, caloriesPer100g: 137, proteinPer100g: 20.4, fatPer100g: 5.9, carbsPer100g: 0.73 },
  { canonicalName: "Сердце куриное", category: ProductCategory.MEAT, aliases: ["куриные сердечки"], unit: "г", avgPriceRub: 200, caloriesPer100g: 159, proteinPer100g: 16.0, fatPer100g: 10.3, carbsPer100g: 0.8 },

  // ─── РЫБА (доп.) ────────────────────────────────────────────────────
  { canonicalName: "Лосось", category: ProductCategory.FISH, aliases: ["сёмга", "salmon"], unit: "г", avgPriceRub: 850, caloriesPer100g: 208, proteinPer100g: 20.0, fatPer100g: 13.4, carbsPer100g: 0.0 },
  { canonicalName: "Форель", category: ProductCategory.FISH, aliases: ["trout"], unit: "г", avgPriceRub: 680, caloriesPer100g: 97, proteinPer100g: 19.0, fatPer100g: 2.1, carbsPer100g: 0.0 },
  { canonicalName: "Хек", category: ProductCategory.FISH, aliases: ["hake"], unit: "г", avgPriceRub: 200, caloriesPer100g: 86, proteinPer100g: 16.6, fatPer100g: 2.2, carbsPer100g: 0.0 },
  { canonicalName: "Сардина консервированная", category: ProductCategory.FISH, aliases: ["сардины", "sardines"], unit: "г", avgPriceRub: 120, caloriesPer100g: 208, proteinPer100g: 17.0, fatPer100g: 12.0, carbsPer100g: 0.0 },
  { canonicalName: "Икра красная", category: ProductCategory.FISH, aliases: ["красная икра", "red caviar"], unit: "г", avgPriceRub: 3500, caloriesPer100g: 251, proteinPer100g: 31.5, fatPer100g: 13.2, carbsPer100g: 0.0 },
  { canonicalName: "Кальмар", category: ProductCategory.FISH, aliases: ["squid", "кальмары"], unit: "г", avgPriceRub: 350, caloriesPer100g: 92, proteinPer100g: 18.0, fatPer100g: 2.2, carbsPer100g: 0.0 },
  { canonicalName: "Креветки варёные", category: ProductCategory.FISH, aliases: ["креветки", "shrimp"], unit: "г", avgPriceRub: 450, caloriesPer100g: 95, proteinPer100g: 18.9, fatPer100g: 2.2, carbsPer100g: 0.0 },

  // ─── КРУПЫ (доп.) ───────────────────────────────────────────────────
  { canonicalName: "Киноа", category: ProductCategory.GRAINS, aliases: ["quinoa"], unit: "г", avgPriceRub: 250, caloriesPer100g: 368, proteinPer100g: 14.1, fatPer100g: 6.1, carbsPer100g: 57.2 },
  { canonicalName: "Рис бурый", category: ProductCategory.GRAINS, aliases: ["коричневый рис", "brown rice"], unit: "г", avgPriceRub: 100, caloriesPer100g: 331, proteinPer100g: 6.3, fatPer100g: 4.4, carbsPer100g: 65.1 },
  { canonicalName: "Рис длиннозёрный", category: ProductCategory.GRAINS, aliases: ["рис жасмин", "long grain rice"], unit: "г", avgPriceRub: 80, caloriesPer100g: 344, proteinPer100g: 6.7, fatPer100g: 0.7, carbsPer100g: 78.9 },
  { canonicalName: "Кускус", category: ProductCategory.GRAINS, aliases: ["couscous"], unit: "г", avgPriceRub: 120, caloriesPer100g: 376, proteinPer100g: 13.0, fatPer100g: 0.6, carbsPer100g: 77.4 },
  { canonicalName: "Манка", category: ProductCategory.GRAINS, aliases: ["манная крупа", "semolina"], unit: "г", avgPriceRub: 45, caloriesPer100g: 333, proteinPer100g: 10.3, fatPer100g: 1.0, carbsPer100g: 70.6 },
  { canonicalName: "Геркулес быстрый", category: ProductCategory.GRAINS, aliases: ["овсянка быстрая", "instant oats"], unit: "г", avgPriceRub: 55, caloriesPer100g: 350, proteinPer100g: 11.0, fatPer100g: 6.2, carbsPer100g: 61.0 },

  // ─── ОВОЩИ (доп.) ───────────────────────────────────────────────────
  { canonicalName: "Лук зелёный", category: ProductCategory.VEGETABLES, aliases: ["зелёный лук", "green onion"], unit: "г", avgPriceRub: 40, caloriesPer100g: 19, proteinPer100g: 1.3, fatPer100g: 0.1, carbsPer100g: 2.6 },
  { canonicalName: "Укроп", category: ProductCategory.VEGETABLES, aliases: ["dill"], unit: "г", avgPriceRub: 30, caloriesPer100g: 43, proteinPer100g: 2.5, fatPer100g: 1.1, carbsPer100g: 6.3 },
  { canonicalName: "Петрушка", category: ProductCategory.VEGETABLES, aliases: ["parsley"], unit: "г", avgPriceRub: 30, caloriesPer100g: 47, proteinPer100g: 3.7, fatPer100g: 0.4, carbsPer100g: 7.6 },
  { canonicalName: "Редис", category: ProductCategory.VEGETABLES, aliases: ["radish"], unit: "г", avgPriceRub: 60, caloriesPer100g: 19, proteinPer100g: 1.2, fatPer100g: 0.1, carbsPer100g: 3.4 },
  { canonicalName: "Кукуруза", category: ProductCategory.VEGETABLES, aliases: ["corn", "кукуруза свежая"], unit: "г", avgPriceRub: 50, caloriesPer100g: 86, proteinPer100g: 3.3, fatPer100g: 1.2, carbsPer100g: 18.7 },
  { canonicalName: "Горошек зелёный консервированный", category: ProductCategory.VEGETABLES, aliases: ["горошек", "green peas canned"], unit: "г", avgPriceRub: 55, caloriesPer100g: 73, proteinPer100g: 5.4, fatPer100g: 0.4, carbsPer100g: 11.3 },
  { canonicalName: "Фасоль стручковая", category: ProductCategory.VEGETABLES, aliases: ["стручковая фасоль", "green beans"], unit: "г", avgPriceRub: 90, caloriesPer100g: 32, proteinPer100g: 2.0, fatPer100g: 0.2, carbsPer100g: 7.4 },
  { canonicalName: "Грибы шампиньоны", category: ProductCategory.VEGETABLES, aliases: ["шампиньоны", "champignons", "грибы"], unit: "г", avgPriceRub: 180, caloriesPer100g: 27, proteinPer100g: 4.3, fatPer100g: 1.0, carbsPer100g: 0.1 },
  { canonicalName: "Кабачок цуккини", category: ProductCategory.VEGETABLES, aliases: ["цуккини", "courgette"], unit: "г", avgPriceRub: 80, caloriesPer100g: 17, proteinPer100g: 1.2, fatPer100g: 0.3, carbsPer100g: 3.1 },
  { canonicalName: "Листья салата", category: ProductCategory.VEGETABLES, aliases: ["салат айсберг", "iceberg lettuce", "салат"], unit: "г", avgPriceRub: 80, caloriesPer100g: 14, proteinPer100g: 1.4, fatPer100g: 0.2, carbsPer100g: 2.0 },
  { canonicalName: "Авокадо", category: ProductCategory.VEGETABLES, aliases: ["avocado"], unit: "г", avgPriceRub: 180, caloriesPer100g: 160, proteinPer100g: 2.0, fatPer100g: 14.7, carbsPer100g: 8.5 },
  { canonicalName: "Имбирь", category: ProductCategory.VEGETABLES, aliases: ["ginger", "корень имбиря"], unit: "г", avgPriceRub: 200, caloriesPer100g: 80, proteinPer100g: 1.8, fatPer100g: 0.8, carbsPer100g: 15.8 },

  // ─── ФРУКТЫ (доп.) ──────────────────────────────────────────────────
  { canonicalName: "Виноград", category: ProductCategory.FRUITS, aliases: ["grape"], unit: "г", avgPriceRub: 150, caloriesPer100g: 69, proteinPer100g: 0.6, fatPer100g: 0.2, carbsPer100g: 18.1 },
  { canonicalName: "Арбуз", category: ProductCategory.FRUITS, aliases: ["watermelon"], unit: "г", avgPriceRub: 35, caloriesPer100g: 30, proteinPer100g: 0.6, fatPer100g: 0.1, carbsPer100g: 7.6 },
  { canonicalName: "Клубника", category: ProductCategory.FRUITS, aliases: ["strawberry", "земляника"], unit: "г", avgPriceRub: 350, caloriesPer100g: 33, proteinPer100g: 0.8, fatPer100g: 0.4, carbsPer100g: 7.5 },
  { canonicalName: "Черника", category: ProductCategory.FRUITS, aliases: ["blueberry"], unit: "г", avgPriceRub: 400, caloriesPer100g: 44, proteinPer100g: 1.1, fatPer100g: 0.6, carbsPer100g: 7.6 },
  { canonicalName: "Персики", category: ProductCategory.FRUITS, aliases: ["персик", "peach"], unit: "г", avgPriceRub: 200, caloriesPer100g: 39, proteinPer100g: 0.9, fatPer100g: 0.1, carbsPer100g: 9.5 },
  { canonicalName: "Сливы", category: ProductCategory.FRUITS, aliases: ["слива", "plum"], unit: "г", avgPriceRub: 150, caloriesPer100g: 46, proteinPer100g: 0.8, fatPer100g: 0.3, carbsPer100g: 11.4 },
  { canonicalName: "Киви", category: ProductCategory.FRUITS, aliases: ["kiwi"], unit: "г", avgPriceRub: 160, caloriesPer100g: 61, proteinPer100g: 1.1, fatPer100g: 0.5, carbsPer100g: 14.7 },
  { canonicalName: "Ананас", category: ProductCategory.FRUITS, aliases: ["pineapple"], unit: "г", avgPriceRub: 120, caloriesPer100g: 50, proteinPer100g: 0.5, fatPer100g: 0.1, carbsPer100g: 13.1 },

  // ─── ХЛЕБ (доп.) ────────────────────────────────────────────────────
  { canonicalName: "Батон нарезной", category: ProductCategory.BREAD, aliases: ["батон", "sliced loaf"], unit: "г", avgPriceRub: 35, caloriesPer100g: 264, proteinPer100g: 8.0, fatPer100g: 3.3, carbsPer100g: 51.4 },
  { canonicalName: "Хлеб цельнозерновой", category: ProductCategory.BREAD, aliases: ["цельнозерновой", "wholegrain bread"], unit: "г", avgPriceRub: 70, caloriesPer100g: 216, proteinPer100g: 8.0, fatPer100g: 1.5, carbsPer100g: 42.0 },
  { canonicalName: "Питта", category: ProductCategory.BREAD, aliases: ["pita", "пита"], unit: "г", avgPriceRub: 50, caloriesPer100g: 274, proteinPer100g: 9.0, fatPer100g: 0.9, carbsPer100g: 55.7 },
  { canonicalName: "Тортилья", category: ProductCategory.BREAD, aliases: ["tortilla", "лепёшка"], unit: "г", avgPriceRub: 80, caloriesPer100g: 306, proteinPer100g: 7.5, fatPer100g: 6.6, carbsPer100g: 54.0 },

  // ─── ЯЙЦА / МАСЛА (доп.) ────────────────────────────────────────────
  { canonicalName: "Яйца С0", category: ProductCategory.EGGS_OILS, aliases: ["яйца отборные", "large eggs"], unit: "шт", avgPriceRub: 110, caloriesPer100g: 157, proteinPer100g: 12.7, fatPer100g: 11.5, carbsPer100g: 0.7 },
  { canonicalName: "Масло кокосовое", category: ProductCategory.EGGS_OILS, aliases: ["кокосовое масло", "coconut oil"], unit: "мл", avgPriceRub: 350, caloriesPer100g: 862, proteinPer100g: 0.0, fatPer100g: 99.9, carbsPer100g: 0.0 },
  { canonicalName: "Масло кунжутное", category: ProductCategory.EGGS_OILS, aliases: ["кунжутное масло", "sesame oil"], unit: "мл", avgPriceRub: 280, caloriesPer100g: 884, proteinPer100g: 0.0, fatPer100g: 100.0, carbsPer100g: 0.0 },

  // ─── БАКАЛЕЯ (доп.) ─────────────────────────────────────────────────
  { canonicalName: "Рыбный соус", category: ProductCategory.GROCERY, aliases: ["fish sauce"], unit: "мл", avgPriceRub: 150, caloriesPer100g: 35, proteinPer100g: 5.0, fatPer100g: 0.0, carbsPer100g: 4.0 },
  { canonicalName: "Кетчуп", category: ProductCategory.GROCERY, aliases: ["ketchup"], unit: "г", avgPriceRub: 60, caloriesPer100g: 93, proteinPer100g: 1.8, fatPer100g: 0.1, carbsPer100g: 22.2 },
  { canonicalName: "Сода пищевая", category: ProductCategory.GROCERY, aliases: ["соды", "baking soda"], unit: "г", avgPriceRub: 25, caloriesPer100g: 0, proteinPer100g: 0.0, fatPer100g: 0.0, carbsPer100g: 0.0 },
  { canonicalName: "Дрожжи сухие", category: ProductCategory.GROCERY, aliases: ["дрожжи", "dry yeast"], unit: "г", avgPriceRub: 30, caloriesPer100g: 325, proteinPer100g: 40.4, fatPer100g: 7.6, carbsPer100g: 14.3 },
  { canonicalName: "Лавровый лист", category: ProductCategory.GROCERY, aliases: ["лаврушка", "bay leaf"], unit: "г", avgPriceRub: 20, caloriesPer100g: 313, proteinPer100g: 7.6, fatPer100g: 8.4, carbsPer100g: 75.0 },
  { canonicalName: "Перец чёрный молотый", category: ProductCategory.GROCERY, aliases: ["чёрный перец", "black pepper"], unit: "г", avgPriceRub: 40, caloriesPer100g: 255, proteinPer100g: 10.4, fatPer100g: 3.3, carbsPer100g: 38.7 },
  { canonicalName: "Паприка", category: ProductCategory.GROCERY, aliases: ["paprika"], unit: "г", avgPriceRub: 50, caloriesPer100g: 282, proteinPer100g: 14.1, fatPer100g: 12.9, carbsPer100g: 33.9 },
  { canonicalName: "Куркума", category: ProductCategory.GROCERY, aliases: ["turmeric"], unit: "г", avgPriceRub: 60, caloriesPer100g: 354, proteinPer100g: 7.8, fatPer100g: 9.9, carbsPer100g: 64.9 },
  { canonicalName: "Корица", category: ProductCategory.GROCERY, aliases: ["cinnamon"], unit: "г", avgPriceRub: 50, caloriesPer100g: 261, proteinPer100g: 3.9, fatPer100g: 3.2, carbsPer100g: 55.5 },
  { canonicalName: "Крахмал картофельный", category: ProductCategory.GROCERY, aliases: ["крахмал", "starch"], unit: "г", avgPriceRub: 40, caloriesPer100g: 343, proteinPer100g: 0.1, fatPer100g: 0.0, carbsPer100g: 83.9 },
  { canonicalName: "Уксус бальзамический", category: ProductCategory.GROCERY, aliases: ["бальзамик", "balsamic vinegar"], unit: "мл", avgPriceRub: 200, caloriesPer100g: 88, proteinPer100g: 0.5, fatPer100g: 0.0, carbsPer100g: 17.0 },
  { canonicalName: "Консервированная фасоль", category: ProductCategory.GROCERY, aliases: ["фасоль консервированная", "canned beans"], unit: "г", avgPriceRub: 70, caloriesPer100g: 99, proteinPer100g: 6.7, fatPer100g: 0.4, carbsPer100g: 18.4 },
  { canonicalName: "Кукуруза консервированная", category: ProductCategory.GROCERY, aliases: ["кукуруза банка", "canned corn"], unit: "г", avgPriceRub: 65, caloriesPer100g: 58, proteinPer100g: 2.2, fatPer100g: 0.4, carbsPer100g: 11.6 },

  // ─── ЗАМОРОЗКА (доп.) ───────────────────────────────────────────────
  { canonicalName: "Пельмени", category: ProductCategory.FROZEN, aliases: ["пельмени замороженные", "dumplings"], unit: "г", avgPriceRub: 250, caloriesPer100g: 275, proteinPer100g: 11.0, fatPer100g: 12.0, carbsPer100g: 30.0 },
  { canonicalName: "Вареники с картошкой", category: ProductCategory.FROZEN, aliases: ["вареники", "pierogi"], unit: "г", avgPriceRub: 200, caloriesPer100g: 195, proteinPer100g: 6.0, fatPer100g: 3.0, carbsPer100g: 37.0 },
  { canonicalName: "Замороженная рыба минтай", category: ProductCategory.FROZEN, aliases: ["минтай заморозка"], unit: "г", avgPriceRub: 160, caloriesPer100g: 72, proteinPer100g: 16.0, fatPer100g: 1.0, carbsPer100g: 0.0 },
  { canonicalName: "Замороженный шпинат", category: ProductCategory.FROZEN, aliases: ["шпинат заморозка", "frozen spinach"], unit: "г", avgPriceRub: 100, caloriesPer100g: 21, proteinPer100g: 2.5, fatPer100g: 0.3, carbsPer100g: 2.0 },
  { canonicalName: "Замороженная клубника", category: ProductCategory.FROZEN, aliases: ["клубника заморозка", "frozen strawberry"], unit: "г", avgPriceRub: 180, caloriesPer100g: 33, proteinPer100g: 0.8, fatPer100g: 0.4, carbsPer100g: 7.5 },
  { canonicalName: "Блины замороженные", category: ProductCategory.FROZEN, aliases: ["блины готовые", "frozen pancakes"], unit: "г", avgPriceRub: 150, caloriesPer100g: 200, proteinPer100g: 6.0, fatPer100g: 8.0, carbsPer100g: 27.0 },

  // ─── НАПИТКИ (доп.) ─────────────────────────────────────────────────
  { canonicalName: "Чай зелёный", category: ProductCategory.DRINKS, aliases: ["зелёный чай", "green tea"], unit: "г", avgPriceRub: 180, caloriesPer100g: 0, proteinPer100g: 0.0, fatPer100g: 0.0, carbsPer100g: 0.0 },
  { canonicalName: "Кофе растворимый", category: ProductCategory.DRINKS, aliases: ["instant coffee", "растворимый кофе"], unit: "г", avgPriceRub: 400, caloriesPer100g: 0, proteinPer100g: 0.0, fatPer100g: 0.0, carbsPer100g: 0.0 },
  { canonicalName: "Сок апельсиновый", category: ProductCategory.DRINKS, aliases: ["апельсиновый сок", "orange juice"], unit: "мл", avgPriceRub: 90, caloriesPer100g: 45, proteinPer100g: 0.7, fatPer100g: 0.2, carbsPer100g: 10.4 },
  { canonicalName: "Сок томатный", category: ProductCategory.DRINKS, aliases: ["томатный сок", "tomato juice"], unit: "мл", avgPriceRub: 70, caloriesPer100g: 18, proteinPer100g: 0.9, fatPer100g: 0.1, carbsPer100g: 3.8 },
  { canonicalName: "Компот из сухофруктов", category: ProductCategory.DRINKS, aliases: ["компот", "dried fruit compote"], unit: "мл", avgPriceRub: 30, caloriesPer100g: 60, proteinPer100g: 0.3, fatPer100g: 0.0, carbsPer100g: 14.0 },

  // ─── ПРОЧЕЕ (доп.) ──────────────────────────────────────────────────
  { canonicalName: "Арахис", category: ProductCategory.OTHER, aliases: ["peanuts", "арахисовые орехи"], unit: "г", avgPriceRub: 150, caloriesPer100g: 567, proteinPer100g: 25.8, fatPer100g: 49.2, carbsPer100g: 16.1 },
  { canonicalName: "Арахисовая паста", category: ProductCategory.OTHER, aliases: ["peanut butter"], unit: "г", avgPriceRub: 300, caloriesPer100g: 588, proteinPer100g: 25.0, fatPer100g: 50.0, carbsPer100g: 20.0 },
  { canonicalName: "Кешью", category: ProductCategory.OTHER, aliases: ["cashew"], unit: "г", avgPriceRub: 750, caloriesPer100g: 553, proteinPer100g: 18.2, fatPer100g: 43.8, carbsPer100g: 30.2 },
  { canonicalName: "Семена чиа", category: ProductCategory.OTHER, aliases: ["чиа", "chia seeds"], unit: "г", avgPriceRub: 350, caloriesPer100g: 486, proteinPer100g: 16.5, fatPer100g: 30.7, carbsPer100g: 42.1 },
  { canonicalName: "Семена льна", category: ProductCategory.OTHER, aliases: ["льняные семена", "flax seeds"], unit: "г", avgPriceRub: 80, caloriesPer100g: 534, proteinPer100g: 18.3, fatPer100g: 42.2, carbsPer100g: 28.9 },
  { canonicalName: "Кунжут", category: ProductCategory.OTHER, aliases: ["sesame", "кунжутные семечки"], unit: "г", avgPriceRub: 120, caloriesPer100g: 573, proteinPer100g: 17.7, fatPer100g: 48.7, carbsPer100g: 23.4 },
  { canonicalName: "Чернослив", category: ProductCategory.OTHER, aliases: ["prunes", "сухие сливы"], unit: "г", avgPriceRub: 200, caloriesPer100g: 240, proteinPer100g: 2.3, fatPer100g: 0.7, carbsPer100g: 57.5 },
  { canonicalName: "Курага", category: ProductCategory.OTHER, aliases: ["dried apricots", "сухие абрикосы"], unit: "г", avgPriceRub: 250, caloriesPer100g: 241, proteinPer100g: 5.2, fatPer100g: 0.3, carbsPer100g: 55.2 },
  { canonicalName: "Финики", category: ProductCategory.OTHER, aliases: ["dates"], unit: "г", avgPriceRub: 280, caloriesPer100g: 282, proteinPer100g: 2.5, fatPer100g: 0.5, carbsPer100g: 69.2 },
  { canonicalName: "Тахини", category: ProductCategory.OTHER, aliases: ["tahini", "кунжутная паста"], unit: "г", avgPriceRub: 350, caloriesPer100g: 595, proteinPer100g: 17.0, fatPer100g: 53.8, carbsPer100g: 21.2 },
  { canonicalName: "Горох", category: ProductCategory.OTHER, aliases: ["горох сухой", "peas dried"], unit: "г", avgPriceRub: 55, caloriesPer100g: 298, proteinPer100g: 20.5, fatPer100g: 2.0, carbsPer100g: 49.5 },
  { canonicalName: "Тофу", category: ProductCategory.OTHER, aliases: ["tofu", "соевый творог"], unit: "г", avgPriceRub: 220, caloriesPer100g: 76, proteinPer100g: 8.1, fatPer100g: 4.8, carbsPer100g: 1.9 },
];

async function main() {
  console.log(`Заполняем базу ${products.length} продуктами...`);
  let added = 0;

  for (const p of products) {
    await prisma.product.upsert({
      where: { canonicalName: p.canonicalName },
      update: { ...p, updatedAt: new Date() },
      create: { ...p, source: ProductSource.MANUAL, updatedAt: new Date() },
    });
    added++;
  }

  console.log(`✓ Добавлено/обновлено ${added} продуктов`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
