import { IsString, IsOptional, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddFavoriteDto {
  @ApiProperty({ example: "Моё любимое меню на неделю" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
