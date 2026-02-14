import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  private async ensureDealAccess(dealId: string, userId: string, role: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        brand: true,
        influencer: true,
      },
    });
    if (!deal) {
      throw new NotFoundException("Deal not found");
    }

    if (role === "ADMIN") {
      return;
    }

    const [brandProfile, influencerProfile] = await Promise.all([
      this.prisma.brandProfile.findUnique({ where: { userId } }),
      this.prisma.influencerProfile.findUnique({ where: { userId } }),
    ]);

    const isBrandOwner = userId === deal.brandId;
    const isInfluencerOwner = influencerProfile?.id === deal.influencerId;
    if (!isBrandOwner && !isInfluencerOwner) {
      throw new ForbiddenException("Access denied");
    }
  }

  async getMessages(dealId: string, userId: string, role: string) {
    await this.ensureDealAccess(dealId, userId, role);
    return this.prisma.message.findMany({
      where: { dealId },
      include: {
        sender: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async sendMessage(
    dealId: string,
    senderId: string,
    role: string,
    content: string,
  ) {
    if (!content || !content.trim()) {
      throw new BadRequestException("Message content is required");
    }
    await this.ensureDealAccess(dealId, senderId, role);

    return this.prisma.message.create({
      data: {
        dealId,
        senderId,
        content: content.trim(),
      },
      include: {
        sender: true,
      },
    });
  }
}
