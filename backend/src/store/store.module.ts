import { Module } from "@nestjs/common";
import { StoreService } from "./store.service";
import { StoreController } from "./store.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  providers: [StoreService],
  controllers: [StoreController],
  exports: [StoreService],
})
export class StoreModule {}
