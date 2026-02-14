import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { InfluencersModule } from "./influencers/influencers.module";
import { CampaignsModule } from "./campaigns/campaigns.module";
import { DealsModule } from "./deals/deals.module";
import { ChatModule } from "./chat/chat.module";
import { AdminModule } from "./admin/admin.module";

@Module({
  imports: [
    AuthModule,
    InfluencersModule,
    CampaignsModule,
    DealsModule,
    ChatModule,
    AdminModule,
  ],
})
export class AppModule {}
