import { Module } from "@nestjs/common";
import { CampaignsService } from "./campaigns.service";
import { CampaignsController } from "./campaigns.controller";
import { PrismaService } from "../../common/prisma.service";

@Module({
  providers: [CampaignsService, PrismaService],
  controllers: [CampaignsController],
  exports: [CampaignsService],
})
export class CampaignsModule {}
