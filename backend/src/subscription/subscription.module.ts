import { Module } from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";
import { SubscriptionController } from "./subscription.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  providers: [SubscriptionService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
