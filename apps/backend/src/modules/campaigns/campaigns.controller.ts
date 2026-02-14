import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { CampaignsService } from "./campaigns.service";
import { JwtAuthGuard } from "../../common/jwt-auth.guard";

@Controller("campaigns")
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Get()
  async getCampaigns(
    @Query("brandId") brandId?: string,
    @Query("status") status?: string,
  ) {
    return this.campaignsService.getCampaigns(brandId, status);
  }

  @Get(":id")
  async getCampaignById(@Param("id") id: string) {
    return this.campaignsService.getCampaignById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createCampaign(
    @Request() req: any,
    @Body()
    body: {
      title: string;
      description: string;
      budget: number;
      platform: string;
      deadline: string;
      requirements?: string;
    },
  ) {
    if (!body.deadline) {
      throw new BadRequestException("deadline is required");
    }

    return this.campaignsService.createCampaign(
      req.user.id,
      req.user.role,
      body.title,
      body.description,
      body.budget,
      body.platform,
      new Date(body.deadline),
      body.requirements,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(":id")
  async updateCampaign(
    @Param("id") id: string,
    @Request() req: any,
    @Body() data: any,
  ) {
    return this.campaignsService.updateCampaign(id, data, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async deleteCampaign(@Param("id") id: string, @Request() req: any) {
    return this.campaignsService.deleteCampaign(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/bids")
  async submitBid(
    @Param("id") campaignId: string,
    @Request() req: any,
    @Body()
    body: {
      price: number;
      proposal: string;
      deliveryTime: string;
    },
  ) {
    return this.campaignsService.submitBid(
      campaignId,
      req.user.id,
      body.price,
      body.proposal,
      new Date(body.deliveryTime),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id/bids")
  async getBids(
    @Param("id") campaignId: string,
    @Request() req: any,
  ) {
    return this.campaignsService.getBids(
      campaignId,
      undefined,
      req?.user?.id,
      req?.user?.role,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post("bids/:bidId/accept")
  async acceptBid(@Param("bidId") bidId: string, @Request() req: any) {
    return this.campaignsService.acceptBid(bidId, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post("bids/:bidId/reject")
  async rejectBid(@Param("bidId") bidId: string, @Request() req: any) {
    return this.campaignsService.rejectBid(bidId, req.user.id, req.user.role);
  }
}
