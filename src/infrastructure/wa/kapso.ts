import type { WhatsAppPort } from "@/domain/ports/whatsapp";
import { WhatsAppClient } from "@kapso/whatsapp-cloud-api";
import { z } from "zod";

export const envKapsoSchema = z.object({
  KAPSO_API_KEY: z.string().min(1),
});

const KapsoClient = new WhatsAppClient({
  baseUrl: "https://api.kapso.ai/meta/whatsapp",
  kapsoApiKey: process.env.KAPSO_API_KEY,
});

export class WAKapsoClient implements WhatsAppPort {
  constructor(
    private readonly fromNumber: string,
  ) {}

  async sendTextMessage(phone: string, body: string): Promise<void> {
    KapsoClient.messages.sendText({
      phoneNumberId: this.fromNumber,
      to: phone,
      body,
    });
  }
}
