import { Controller, Post, Get, Param, Body, Query, UseGuards } from "@nestjs/common";
import { MenuService } from "./menu.service";
import { JwtAuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { CurrentUserPayload } from "../common/decorators/current-user.decorator";
import { GenerateMenuDto } from "./dto/generate-menu.dto";

@Controller("menu")
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  /** POST /api/menu/generate */
  @Post("generate")
  generate(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: GenerateMenuDto,
  ) {
    return this.menuService.generateMenu(user.sub, dto);
  }

  /** GET /api/menu/history */
  @Get("history")
  getHistory(
    @CurrentUser() user: CurrentUserPayload,
    @Query("page") page = 1,
    @Query("limit") limit = 20,
  ) {
    return this.menuService.getHistory(user.sub, +page, +limit);
  }

  /** GET /api/menu/:id */
  @Get(":id")
  getById(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
  ) {
    return this.menuService.getById(user.sub, id);
  }

  /** POST /api/menu/:id/reroll */
  @Post(":id/reroll")
  reroll(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
  ) {
    return this.menuService.reroll(user.sub, id);
  }
}
