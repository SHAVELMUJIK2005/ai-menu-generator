import { Controller, Post, Get, Param, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Min, Max, IsEnum } from "class-validator";
import { MenuService } from "./menu.service";
import { JwtAuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { CurrentUserPayload } from "../common/decorators/current-user.decorator";
import { GenerateMenuDto } from "./dto/generate-menu.dto";

class RateMenuDto {
  @IsInt() @Min(1) @Max(5) stars: number;
  @IsOptional() @IsString() comment?: string;
}

class SubstituteMealDto {
  @IsInt() dayNumber: number;
  @IsEnum(["breakfast", "lunch", "dinner", "snack"]) mealType: "breakfast" | "lunch" | "dinner" | "snack";
}

@ApiTags("menu")
@ApiBearerAuth()
@Controller("menu")
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  /** POST /api/menu/generate */
  @Post("generate")
  @ApiOperation({ summary: "Сгенерировать меню через AI" })
  generate(@CurrentUser() user: CurrentUserPayload, @Body() dto: GenerateMenuDto) {
    return this.menuService.generateMenu(user.sub, dto);
  }

  /** GET /api/menu/history */
  @Get("history")
  @ApiOperation({ summary: "История меню пользователя" })
  getHistory(
    @CurrentUser() user: CurrentUserPayload,
    @Query("page") page = 1,
    @Query("limit") limit = 20,
  ) {
    return this.menuService.getHistory(user.sub, +page, +limit);
  }

  /** GET /api/menu/:id */
  @Get(":id")
  @ApiOperation({ summary: "Получить меню по ID" })
  getById(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.menuService.getById(user.sub, id);
  }

  /** POST /api/menu/:id/reroll */
  @Post(":id/reroll")
  @ApiOperation({ summary: "Перегенерировать меню целиком" })
  reroll(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.menuService.reroll(user.sub, id);
  }

  /** POST /api/menu/:id/rate */
  @Post(":id/rate")
  @ApiOperation({ summary: "Оценить меню (1-5 звёзд)" })
  rate(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Body() dto: RateMenuDto,
  ) {
    return this.menuService.rateMenu(user.sub, id, dto.stars, dto.comment);
  }

  /** POST /api/menu/:id/substitute */
  @Post(":id/substitute")
  @ApiOperation({ summary: "Заменить одно блюдо в меню без перегенерации" })
  substitute(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Body() dto: SubstituteMealDto,
  ) {
    return this.menuService.substituteMeal(user.sub, id, dto.dayNumber, dto.mealType);
  }
}
