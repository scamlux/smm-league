import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ChatService } from "./chat.service";
import { JwtAuthGuard } from "../../common/jwt-auth.guard";

@Controller("chat")
export class ChatController {
  constructor(private chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get(":dealId/messages")
  async getMessages(@Param("dealId") dealId: string) {
    return this.chatService.getMessages(dealId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":dealId/messages")
  async sendMessage(
    @Param("dealId") dealId: string,
    @Request() req,
    @Body() body: { content: string },
  ) {
    return this.chatService.sendMessage(dealId, req.user.id, body.content);
  }
}
