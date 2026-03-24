import { Injectable } from "@nestjs/common";
import { BaseScraper } from "./base.scraper";
import { MatchResult } from "../name-matcher.service";

// Пятёрочка — внутренний REST API 5ka.ru
// Endpoint: GET https://5ka.ru/api/catalog/?stores=&name=<query>
// Документации нет, но API публично доступен без авторизации

interface FivekaProduct {
  name: string;
  prices: {
    price: number;         // обычная цена (в рублях, уже числом)
    old_price?: number;    // цена до скидки (если есть акция)
    promo_price?: number;
  };
  special_price?: {
    new_price: number;
  };
}

interface FivekaResponse {
  results: FivekaProduct[];
  next?: string;
}

@Injectable()
export class PyaterochkaScraper extends BaseScraper {
  readonly storeName = "Пятёрочка";

  constructor() {
    super("PyaterochkaScraper", "https://5ka.ru", {
      Referer: "https://5ka.ru/catalog/",
    });
  }

  async search(query: string): Promise<MatchResult[]> {
    try {
      const resp = await this.withRetry(() =>
        this.http.get<FivekaResponse>("/api/catalog/", {
          params: { stores: "", name: query, limit: 15 },
        }),
      );

      return (resp.data.results ?? []).map((p) => {
        const basePrice = p.prices?.price ?? 0;
        const promoPrice = p.special_price?.new_price ?? p.prices?.promo_price;
        const isPromo = !!promoPrice && promoPrice < basePrice;

        return {
          storeProductName: p.name,
          price: basePrice,
          isPromo,
          promoPrice: isPromo ? promoPrice : undefined,
          score: 0,
        };
      });
    } catch (err) {
      this.logger.warn(`Пятёрочка search(${query}) error: ${err}`);
      return [];
    }
  }
}
