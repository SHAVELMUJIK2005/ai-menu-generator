import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { NameMatcherService } from "./name-matcher.service";
import { PyaterochkaScraper } from "./scrapers/pyaterochka.scraper";
import { PerekrestokScraper } from "./scrapers/perekrestok.scraper";
import { MagnitScraper } from "./scrapers/magnit.scraper";
import { VkusvillScraper } from "./scrapers/vkusvill.scraper";
import { LentaScraper } from "./scrapers/lenta.scraper";
import { BaseScraper } from "./scrapers/base.scraper";
import { StoreChain, Region } from "@prisma/client";

// Маппинг StoreChain → скрейпер
const CHAIN_MAP: Record<StoreChain, string> = {
  PYATEROCHKA: "Пятёрочка",
  PEREKRESTOK: "Перекрёсток",
  MAGNIT: "Магнит",
  VKUSVILL: "ВкусВилл",
  LENTA: "Лента",
};

export interface ScrapeResult {
  store: StoreChain;
  updated: number;
  skipped: number;
  errors: number;
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private isRunning = false;

  // Все скрейперы в порядке приоритета
  private readonly scrapers: Map<StoreChain, BaseScraper>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly matcher: NameMatcherService,
    private readonly pyaterochka: PyaterochkaScraper,
    private readonly perekrestok: PerekrestokScraper,
    private readonly magnit: MagnitScraper,
    private readonly vkusvill: VkusvillScraper,
    private readonly lenta: LentaScraper,
  ) {
    const entries: [StoreChain, BaseScraper][] = [
      [StoreChain.PYATEROCHKA, pyaterochka],
      [StoreChain.PEREKRESTOK, perekrestok],
      [StoreChain.MAGNIT, magnit],
      [StoreChain.VKUSVILL, vkusvill],
      [StoreChain.LENTA, lenta],
    ];
    this.scrapers = new Map(entries);
  }

  /**
   * Запускается раз в сутки в 3:00 ночи
   */
  @Cron("0 3 * * *")
  async scheduledScrape() {
    this.logger.log("Плановый парсинг цен начат");
    await this.scrapeAll();
  }

  /**
   * Парсим все магазины для всех регионов
   */
  async scrapeAll(): Promise<ScrapeResult[]> {
    if (this.isRunning) {
      this.logger.warn("Парсинг уже запущен, пропускаем");
      return [];
    }

    this.isRunning = true;
    const results: ScrapeResult[] = [];

    try {
      const regions = [Region.MOSCOW, Region.SPB, Region.OTHER];

      for (const [chain, scraper] of this.scrapers) {
        this.logger.log(`Парсим ${CHAIN_MAP[chain]}...`);
        const result = await this.scrapeStore(chain, scraper, regions);
        results.push(result);
        this.logger.log(
          `${CHAIN_MAP[chain]}: обновлено ${result.updated}, пропущено ${result.skipped}, ошибок ${result.errors}`,
        );

        // Пауза между магазинами чтобы не попасть под rate limit
        await this.sleep(2000);
      }
    } finally {
      this.isRunning = false;
    }

    return results;
  }

  /**
   * Парсим один конкретный магазин
   */
  async scrapeStore(
    chain: StoreChain,
    scraper: BaseScraper,
    regions: Region[],
  ): Promise<ScrapeResult> {
    const result: ScrapeResult = { store: chain, updated: 0, skipped: 0, errors: 0 };

    // Загружаем все продукты из нашей БД
    const products = await this.prisma.product.findMany({
      select: { id: true, canonicalName: true, avgPriceRub: true, unit: true },
    });

    const parsedAt = new Date();

    for (const product of products) {
      try {
        // Ищем в API магазина
        const candidates = await scraper.search(product.canonicalName);

        if (!candidates.length) {
          result.skipped++;
          continue;
        }

        // Матчим
        const match = this.matcher.findBestMatch(product.canonicalName, candidates);
        if (!match || match.price <= 0) {
          result.skipped++;
          continue;
        }

        // Нормализуем цену (за 100г или за шт)
        // Магазины продают за упаковку, а у нас цены за 100г
        // Поэтому сохраняем как есть — это цена за типичную упаковку,
        // и использует её StoreService для сравнения корзины
        const priceRub = Math.round(match.price * 100) / 100;

        // Upsert в StorePrices для каждого региона
        for (const region of regions) {
          await this.prisma.storePrices.upsert({
            where: {
              // Используем составной ключ если он есть, иначе ищем вручную
              // (в схеме нет @@unique, используем findFirst + update/create)
              id: await this.findExistingId(product.id, chain, region),
            },
            update: {
              priceRub,
              isPromo: match.isPromo,
              promoPrice: match.promoPrice ? Math.round(match.promoPrice * 100) / 100 : null,
              parsedAt,
            },
            create: {
              productId: product.id,
              storeChain: chain,
              priceRub,
              isPromo: match.isPromo,
              promoPrice: match.promoPrice ? Math.round(match.promoPrice * 100) / 100 : null,
              region,
              parsedAt,
            },
          });
        }

        result.updated++;

        // Небольшая задержка между запросами чтобы не трогать rate limit
        await this.sleep(300);
      } catch (err) {
        this.logger.warn(`Ошибка парсинга ${product.canonicalName} в ${CHAIN_MAP[chain]}: ${err}`);
        result.errors++;
      }
    }

    return result;
  }

  /**
   * Статус последнего парсинга для каждого магазина
   */
  async getStatus() {
    const lastParsed = await this.prisma.storePrices.groupBy({
      by: ["storeChain"],
      _max: { parsedAt: true },
      _count: { id: true },
    });

    return lastParsed.map((row) => ({
      store: row.storeChain,
      storeName: CHAIN_MAP[row.storeChain],
      lastParsed: row._max.parsedAt,
      totalPrices: row._count.id,
      isRunning: this.isRunning,
    }));
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async findExistingId(productId: number, chain: StoreChain, region: Region): Promise<number> {
    const existing = await this.prisma.storePrices.findFirst({
      where: { productId, storeChain: chain, region },
      select: { id: true },
    });
    // Если не нашли — возвращаем -1 (upsert создаст новую запись через where: {id: -1})
    return existing?.id ?? -1;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
