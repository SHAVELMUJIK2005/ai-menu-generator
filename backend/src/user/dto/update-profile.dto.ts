import {
  IsEnum,
  IsArray,
  IsOptional,
  IsString,
} from "class-validator";
import {
  ProfileType,
  Goal,
  Region,
  CookingSkill,
  StoreChain,
} from "@prisma/client";

export class UpdateProfileDto {
  @IsOptional()
  @IsEnum(ProfileType)
  profileType?: ProfileType;

  @IsOptional()
  @IsEnum(Goal)
  goal?: Goal;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryRestrictions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dislikedProducts?: string[];

  @IsOptional()
  @IsEnum(Region)
  region?: Region;

  @IsOptional()
  @IsEnum(CookingSkill)
  cookingSkill?: CookingSkill;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];

  @IsOptional()
  @IsEnum(StoreChain)
  preferredStore?: StoreChain;
}
