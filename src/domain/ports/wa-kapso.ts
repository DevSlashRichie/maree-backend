import type { WhatsAppClient } from "@kapso/whatsapp-cloud-api";
import { logger } from "@/lib/logger";
import type { WhatsAppPort } from "./whatsapp";

export class WAKapsoPort implements WhatsAppPort {
  constructor(
    private readonly client: WhatsAppClient,
    private readonly fromNumber: string,
  ) {}

  async sendTextMessage(phone: string, body: string) {
    logger.debug("Sending a message to %s from %s", phone, this.fromNumber);

    await this.client.messages.sendText({
      phoneNumberId: this.fromNumber,
      to: phone,
      body,
    });
  }
}
