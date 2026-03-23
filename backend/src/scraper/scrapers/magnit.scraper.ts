import { Injectable } from "@nestjs/common";
import { BaseScraper } from "./base.scraper";
import { MatchResult } from "../name-matcher.service";

// Магнит — API magnit.ru/magnit-online
// Endpoint: GET https://magnit.ru/api/v1/search/goods?q=<query>

interface MagnitProduct {
  name: string;
  regularPrice?: number;
  discountPrice?: number;
  salePrice?: number;
  basePrice?: number;
}

interface MagnitResponse {
  goods?: MagnitProduct[];
  items?: MagnitProduct[];
  data?: { goods?: MagnitProduct[] };
}

@Injectable()
export class MagnitScraper extends BaseScraper {
  readonly storeName = "Магнит";

  constructor() {
    super("MagnitScraper", "https://magnit.ru", {
      Referer: "https://magnit.ru/",
      // Магнит требует city_id для корректных цен; 1 = Краснодар (штаб-квартира)
      "X-City-Id": "1",
    });
  }

  async search(query: string): Promise<MatchResult[]> {
    try {
      const resp = await this.http.get<MagnitResponse>("/api/v1/search/goods", {
        params: { q: query, limit: 15 },
      });

      const products =
        resp.data?.goods ??
        resp.data?.items ??
        resp.data?.data?.goods ??
        [];

      return products.map((p) => {
        const basePrice = p.regularPrice ?? p.basePrice ?? 0;
        const salePrice = p.discountPrice ?? p.salePrice;
        const isPromo = !!salePrice && salePrice < basePrice;

        return {
          storeProductName: p.name,
          price: basePrice || salePrice || 0,
          isPromo,
          promoPrice: isPromo ? salePrice : undefined,
          score: 0,
        };
      });
    } catch (err) {
      this.logger.warn(`Магнит search(${query}) error: ${err}`);
      return [];
    }
  }
}
