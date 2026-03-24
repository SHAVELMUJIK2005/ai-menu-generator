import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { MenuController } from "./menu.controller";
import { MenuService } from "./menu.service";
import { MenuProcessor } from "./menu.processor";
import { AuthModule } from "../auth/auth.module";
import { ProductModule } from "../product/product.module";
import { PromptModule } from "../prompt/prompt.module";
import { StoreModule } from "../store/store.module";
import { TelegramModule } from "../telegram/telegram.module";
import { YouTubeModule } from "../youtube/youtube.module";
import { MENU_QUEUE } from "../queue/constants";

@Module({
  imports: [
    AuthModule,
    ProductModule,
    PromptModule,
    StoreModule,
    TelegramModule,
    YouTubeModule,
    BullModule.registerQueue({ name: MENU_QUEUE }),
  ],
  controllers: [MenuController],
  providers: [MenuService, MenuProcessor],
})
export class MenuModule {}
