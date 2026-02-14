import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../../common/jwt-auth.guard";
import { AdminGuard } from "../../common/roles.guard";

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("admin")
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ==================== DASHBOARD ====================

  @Get("dashboard")
  async getDashboard() {
    const [
      users,
      influencers,
      campaigns,
      deals,
      subscriptions,
      payments,
      auditLogs,
    ] = await Promise.all([
      this.adminService.getAllUsers(),
      this.adminService.getAllInfluencers(),
      this.adminService.getAllCampaigns(),
      this.adminService.getAllDeals(),
      this.adminService.getAllSubscriptions(),
      this.adminService.getAllPayments(),
      this.adminService.getAuditLogs(10),
    ]);

    return {
      stats: {
        totalUsers: users.length,
        totalInfluencers: influencers.length,
        totalCampaigns: campaigns.length,
        totalDeals: deals.length,
        activeSubscriptions: subscriptions.filter((s) => s.status === "ACTIVE")
          .length,
      },
      recentActions: auditLogs,
    };
  }

  // ==================== USERS ====================

  @Get("users")
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get("users/:id")
  async getUserById(@Param("id") id: string) {
    return this.adminService.getUserById(id);
  }

  @Post("users")
  async createUser(
    @Request() req,
    @Body()
    body: {
      email: string;
      password: string;
      name: string;
      role: "BRAND" | "INFLUENCER" | "ADMIN";
    },
  ) {
    return this.adminService.createUser(
      body.email,
      body.password,
      body.name,
      body.role,
      req.user.id,
    );
  }

  @Put("users/:id")
  async updateUser(@Param("id") id: string, @Request() req, @Body() data: any) {
    return this.adminService.updateUser(id, data, req.user.id);
  }

  @Delete("users/:id")
  async deleteUser(@Param("id") id: string, @Request() req) {
    return this.adminService.deleteUser(id, req.user.id);
  }

  @Put("users/:id/role")
  async switchUserRole(
    @Param("id") id: string,
    @Request() req,
    @Body() body: { role: "BRAND" | "INFLUENCER" | "ADMIN" },
  ) {
    return this.adminService.switchUserRole(id, body.role, req.user.id);
  }

  // ==================== INFLUENCERS ====================

  @Get("influencers")
  async getAllInfluencers() {
    return this.adminService.getAllInfluencers();
  }

  @Post("influencers")
  async createInfluencer(
    @Request() req,
    @Body() body: { userId: string; category: string; bio?: string },
  ) {
    return this.adminService.createInfluencer(
      body.userId,
      body.category,
      body.bio,
      req.user.id,
    );
  }

  @Put("influencers/:id")
  async updateInfluencer(
    @Param("id") id: string,
    @Request() req,
    @Body() data: any,
  ) {
    return this.adminService.updateInfluencer(id, data, req.user.id);
  }

  @Delete("influencers/:id")
  async deleteInfluencer(@Param("id") id: string, @Request() req) {
    return this.adminService.deleteInfluencer(id, req.user.id);
  }

  @Put("influencers/rankings/update")
  async updateRankings(
    @Request() req,
    @Body() body: Array<{ id: string; rank: number }>,
  ) {
    return this.adminService.updateRankings(body, req.user.id);
  }

  // ==================== CAMPAIGNS ====================

  @Get("campaigns")
  async getAllCampaigns() {
    return this.adminService.getAllCampaigns();
  }

  @Post("campaigns")
  async createCampaign(
    @Request() req,
    @Body()
    body: {
      brandId: string;
      title: string;
      description: string;
      budget: number;
      platform: string;
      deadline: string;
    },
  ) {
    return this.adminService.createCampaign(
      body.brandId,
      body.title,
      body.description,
      body.budget,
      body.platform,
      new Date(body.deadline),
      req.user.id,
    );
  }

  @Put("campaigns/:id")
  async updateCampaign(
    @Param("id") id: string,
    @Request() req,
    @Body() data: any,
  ) {
    return this.adminService.updateCampaign(id, data, req.user.id);
  }

  @Delete("campaigns/:id")
  async deleteCampaign(@Param("id") id: string, @Request() req) {
    return this.adminService.deleteCampaign(id, req.user.id);
  }

  // ==================== DEALS ====================

  @Get("deals")
  async getAllDeals() {
    return this.adminService.getAllDeals();
  }

  @Post("deals/:id/complete")
  async forceCompleteDeal(@Param("id") id: string, @Request() req) {
    return this.adminService.forceCompleteDeal(id, req.user.id);
  }

  @Put("deals/:id")
  async updateDeal(@Param("id") id: string, @Request() req, @Body() data: any) {
    return this.adminService.updateDeal(id, data, req.user.id);
  }

  // ==================== SUBSCRIPTIONS ====================

  @Get("subscriptions")
  async getAllSubscriptions() {
    return this.adminService.getAllSubscriptions();
  }

  @Post("subscriptions")
  async activateSubscription(
    @Request() req,
    @Body() body: { userId: string; tier: string; durationDays: number },
  ) {
    return this.adminService.activateSubscription(
      body.userId,
      body.tier,
      body.durationDays,
      req.user.id,
    );
  }

  @Post("subscriptions/:userId/deactivate")
  async deactivateSubscription(
    @Param("userId") userId: string,
    @Request() req,
  ) {
    return this.adminService.deactivateSubscription(userId, req.user.id);
  }

  // ==================== PAYMENTS ====================

  @Get("payments")
  async getAllPayments() {
    return this.adminService.getAllPayments();
  }

  @Post("payments")
  async createPayment(
    @Request() req,
    @Body() body: { userId: string; amount: number; type: string },
  ) {
    return this.adminService.createPayment(
      body.userId,
      body.amount,
      body.type,
      req.user.id,
    );
  }

  // ==================== AUDIT LOGS ====================

  @Get("audit-logs")
  async getAuditLogs(@Request() req) {
    return this.adminService.getAuditLogs();
  }

  // ==================== IMPERSONATION ====================

  @Post("impersonate/:userId")
  async impersonateUser(@Param("userId") userId: string, @Request() req) {
    return this.adminService.impersonateUser(userId, req.user.id);
  }
}
