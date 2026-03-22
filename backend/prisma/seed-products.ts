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
