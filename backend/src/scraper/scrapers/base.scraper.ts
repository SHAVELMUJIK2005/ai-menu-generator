import axios, { AxiosInstance } from "axios";
import { Logger } from "@nestjs/common";
import { MatchResult } from "../name-matcher.service";

export abstract class BaseScraper {
  protected readonly logger: Logger;
  protected readonly http: AxiosInstance;

  constructor(name: string, baseURL: string, extraHeaders: Record<string, string> = {}) {
    this.logger = new Logger(name);
    this.http = axios.create({
      baseURL,
      timeout: 15_000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json, text/html, */*",
        "Accept-Language": "ru-RU,ru;q=0.9",
        ...extraHeaders,
      },
    });
  }

  /**
   * Поиск товаров по запросу. Возвращает список кандидатов для матчинга.
   * Реализуется в каждом скрейпере.
   */
  abstract search(query: string): Promise<MatchResult[]>;

  /**
   * Название магазина для логов
   */
  abstract readonly storeName: string;
}
