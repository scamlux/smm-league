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
import { InfluencersService } from "./influencers.service";
import { JwtAuthGuard } from "../../common/jwt-auth.guard";
import { AdminGuard } from "../../common/roles.guard";

@Controller("influencers")
export class InfluencersController {
  constructor(private influencersService: InfluencersService) {}

  @Get("league")
  async getLeague(@Query("limit") limit?: string) {
    return this.influencersService.getLeague(limit ? parseInt(limit) : 50);
  }

  @Get("search")
  async search(
    @Query("category") category?: string,
    @Query("platform") platform?: string,
    @Query("minFollowers") minFollowers?: string,
  ) {
    return this.influencersService.searchInfluencers(
      category,
      platform,
      minFollowers ? parseInt(minFollowers) : undefined,
    );
  }

  @Get(":id")
  async getInfluencer(@Param("id") id: string) {
    return this.influencersService.getInfluencerById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(":id")
  async updateInfluencer(@Param("id") id: string, @Body() data: any) {
    return this.influencersService.updateInfluencer(id, data);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put("admin/rankings/update")
  async updateRankings(@Body() rankings: Array<{ id: string; rank: number }>) {
    return this.influencersService.updateRankings(rankings);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/social-accounts")
  async addSocialAccount(
    @Param("id") id: string,
    @Body()
    body: {
      platform: string;
      username: string;
      followers: number;
      engagement: number;
      url: string;
    },
  ) {
    return this.influencersService.addSocialAccount(
      id,
      body.platform,
      body.username,
      body.followers,
      body.engagement,
      body.url,
    );
  }
}
