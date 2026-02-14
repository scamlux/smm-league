import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async getDeals(userId: string, role: string, status?: string) {
    const where: any = {};
    if (role !== "ADMIN") {
      const conditions: any[] = [];

      const brandProfile = await this.prisma.brandProfile.findUnique({
        where: { userId },
      });
      if (brandProfile) {
        conditions.push({ brandId: brandProfile.id });
      }

      const influencerProfile = await this.prisma.influencerProfile.findUnique({
        where: { userId },
      });
      if (influencerProfile) {
        conditions.push({ influencerId: influencerProfile.id });
      }

      if (conditions.length === 0) {
        return [];
      }

      where.OR = conditions;
    }
    if (status) where.status = status;

    return this.prisma.deal.findMany({
      where,
      include: {
        campaign: true,
        brand: true,
        influencer: { include: { user: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getDealById(id: string, userId: string, role: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        campaign: true,
        brand: { include: { user: true } },
        influencer: { include: { user: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!deal) {
      throw new NotFoundException("Deal not found");
    }

    if (role !== "ADMIN") {
      const isBrandOwner = deal.brand.userId === userId;
      const isInfluencerOwner = deal.influencer.userId === userId;
      if (!isBrandOwner && !isInfluencerOwner) {
        throw new ForbiddenException("Access denied");
      }
    }

    return deal;
  }

  async updateDealStatus(id: string, status: string, userId: string, role: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        brand: true,
        influencer: true,
      },
    });
    if (!deal) {
      throw new NotFoundException("Deal not found");
    }

    if (role !== "ADMIN") {
      const [brandProfile, influencerProfile] = await Promise.all([
        this.prisma.brandProfile.findUnique({ where: { userId } }),
        this.prisma.influencerProfile.findUnique({ where: { userId } }),
      ]);

      const isBrandOwner = brandProfile?.id === deal.brandId;
      const isInfluencerOwner = influencerProfile?.id === deal.influencerId;
      if (!isBrandOwner && !isInfluencerOwner) {
        throw new ForbiddenException("Access denied");
      }

      if (status === "APPROVED" || status === "COMPLETED") {
        if (!isBrandOwner) {
          throw new ForbiddenException("Only brand can approve or complete deal");
        }
      }
      if (status === "CONTENT_SUBMITTED" && !isInfluencerOwner) {
        throw new ForbiddenException("Only influencer can submit content");
      }
    }

    const allowedStatuses = [
      "ACTIVE",
      "CONTENT_SUBMITTED",
      "APPROVED",
      "COMPLETED",
      "CANCELLED",
    ];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException("Invalid deal status");
    }

    const data: any = { status };
    if (status === "APPROVED") {
      data.approvedAt = new Date();
    } else if (status === "COMPLETED") {
      data.completedAt = new Date();
    }

    return this.prisma.deal.update({
      where: { id },
      data,
      include: {
        campaign: true,
        brand: true,
        influencer: { include: { user: true } },
      },
    });
  }

  async submitContent(
    id: string,
    contentUrl: string,
    userId: string,
    role: string,
  ) {
    if (!contentUrl) {
      throw new BadRequestException("contentUrl is required");
    }
    const updated = await this.updateDealStatus(
      id,
      "CONTENT_SUBMITTED",
      userId,
      role,
    );
    return this.prisma.deal.update({
      where: { id: updated.id },
      data: { contentUrl },
      include: {
        campaign: true,
        brand: true,
        influencer: { include: { user: true } },
      },
    });
  }

  async approveDeal(id: string, userId: string, role: string) {
    return this.updateDealStatus(id, "APPROVED", userId, role);
  }

  async completeDeal(id: string, userId: string, role: string) {
    return this.updateDealStatus(id, "COMPLETED", userId, role);
  }

  async cancelDeal(id: string, userId: string, role: string) {
    return this.updateDealStatus(id, "CANCELLED", userId, role);
  }
}
