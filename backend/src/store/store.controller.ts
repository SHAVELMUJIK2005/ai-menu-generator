import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/auth.guard";
import { StoreService } from "./store.service";
import { StoreChain, Region } from "@prisma/client";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

class ShoppingItem {
  @IsString() name: string;
  @IsNumber() @Type(() => Number) totalAmount: number;
  @IsOptional() @IsString() unit?: string;
}

class CompareShoppingListDto {
  @IsArray() items: ShoppingItem[];
  @IsOptional() region?: Region;
}

@ApiTags("stores")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("stores")
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  @ApiOperation({ summary: "Список магазинов с ценовыми тегами" })
  getStores() {
    return this.storeService.getStores();
  }

  @Get("prices")
  @ApiOperation({ summary: "Цены магазина по продуктам" })
  @ApiQuery({ name: "store", enum: StoreChain })
  @ApiQuery({ name: "region", enum: Region, required: false })
  getPrices(
    @Query("store") store: StoreChain,
    @Query("region") region?: Region,
  ) {
    return this.storeService.getPricesByStore(store, region);
  }

  @Post("compare")
  @ApiOperation({ summary: "Сравнить стоимость списка покупок во всех магазинах" })
  compareShoppingList(@Body() dto: CompareShoppingListDto) {
    return this.storeService.compareShoppingList(dto.items, dto.region);
  }
}
