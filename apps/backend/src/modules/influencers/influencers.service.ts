import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class InfluencersService {
  constructor(private prisma: PrismaService) {}

  async getLeague(limit = 50) {
    const influencers = await this.prisma.influencerProfile.findMany({
      include: {
        user: true,
        socialAccounts: true,
      },
      orderBy: {
        rank: "asc",
      },
      take: limit,
    });

    return influencers;
  }

  async getInfluencerById(id: string) {
    const influencer = await this.prisma.influencerProfile.findUnique({
      where: { id },
      include: {
        user: true,
        socialAccounts: true,
      },
    });
    if (!influencer) {
      throw new NotFoundException("Influencer not found");
    }
    return influencer;
  }

  async updateInfluencer(id: string, data: any, userId: string, role: string) {
    const influencer = await this.prisma.influencerProfile.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!influencer) {
      throw new NotFoundException("Influencer not found");
    }
    if (role !== "ADMIN" && influencer.userId !== userId) {
      throw new ForbiddenException("You can update only your own profile");
    }

    return this.prisma.influencerProfile.update({
      where: { id },
      data,
      include: {
        user: true,
        socialAccounts: true,
      },
    });
  }

  async searchInfluencers(
    category?: string,
    platform?: string,
    minFollowers?: number,
  ) {
    const where: any = {};

    if (category) {
      where.category = {
        contains: category,
        mode: "insensitive",
      };
    }

    const influencers = await this.prisma.influencerProfile.findMany({
      where,
      include: {
        user: true,
        socialAccounts: platform
          ? {
              where: { platform: platform as any },
            }
          : true,
      },
    });

    if (minFollowers) {
      return influencers.filter((inf: any) =>
        inf.socialAccounts.some((acc: any) => acc.followers >= minFollowers),
      );
    }

    return influencers;
  }

  async updateRankings(rankings: Array<{ id: string; rank: number }>) {
    for (const ranking of rankings) {
      await this.prisma.influencerProfile.update({
        where: { id: ranking.id },
        data: { rank: ranking.rank },
      });
    }
    return this.getLeague();
  }

  async addSocialAccount(
    influencerId: string,
    userId: string,
    role: string,
    platform: string,
    username: string,
    followers: number,
    engagement: number,
    url: string,
  ) {
    const influencer = await this.prisma.influencerProfile.findUnique({
      where: { id: influencerId },
    });
    if (!influencer) {
      throw new NotFoundException("Influencer not found");
    }
    if (role !== "ADMIN" && influencer.userId !== userId) {
      throw new ForbiddenException("You can add social accounts only to your profile");
    }

    const normalizedPlatform = platform.toUpperCase();
    const allowedPlatforms = ["INSTAGRAM", "YOUTUBE", "TIKTOK", "TELEGRAM", "TWITTER"];
    if (!allowedPlatforms.includes(normalizedPlatform)) {
      throw new BadRequestException("Invalid platform");
    }

    return this.prisma.socialAccount.create({
      data: {
        influencerId,
        platform: normalizedPlatform as any,
        username,
        followers,
        engagement,
        url,
        syncedAt: new Date(),
      },
    });
  }
}
