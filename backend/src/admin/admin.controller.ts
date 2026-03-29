import { Controller, Get, Post, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/auth.guard";
import { AdminGuard } from "../common/guards/admin.guard";
import { AdminService } from "./admin.service";

@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("stats")
  @ApiOperation({ summary: "[DEV] Системная статистика" })
  getStats() {
    return this.adminService.getSystemStats();
  }

  @Post("users/:userId/reset-limit")
  @ApiOperation({ summary: "[DEV] Сброс лимита генераций пользователя" })
  resetLimit(@Param("userId") userId: string) {
    return this.adminService.resetGenerationLimit(userId);
  }

  @Post("cache/clear")
  @ApiOperation({ summary: "[DEV] Очистка кэша меню" })
  clearCache() {
    return this.adminService.clearMenuCache();
  }
}
