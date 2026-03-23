import { Injectable } from "@nestjs/common";
import { BaseScraper } from "./base.scraper";
import { MatchResult } from "../name-matcher.service";

// ВкусВилл — внутренний API vkusvill.ru
// Endpoint: GET https://vkusvill.ru/api/get/goods/?query=<q>&limit=15

interface VkusvillProduct {
  title: string;
  price: string | number;       // "189.90" или 189.90
  old_price?: string | number;  // цена до скидки
  discount?: number;
}

interface VkusvillResponse {
  items?: VkusvillProduct[];
  data?: { items?: VkusvillProduct[] };
}

@Injectable()
export class VkusvillScraper extends BaseScraper {
  readonly storeName = "ВкусВилл";

  constructor() {
    super("VkusvillScraper", "https://vkusvill.ru", {
      Referer: "https://vkusvill.ru/goods/",
    });
  }

  async search(query: string): Promise<MatchResult[]> {
    try {
      const resp = await this.http.get<VkusvillResponse>("/api/get/goods/", {
        params: { query, limit: 15, offset: 0 },
      });

      const products =
        resp.data?.items ??
        resp.data?.data?.items ??
        [];

      return products.map((p) => {
        const price = parseFloat(String(p.price)) || 0;
        const oldPrice = parseFloat(String(p.old_price ?? 0)) || 0;
        const isPromo = !!p.discount && p.discount > 0 && oldPrice > price;

        return {
          storeProductName: p.title,
          price: isPromo ? oldPrice : price,
          isPromo,
          promoPrice: isPromo ? price : undefined,
          score: 0,
        };
      });
    } catch (err) {
      this.logger.warn(`ВкусВилл search(${query}) error: ${err}`);
      return [];
    }
  }
}
