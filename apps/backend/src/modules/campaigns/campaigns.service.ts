import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async createCampaign(
    userId: string,
    role: string,
    title: string,
    description: string,
    budget: number,
    platform: string,
    deadline: Date,
    requirements?: string,
  ) {
    if (role !== "BRAND") {
      throw new ForbiddenException("Only brands can create campaigns");
    }

    const brandProfile = await this.prisma.brandProfile.findUnique({
      where: { userId },
    });
    if (!brandProfile) {
      throw new NotFoundException("Brand profile not found");
    }
    const brandId = brandProfile.id;

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

  async updateCampaign(id: string, data: any, userId: string, role: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: { brand: true },
    });
    if (!campaign) {
      throw new NotFoundException("Campaign not found");
    }

    if (role !== "ADMIN" && campaign.brand.userId !== userId) {
      throw new ForbiddenException("You can only update your own campaigns");
    }

    return this.prisma.campaign.update({
      where: { id },
      data,
      include: { bids: true, deals: true },
    });
  }

  async deleteCampaign(id: string, userId: string, role: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: { brand: true },
    });
    if (!campaign) {
      throw new NotFoundException("Campaign not found");
    }
    if (role !== "ADMIN" && campaign.brand.userId !== userId) {
      throw new ForbiddenException("You can only delete your own campaigns");
    }

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
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      throw new NotFoundException("Campaign not found");
    }
    if (campaign.status !== "OPEN") {
      throw new ForbiddenException("Bids are allowed only for open campaigns");
    }

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

  async getBids(
    campaignId?: string,
    userId?: string,
    requesterId?: string,
    requesterRole?: string,
  ) {
    const where: any = {};
    if (campaignId) where.campaignId = campaignId;
    if (userId) where.userId = userId;

    if (campaignId && requesterId && requesterRole !== "ADMIN") {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { brand: true },
      });
      if (!campaign) {
        throw new NotFoundException("Campaign not found");
      }
      if (campaign.brand.userId !== requesterId) {
        throw new ForbiddenException("Only campaign owner can view bids");
      }
    }

    return this.prisma.bid.findMany({
      where,
      include: {
        campaign: true,
        user: true,
        influencer: true,
      },
    });
  }

  async acceptBid(bidId: string, userId: string, role: string) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
    });
    if (!bid) {
      throw new NotFoundException("Bid not found");
    }

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: bid.campaignId },
      include: { brand: true },
    });
    if (!campaign) {
      throw new NotFoundException("Campaign not found");
    }

    if (role !== "ADMIN" && campaign.brand.userId !== userId) {
      throw new ForbiddenException("You can only accept bids on your campaigns");
    }
    if (bid.status !== "PENDING") {
      throw new ForbiddenException("Only pending bids can be accepted");
    }

    const existingDeal = await this.prisma.deal.findFirst({
      where: { campaignId: bid.campaignId, influencerId: bid.influencerId },
    });
    if (existingDeal) {
      throw new ForbiddenException("Deal for this bid already exists");
    }

    await this.prisma.bid.update({
      where: { id: bidId },
      data: { status: "ACCEPTED" },
    });

    await this.prisma.bid.updateMany({
      where: { campaignId: bid.campaignId, NOT: { id: bidId }, status: "PENDING" },
      data: { status: "REJECTED" },
    });

    const deal = await this.prisma.deal.create({
      data: {
        campaignId: bid.campaignId,
        influencerId: bid.influencerId,
        brandId: campaign.brand.userId,
        price: bid.price,
      },
    });

    return deal;
  }

  async rejectBid(bidId: string, userId: string, role: string) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: { campaign: { include: { brand: true } } },
    });
    if (!bid) {
      throw new NotFoundException("Bid not found");
    }
    if (role !== "ADMIN" && bid.campaign.brand.userId !== userId) {
      throw new ForbiddenException("You can only reject bids on your campaigns");
    }
    if (bid.status !== "PENDING") {
      throw new ForbiddenException("Only pending bids can be rejected");
    }

    return this.prisma.bid.update({
      where: { id: bidId },
      data: { status: "REJECTED" },
    });
  }
}
