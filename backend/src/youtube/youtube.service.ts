import { Injectable, Logger } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";

const CACHE_TTL_SEC = 86400; // 24 часа
const MAX_RESULTS = 1;
const DAILY_QUOTA_LIMIT = 100; // YouTube API даёт 10 000 единиц/день; поиск = 100 единиц

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: { title: string; channelTitle: string };
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
}

@Injectable()
export class YouTubeService {
  private readonly logger = new Logger(YouTubeService.name);
  private quotaUsedToday = 0;

  constructor(private readonly redis: RedisService) {}

  /**
   * Найти видео-рецепт для блюда.
   * Результат кэшируется в Redis на 24 ч.
   * Возвращает YouTube URL или null если ключ не задан / квота исчерпана.
   */
  async findRecipeVideo(dishName: string): Promise<string | null> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return null;

    // Проверяем квоту
    if (this.quotaUsedToday >= DAILY_QUOTA_LIMIT) {
      this.logger.warn("YouTube API: дневная квота исчерпана");
      return null;
    }

    const cacheKey = `youtube:recipe:${dishName.toLowerCase().replace(/\s+/g, "_")}`;

    // Проверяем кэш
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached === "null" ? null : cached;

    try {
      const query = encodeURIComponent(`${dishName} рецепт`);
      const url =
        `https://www.googleapis.com/youtube/v3/search` +
        `?part=snippet&q=${query}&type=video&maxResults=${MAX_RESULTS}` +
        `&relevanceLanguage=ru&key=${apiKey}`;

      const resp = await fetch(url);
      if (!resp.ok) {
        this.logger.warn(`YouTube API error: ${resp.status}`);
        await this.redis.set(cacheKey, "null", CACHE_TTL_SEC);
        return null;
      }

      const data = (await resp.json()) as YouTubeSearchResponse;
      this.quotaUsedToday += 100; // каждый поиск стоит 100 единиц квоты

      const videoId = data.items?.[0]?.id?.videoId;
      if (!videoId) {
        await this.redis.set(cacheKey, "null", CACHE_TTL_SEC);
        return null;
      }

      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      await this.redis.set(cacheKey, videoUrl, CACHE_TTL_SEC);
      this.logger.debug(`YouTube: найдено видео для "${dishName}": ${videoUrl}`);
      return videoUrl;
    } catch (err) {
      this.logger.warn(`YouTube search error для "${dishName}": ${err}`);
      await this.redis.set(cacheKey, "null", CACHE_TTL_SEC);
      return null;
    }
  }

  /**
   * Обогатить меню видео-рецептами для premium пользователей.
   * Передаёт имена блюд, возвращает Map<dishName, videoUrl>.
   */
  async enrichMenuWithVideos(dishNames: string[]): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    for (const name of dishNames) {
      const url = await this.findRecipeVideo(name);
      if (url) result.set(name, url);
    }
    return result;
  }
}
