import type Twilio from "twilio";
import { logger } from "@/lib/logger";
import type { WhatsAppPort } from "./whatsapp";

export class WATwilioPort implements WhatsAppPort {
  constructor(
    private readonly client: Twilio.Twilio,
    private readonly fromNumber: string,
  ) {}

  async sendTextMessage(phone: string, body: string) {
    logger.debug("Sending a message to %s from %s", phone, this.fromNumber);

    await this.client.messages.create({
      body,
      from: this.fromNumber,
      to: phone,
    });
  }
}
