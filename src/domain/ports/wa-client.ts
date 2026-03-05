import type { WhatsAppClient } from "@kapso/whatsapp-cloud-api";

export class WAClientPort {
    constructor(
        private readonly client: WhatsAppClient,
        private readonly fromNumber: string,
    ) { }

    async sendTextMessage(phone: string, body: string) {
        await this.client.messages.sendText({
            phoneNumberId: this.fromNumber,
            to: phone,
            body,
        });
    }
}
