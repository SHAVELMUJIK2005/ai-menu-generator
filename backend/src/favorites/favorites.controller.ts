import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { CurrentUserPayload } from "../common/decorators/current-user.decorator";
import { FavoritesService } from "./favorites.service";

@ApiTags("favorites")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("favorites")
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: "Список избранных меню" })
  getAll(@CurrentUser() user: CurrentUserPayload) {
    return this.favoritesService.getAll(user.sub);
  }

  @Post(":menuId")
  @ApiOperation({ summary: "Добавить меню в избранное" })
  add(
    @CurrentUser() user: CurrentUserPayload,
    @Param("menuId") menuId: string,
  ) {
    return this.favoritesService.add(user.sub, menuId);
  }

  @Delete(":menuId")
  @ApiOperation({ summary: "Убрать меню из избранного" })
  remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param("menuId") menuId: string,
  ) {
    return this.favoritesService.remove(user.sub, menuId);
  }
}
