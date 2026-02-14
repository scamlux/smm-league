import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private sanitizeUser<T extends { password?: string }>(user: T): Omit<T, "password"> {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async logAction(
    adminId: string,
    action: string,
    targetId?: string,
    targetType?: string,
    details?: string,
  ) {
    return this.prisma.adminAction.create({
      data: {
        adminId,
        action,
        targetId,
        targetType,
        details,
      },
    });
  }

  // ==================== USER MANAGEMENT ====================

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        brandProfile: true,
        influencerProfile: { include: { socialAccounts: true } },
        subscriptions: true,
      },
    });
    return users.map((u) => this.sanitizeUser(u));
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        brandProfile: true,
        influencerProfile: { include: { socialAccounts: true } },
        subscriptions: true,
        payments: true,
      },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return this.sanitizeUser(user);
  }

  async createUser(
    email: string,
    password: string,
    name: string,
    role: "BRAND" | "INFLUENCER" | "ADMIN",
    adminId: string,
  ) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    if (role === "BRAND") {
      await this.prisma.brandProfile.create({
        data: {
          userId: user.id,
          companyName: name,
        },
      });
    } else if (role === "INFLUENCER") {
      await this.prisma.influencerProfile.create({
        data: {
          userId: user.id,
          category: "General",
        },
      });
    }

    await this.logAction(
      adminId,
      "CREATE_USER",
      user.id,
      "User",
      JSON.stringify({ email, name, role }),
    );

    return this.sanitizeUser(user);
  }

  async updateUser(id: string, data: any, adminId: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    await this.logAction(
      adminId,
      "UPDATE_USER",
      id,
      "User",
      JSON.stringify(data),
    );

    return this.sanitizeUser(user);
  }

  async deleteUser(id: string, adminId: string) {
    await this.logAction(adminId, "DELETE_USER", id, "User");

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async switchUserRole(
    userId: string,
    newRole: "BRAND" | "INFLUENCER" | "ADMIN",
    adminId: string,
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    await this.logAction(
      adminId,
      "SWITCH_USER_ROLE",
      userId,
      "User",
      JSON.stringify({ newRole }),
    );

    return this.sanitizeUser(user);
  }

  // ==================== INFLUENCER MANAGEMENT ====================

  async getAllInfluencers() {
    return this.prisma.influencerProfile.findMany({
      include: {
        user: true,
        socialAccounts: true,
      },
    });
  }

  async createInfluencer(
    userId: string,
    category: string,
    bio?: string,
    adminId?: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.role !== "INFLUENCER") {
      throw new ConflictException("User role must be INFLUENCER");
    }

    const existingProfile = await this.prisma.influencerProfile.findUnique({
      where: { userId },
    });
    if (existingProfile) {
      throw new ConflictException("Influencer profile already exists");
    }

    const influencer = await this.prisma.influencerProfile.create({
      data: {
        userId,
        category,
        bio,
      },
    });

    if (adminId) {
      await this.logAction(
        adminId,
        "CREATE_INFLUENCER",
        influencer.id,
        "Influencer",
        JSON.stringify({ category, bio }),
      );
    }

    return influencer;
  }

  async updateInfluencer(id: string, data: any, adminId: string) {
    const influencer = await this.prisma.influencerProfile.update({
      where: { id },
      data,
    });

    await this.logAction(
      adminId,
      "UPDATE_INFLUENCER",
      id,
      "Influencer",
      JSON.stringify(data),
    );

    return influencer;
  }

  async deleteInfluencer(id: string, adminId: string) {
    await this.logAction(adminId, "DELETE_INFLUENCER", id, "Influencer");

    return this.prisma.influencerProfile.delete({
      where: { id },
    });
  }

  async updateRankings(
    rankings: Array<{ id: string; rank: number }>,
    adminId: string,
  ) {
    for (const ranking of rankings) {
      await this.prisma.influencerProfile.update({
        where: { id: ranking.id },
        data: { rank: ranking.rank },
      });
    }

    await this.logAction(
      adminId,
      "UPDATE_RANKINGS",
      undefined,
      "Rankings",
      JSON.stringify(rankings),
    );

    return this.prisma.influencerProfile.findMany({
      orderBy: { rank: "asc" },
    });
  }

  // ==================== CAMPAIGN MANAGEMENT ====================

  async getAllCampaigns() {
    return this.prisma.campaign.findMany({
      include: {
        brand: true,
        bids: { include: { influencer: { include: { user: true } } } },
        deals: true,
      },
    });
  }

  async createCampaign(
    brandId: string,
    title: string,
    description: string,
    budget: number,
    platform: string,
    deadline: Date,
    adminId: string,
  ) {
    const brandProfile = await this.prisma.brandProfile.findUnique({
      where: { id: brandId },
    });
    if (!brandProfile) {
      throw new NotFoundException("Brand profile not found");
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        brandId,
        title,
        description,
        budget,
        platform,
        deadline,
      },
    });

    await this.logAction(
      adminId,
      "CREATE_CAMPAIGN",
      campaign.id,
      "Campaign",
      JSON.stringify({ title, budget, platform }),
    );

    return campaign;
  }

  async updateCampaign(id: string, data: any, adminId: string) {
    const campaign = await this.prisma.campaign.update({
      where: { id },
      data,
    });

    await this.logAction(
      adminId,
      "UPDATE_CAMPAIGN",
      id,
      "Campaign",
      JSON.stringify(data),
    );

    return campaign;
  }

  async deleteCampaign(id: string, adminId: string) {
    await this.logAction(adminId, "DELETE_CAMPAIGN", id, "Campaign");

    return this.prisma.campaign.delete({
      where: { id },
    });
  }

  // ==================== DEAL MANAGEMENT ====================

  async getAllDeals() {
    return this.prisma.deal.findMany({
      include: {
        campaign: true,
        brand: true,
        influencer: { include: { user: true } },
      },
    });
  }

  async forceCompleteDeal(id: string, adminId: string) {
    const deal = await this.prisma.deal.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    await this.logAction(adminId, "FORCE_COMPLETE_DEAL", id, "Deal");

    return deal;
  }

  async updateDeal(id: string, data: any, adminId: string) {
    const deal = await this.prisma.deal.update({
      where: { id },
      data,
    });

    await this.logAction(
      adminId,
      "UPDATE_DEAL",
      id,
      "Deal",
      JSON.stringify(data),
    );

    return deal;
  }

  // ==================== SUBSCRIPTION MANAGEMENT ====================

  async getAllSubscriptions() {
    return this.prisma.subscription.findMany({
      include: {
        user: true,
      },
    });
  }

  async activateSubscription(
    userId: string,
    tier: string,
    durationDays: number,
    adminId: string,
  ) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        tier,
        endDate,
        status: "ACTIVE",
      },
    });

    await this.logAction(
      adminId,
      "ACTIVATE_SUBSCRIPTION",
      userId,
      "Subscription",
      JSON.stringify({ tier, durationDays }),
    );

    return subscription;
  }

  async deactivateSubscription(userId: string, adminId: string) {
    const subscription = await this.prisma.subscription.updateMany({
      where: { userId },
      data: { status: "INACTIVE" },
    });

    await this.logAction(
      adminId,
      "DEACTIVATE_SUBSCRIPTION",
      userId,
      "Subscription",
    );

    return subscription;
  }

  // ==================== PAYMENT MANAGEMENT ====================

  async getAllPayments() {
    return this.prisma.payment.findMany({
      include: {
        user: true,
      },
    });
  }

  async createPayment(
    userId: string,
    amount: number,
    type: string,
    adminId: string,
  ) {
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount,
        type,
        status: "completed",
      },
    });

    await this.logAction(
      adminId,
      "CREATE_PAYMENT",
      userId,
      "Payment",
      JSON.stringify({ amount, type }),
    );

    return payment;
  }

  // ==================== AUDIT LOGS ====================

  async getAuditLogs(limit = 100) {
    return this.prisma.adminAction.findMany({
      include: {
        admin: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  // ==================== IMPERSONATION ====================

  async impersonateUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.logAction(
      adminId,
      "IMPERSONATE_USER",
      userId,
      "User",
      user.email,
    );

    return this.sanitizeUser(user);
  }
}
