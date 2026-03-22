import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class TelegramAuthDto {
  @IsString()
  @IsNotEmpty()
  initData!: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class DevAuthDto {
  @IsNumber()
  telegramId!: number;

  @IsString()
  @IsNotEmpty()
  username!: string;
}
