import { BullModule } from "@nestjs/bullmq";
import { Global, Module } from "@nestjs/common";
import { MENU_QUEUE } from "./constants";

/**
 * Парсит REDIS_URL вида redis://:password@host:port в объект опций
 */
function parseRedisUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname || "localhost",
      port: Number(parsed.port) || 6379,
      password: parsed.password || undefined,
    };
  } catch {
    return { host: "localhost", port: 6379 };
  }
}

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: parseRedisUrl(process.env.REDIS_URL ?? "redis://localhost:6379"),
      }),
    }),
    BullModule.registerQueue({ name: MENU_QUEUE }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
