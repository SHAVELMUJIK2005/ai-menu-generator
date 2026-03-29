import { Injectable } from "@nestjs/common";
import { BaseScraper } from "./base.scraper";
import { MatchResult } from "../name-matcher.service";

// Лента — API lenta.com
// Endpoint: GET https://lenta.com/api/v1/search?q=<query>

interface LentaProduct {
  title: string;
  regularPrice?: number;
  discountedPrice?: number;
  cardPrice?: number;
  priceRub?: number;
}

interface LentaResponse {
  skus?: LentaProduct[];
  products?: LentaProduct[];
  items?: LentaProduct[];
}

@Injectable()
export class LentaScraper extends BaseScraper {
  readonly storeName = "Лента";

  constructor() {
    super("LentaScraper", "https://lenta.com", {
      Referer: "https://lenta.com/catalog/",
    });
  }

  async search(query: string): Promise<MatchResult[]> {
    try {
      const resp = await this.withRetry(() =>
        this.http.get<LentaResponse>("/api/v1/search", {
          params: { q: query, size: 15 },
        }),
      );

      const products =
        resp.data?.skus ??
        resp.data?.products ??
        resp.data?.items ??
        [];

      return products.map((p) => {
        const basePrice = p.regularPrice ?? p.priceRub ?? 0;
        const discounted = p.discountedPrice ?? p.cardPrice;
        const isPromo = !!discounted && discounted < basePrice;

        return {
          storeProductName: p.title,
          price: basePrice || discounted || 0,
          isPromo,
          promoPrice: isPromo ? discounted : undefined,
          score: 0,
        };
      });
    } catch (err) {
      this.logger.warn(`Лента search(${query}) error: ${err}`);
      return [];
    }
  }
}
