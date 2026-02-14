import { Module } from "@nestjs/common";
import { InfluencersService } from "./influencers.service";
import { InfluencersController } from "./influencers.controller";
import { PrismaService } from "../../common/prisma.service";

@Module({
  providers: [InfluencersService, PrismaService],
  controllers: [InfluencersController],
  exports: [InfluencersService],
})
export class InfluencersModule {}
