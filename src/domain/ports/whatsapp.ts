export interface WhatsAppPort {
  sendTextMessage(phone: string, body: string): Promise<void>;
}
