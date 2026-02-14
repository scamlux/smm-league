import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async getDeals(userId?: string, status?: string) {
    const where: any = {};
    if (userId) {
      where.OR = [{ brandId: userId }, { influencerId: userId }];
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

  async getDealById(id: string) {
    return this.prisma.deal.findUnique({
      where: { id },
      include: {
        campaign: true,
        brand: true,
        influencer: { include: { user: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  async updateDealStatus(id: string, status: string) {
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

  async submitContent(id: string, contentUrl: string) {
    return this.prisma.deal.update({
      where: { id },
      data: {
        contentUrl,
        status: "CONTENT_SUBMITTED",
      },
      include: {
        campaign: true,
        brand: true,
        influencer: { include: { user: true } },
      },
    });
  }

  async approveDeal(id: string) {
    return this.updateDealStatus(id, "APPROVED");
  }

  async completeDeal(id: string) {
    return this.updateDealStatus(id, "COMPLETED");
  }

  async cancelDeal(id: string) {
    return this.updateDealStatus(id, "CANCELLED");
  }
}
