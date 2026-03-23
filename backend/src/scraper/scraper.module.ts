import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ScraperService } from "./scraper.service";
import { ScraperController } from "./scraper.controller";
import { NameMatcherService } from "./name-matcher.service";
import { PyaterochkaScraper } from "./scrapers/pyaterochka.scraper";
import { PerekrestokScraper } from "./scrapers/perekrestok.scraper";
import { MagnitScraper } from "./scrapers/magnit.scraper";
import { VkusvillScraper } from "./scrapers/vkusvill.scraper";
import { LentaScraper } from "./scrapers/lenta.scraper";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    HttpModule,
    PrismaModule,
  ],
  providers: [
    ScraperService,
    NameMatcherService,
    PyaterochkaScraper,
    PerekrestokScraper,
    MagnitScraper,
    VkusvillScraper,
    LentaScraper,
  ],
  controllers: [ScraperController],
  exports: [ScraperService],
})
export class ScraperModule {}
