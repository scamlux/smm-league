import { Module } from "@nestjs/common";
import { DealsService } from "./deals.service";
import { DealsController } from "./deals.controller";
import { PrismaService } from "../../common/prisma.service";

@Module({
  providers: [DealsService, PrismaService],
  controllers: [DealsController],
  exports: [DealsService],
})
export class DealsModule {}
