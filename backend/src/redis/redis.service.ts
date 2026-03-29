import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;

  onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, "EX", ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /** Удалить все ключи по glob-паттерну (SCAN, не KEYS — безопасно для прода) */
  async scanDel(pattern: string): Promise<number> {
    let cursor = "0";
    let deleted = 0;
    do {
      const [nextCursor, keys] = await this.client.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      if (keys.length) {
        await this.client.del(...keys);
        deleted += keys.length;
      }
    } while (cursor !== "0");
    return deleted;
  }
}
