import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { DealsService } from "./deals.service";
import { JwtAuthGuard } from "../../common/jwt-auth.guard";

@Controller("deals")
export class DealsController {
  constructor(private dealsService: DealsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getDeals(@Request() req, @Query("status") status?: string) {
    return this.dealsService.getDeals(req.user.id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getDealById(@Param("id") id: string) {
    return this.dealsService.getDealById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(":id/status")
  async updateDealStatus(
    @Param("id") id: string,
    @Body() body: { status: string },
  ) {
    return this.dealsService.updateDealStatus(id, body.status);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/content")
  async submitContent(
    @Param("id") id: string,
    @Body() body: { contentUrl: string },
  ) {
    return this.dealsService.submitContent(id, body.contentUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/approve")
  async approveDeal(@Param("id") id: string) {
    return this.dealsService.approveDeal(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/complete")
  async completeDeal(@Param("id") id: string) {
    return this.dealsService.completeDeal(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/cancel")
  async cancelDeal(@Param("id") id: string) {
    return this.dealsService.cancelDeal(id);
  }
}
