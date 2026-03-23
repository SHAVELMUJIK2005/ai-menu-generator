import { Controller, Post, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ScraperService } from "./scraper.service";
import { JwtAuthGuard } from "../auth/auth.guard";
import { AdminGuard } from "../common/guards/admin.guard";

@ApiTags("scraper")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("scraper")
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  /**
   * Ручной запуск парсинга (только для разработки / adminа)
   * POST /api/scraper/run
   */
  @Post("run")
  @ApiOperation({ summary: "Запустить парсинг цен всех магазинов" })
  async run() {
    // Запускаем в фоне, не ждём завершения
    this.scraperService.scrapeAll().catch(() => {});
    return { message: "Парсинг запущен в фоне" };
  }

  /**
   * Статус последнего парсинга
   * GET /api/scraper/status
   */
  @Get("status")
  @ApiOperation({ summary: "Статус последнего парсинга по магазинам" })
  async status() {
    return this.scraperService.getStatus();
  }
}
