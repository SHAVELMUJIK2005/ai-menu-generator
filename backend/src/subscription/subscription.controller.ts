import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { CurrentUserPayload } from "../common/decorators/current-user.decorator";
import { SubscriptionService } from "./subscription.service";

@ApiTags("subscription")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("subscription")
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get("status")
  @ApiOperation({ summary: "Статус подписки текущего пользователя" })
  getStatus(@CurrentUser() user: CurrentUserPayload) {
    return this.subscriptionService.getStatus(user.sub);
  }

  @Post("invoice")
  @ApiOperation({ summary: "Создать ссылку на оплату Premium через Telegram Stars" })
  createInvoice(@CurrentUser() user: CurrentUserPayload) {
    return this.subscriptionService.createInvoiceLink(user.sub).then((url) => ({ invoiceUrl: url }));
  }

  @Post("activate-dev")
  @ApiOperation({ summary: "[DEV] Активировать Premium бесплатно для тестирования" })
  activateDev(@CurrentUser() user: CurrentUserPayload) {
    return this.subscriptionService.activatePremiumDev(user.sub);
  }
}
