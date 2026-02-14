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
  async getDeals(@Request() req: any, @Query("status") status?: string) {
    return this.dealsService.getDeals(req.user.id, req.user.role, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getDealById(@Param("id") id: string, @Request() req: any) {
    return this.dealsService.getDealById(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Put(":id/status")
  async updateDealStatus(
    @Param("id") id: string,
    @Request() req: any,
    @Body() body: { status: string },
  ) {
    return this.dealsService.updateDealStatus(
      id,
      body.status,
      req.user.id,
      req.user.role,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/content")
  async submitContent(
    @Param("id") id: string,
    @Request() req: any,
    @Body() body: { contentUrl: string },
  ) {
    return this.dealsService.submitContent(id, body.contentUrl, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/approve")
  async approveDeal(@Param("id") id: string, @Request() req: any) {
    return this.dealsService.approveDeal(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/complete")
  async completeDeal(@Param("id") id: string, @Request() req: any) {
    return this.dealsService.completeDeal(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/cancel")
  async cancelDeal(@Param("id") id: string, @Request() req: any) {
    return this.dealsService.cancelDeal(id, req.user.id, req.user.role);
  }
}
