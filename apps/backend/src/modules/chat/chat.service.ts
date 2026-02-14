import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getMessages(dealId: string) {
    return this.prisma.message.findMany({
      where: { dealId },
      include: {
        sender: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async sendMessage(dealId: string, senderId: string, content: string) {
    return this.prisma.message.create({
      data: {
        dealId,
        senderId,
        content,
      },
      include: {
        sender: true,
      },
    });
  }
}
