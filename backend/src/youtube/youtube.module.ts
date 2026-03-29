import { Module } from "@nestjs/common";
import { YouTubeService } from "./youtube.service";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [RedisModule],
  providers: [YouTubeService],
  exports: [YouTubeService],
})
export class YouTubeModule {}
