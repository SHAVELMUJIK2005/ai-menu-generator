import axios, { AxiosInstance } from "axios";
import { Logger } from "@nestjs/common";
import { MatchResult } from "../name-matcher.service";

// Пул User-Agent для ротации
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
];

function randomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export abstract class BaseScraper {
  protected readonly logger: Logger;
  protected readonly http: AxiosInstance;

  constructor(name: string, baseURL: string, extraHeaders: Record<string, string> = {}) {
    this.logger = new Logger(name);

    // Поддержка прокси через env PROXY_URL (формат: http://user:pass@host:port)
    const proxyUrl = process.env.PROXY_URL;
    const axiosConfig: Parameters<typeof axios.create>[0] = {
      baseURL,
      timeout: 20_000,
      headers: {
        "User-Agent": randomUserAgent(),
        Accept: "application/json, text/html, */*",
        "Accept-Language": "ru-RU,ru;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        ...extraHeaders,
      },
    };

    if (proxyUrl) {
      const url = new URL(proxyUrl);
      axiosConfig.proxy = {
        protocol: url.protocol.replace(":", ""),
        host: url.hostname,
        port: parseInt(url.port, 10),
        auth: url.username ? { username: url.username, password: url.password } : undefined,
      };
    }

    this.http = axios.create(axiosConfig);

    // Ротируем User-Agent на каждый запрос
    this.http.interceptors.request.use((config) => {
      config.headers["User-Agent"] = randomUserAgent();
      return config;
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

  /**
   * Retry-обёртка с exponential backoff (3 попытки по умолчанию)
   * Используется в search() каждого скрейпера
   */
  protected async withRetry<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    baseDelayMs = 1000,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (attempt < maxAttempts) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1); // 1s, 2s, 4s
          this.logger.warn(
            `${this.storeName}: попытка ${attempt}/${maxAttempts} не удалась, ждём ${delay}ms`,
          );
          await sleep(delay);
        }
      }
    }

    throw lastError;
  }
}
