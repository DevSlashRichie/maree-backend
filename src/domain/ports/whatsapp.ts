export interface WhatsAppPort {
  sendTextMessage(phone: string, body: string): Promise<void>;
  sendVerificationMessage(phone: string, code: string): Promise<string>;
  verifyToken(phone: string, code: string): Promise<void>;
}
