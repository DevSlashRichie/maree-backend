import Twilio from "twilio";
import { z } from "zod";
import type { WhatsAppPort } from "@/domain/ports/whatsapp";

export const envTwilioSchema = z.object({
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
});

export const createTwilioClient = () => {
  const env = envTwilioSchema.parse({
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  });

  return Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
};

const TwilioClient = createTwilioClient();

export class WATwilioClient implements WhatsAppPort {
  constructor(private readonly fromNumber: string) {}

  async sendTextMessage(phone: string, body: string): Promise<void> {
    TwilioClient.messages.create({
      from: `whatsapp:${this.fromNumber}`,
      to: `whatsapp:${phone}`,
      contentSid: "HX4738d832b4d8a112ec303a4e4ba1e2b3",
      contentVariables: JSON.stringify({
        1: body,
      }),
    });
  }
}

/*
 *
  Hola, tu codigo de seguridad es: {1} 
 *
 * */

/*
 *
  Hola, tu codigo de seguridad es: 1248256
 *
 * */
