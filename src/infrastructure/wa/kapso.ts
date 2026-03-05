import { WhatsAppClient } from "@kapso/whatsapp-cloud-api";
import { z } from "zod";

export const envKapsoSchema = z.object({
  KAPSO_API_KEY: z.string().min(1),
});

export const WAClient = new WhatsAppClient({
  baseUrl: "https://api.kapso.ai/meta/whatsapp",
  kapsoApiKey: process.env.KAPSO_API_KEY,
});
