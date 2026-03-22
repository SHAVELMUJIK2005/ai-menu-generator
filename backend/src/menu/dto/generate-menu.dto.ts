import { IsNumber, IsIn, IsOptional, IsEnum, Min, Max } from "class-validator";
import { StoreChain } from "@prisma/client";

export class GenerateMenuDto {
  @IsNumber()
  @Min(500)
  @Max(50000)
  budget!: number;

  @IsIn([3, 7])
  days!: 3 | 7;

  @IsOptional()
  @IsEnum(StoreChain)
  storeChain?: StoreChain;
}
