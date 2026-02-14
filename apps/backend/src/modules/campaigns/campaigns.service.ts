import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async createCampaign(
    brandId: string,
    title: string,
    description: string,
    budget: number,
    platform: string,
    deadline: Date,
    requirements?: string,
  ) {
    return this.prisma.campaign.create({
      data: {
        brandId,
        title,
        description,
        budget,
        platform,
        deadline,
        requirements,
      },
      include: { bids: true },
    });
  }

  async getCampaigns(brandId?: string, status?: string) {
    const where: any = {};
    if (brandId) where.brandId = brandId;
    if (status) where.status = status;

    return this.prisma.campaign.findMany({
      where,
      include: {
        brand: true,
        bids: {
          include: { influencer: { include: { user: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getCampaignById(id: string) {
    return this.prisma.campaign.findUnique({
      where: { id },
      include: {
        brand: true,
        bids: {
          include: { influencer: { include: { user: true } } },
        },
        deals: true,
      },
    });
  }

  async updateCampaign(id: string, data: any) {
    return this.prisma.campaign.update({
      where: { id },
      data,
      include: { bids: true, deals: true },
    });
  }

  async deleteCampaign(id: string) {
    return this.prisma.campaign.delete({
      where: { id },
    });
  }

  async submitBid(
    campaignId: string,
    userId: string,
    price: number,
    proposal: string,
    deliveryTime: Date,
  ) {
    // Get influencer profile for the user
    const influencer = await this.prisma.influencerProfile.findUnique({
      where: { userId },
    });
    if (!influencer) {
      throw new NotFoundException("Influencer profile not found");
    }

    return this.prisma.bid.create({
      data: {
        campaignId,
        userId,
        influencerId: influencer.id,
        price,
        proposal,
        deliveryTime,
      },
      include: {
        user: true,
        influencer: true,
      },
    });
  }

  async getBids(campaignId?: string, userId?: string) {
    const where: any = {};
    if (campaignId) where.campaignId = campaignId;
    if (userId) where.userId = userId;

    return this.prisma.bid.findMany({
      where,
      include: {
        campaign: true,
        user: true,
        influencer: true,
      },
    });
  }

  async acceptBid(bidId: string) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
    });
    if (!bid) {
      throw new NotFoundException("Bid not found");
    }

    await this.prisma.bid.update({
      where: { id: bidId },
      data: { status: "ACCEPTED" },
    });

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: bid.campaignId },
    });
    if (!campaign) {
      throw new NotFoundException("Campaign not found");
    }

    const deal = await this.prisma.deal.create({
      data: {
        campaignId: bid.campaignId,
        influencerId: bid.influencerId,
        brandId: campaign.brandId,
        price: bid.price,
      },
    });

    return deal;
  }

  async rejectBid(bidId: string) {
    return this.prisma.bid.update({
      where: { id: bidId },
      data: { status: "REJECTED" },
    });
  }
}
