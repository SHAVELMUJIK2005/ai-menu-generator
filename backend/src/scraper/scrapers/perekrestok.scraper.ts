import { Injectable } from "@nestjs/common";
import { BaseScraper } from "./base.scraper";
import { MatchResult } from "../name-matcher.service";

// Перекрёсток — внутренний API perekrestok.ru
// Endpoint: GET https://www.perekrestok.ru/api/catalog/product/feed
// Параметр поиска: query / search

interface PerekrestokItem {
  title: string;
  pricePer: number;     // цена в копейках или рублях (зависит от версии API)
  promoPercent?: number;
  grossPrice?: number;  // цена до скидки в копейках
  currentPrice?: number;
}

interface PerekrestokResponse {
  content?: {
    products?: PerekrestokItem[];
  };
  items?: PerekrestokItem[];
}

@Injectable()
export class PerekrestokScraper extends BaseScraper {
  readonly storeName = "Перекрёсток";

  constructor() {
    super("PerekrestokScraper", "https://www.perekrestok.ru", {
      Referer: "https://www.perekrestok.ru/catalog",
      "X-Requested-With": "XMLHttpRequest",
    });
  }

  async search(query: string): Promise<MatchResult[]> {
    try {
      const resp = await this.withRetry(() =>
        this.http.get<PerekrestokResponse>("/api/catalog/product/feed", {
          params: { search: query, perPage: 15, sort: "popularity.desc" },
        }),
      );

      const products =
        resp.data?.content?.products ??
        resp.data?.items ??
        [];

      return products.map((p) => {
        // API иногда отдаёт копейки, иногда рубли — нормализуем
        const rawPrice = p.currentPrice ?? p.pricePer ?? 0;
        const price = rawPrice > 1000 ? rawPrice / 100 : rawPrice;

        const rawGross = p.grossPrice ?? 0;
        const grossPrice = rawGross > 1000 ? rawGross / 100 : rawGross;

        const isPromo = !!p.promoPercent && p.promoPercent > 0;

        return {
          storeProductName: p.title,
          price: isPromo ? grossPrice || price : price,
          isPromo,
          promoPrice: isPromo ? price : undefined,
          score: 0,
        };
      });
    } catch (err) {
      this.logger.warn(`Перекрёсток search(${query}) error: ${err}`);
      return [];
    }
  }
}
