import { Module } from "@nestjs/common";
import { MenuController } from "./menu.controller";
import { MenuService } from "./menu.service";
import { AuthModule } from "../auth/auth.module";
import { ProductModule } from "../product/product.module";
import { PromptModule } from "../prompt/prompt.module";

@Module({
  imports: [AuthModule, ProductModule, PromptModule],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
