import { WhatsAppClient } from "@kapso/whatsapp-cloud-api";
import { z } from "zod";
import type { WhatsAppPort } from "@/domain/ports/whatsapp";

export const envKapsoSchema = z.object({
  KAPSO_API_KEY: z.string().min(1),
});

const KapsoClient = new WhatsAppClient({
  baseUrl: "https://api.kapso.ai/meta/whatsapp",
  kapsoApiKey: process.env.KAPSO_API_KEY,
});

export class WAKapsoClient implements WhatsAppPort {
  constructor(private readonly fromNumber: string) {}

  verifyToken(_phone: string, _code: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  async sendVerificationMessage(_: string, __: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  async sendTextMessage(phone: string, body: string): Promise<void> {
    KapsoClient.messages.sendText({
      phoneNumberId: this.fromNumber,
      to: phone,
      body,
    });
  }
}
