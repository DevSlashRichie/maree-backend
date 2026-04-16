import { google } from "googleapis";
import jwt from "jsonwebtoken";
import type {
  WalletPassData,
  WalletPassPort,
  WalletPassResult,
} from "@/domain/ports/google-wallet-pass";

export class GoogleWalletClient implements WalletPassPort {
  private readonly issuerId: string;
  private readonly classSuffix: string;
  private readonly credentials: { client_email: string; private_key: string };

  private readonly client: ReturnType<typeof google.walletobjects>; //Google Wallet API client

  constructor(issuerId: string, classSuffix: string, keyFileContents: string) {
    this.issuerId = issuerId;
    this.classSuffix = classSuffix;
    this.credentials = JSON.parse(keyFileContents);

    // Initialize Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials: this.credentials,
      scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
    });

    // Initialize Wallet API client
    this.client = google.walletobjects({ version: "v1", auth });
  }

  // Main method to generate a loyalty pass
  async generateLoyaltyPass(data: WalletPassData): Promise<WalletPassResult> {
    await this.ensureClassExists();
    await this.upsertObject(data);
    const saveURL = this.createJWT(data.userId);

    return { saveURL, signedJWT: saveURL.split("/save/")[1] ?? "" };
  }

  private async ensureClassExists(): Promise<void> {
    const resourceId = `${this.issuerId}.${this.classSuffix}`;

    try {
      await this.client.loyaltyclass.get({ resourceId });
      return;
    } catch (err: any) {
      console.error(
        "Google API Error (Class):",
        err.response?.data || err.message,
      );
      const isNotFound =
        err instanceof Error &&
        "response" in err &&
        (err as { response: { status: number } }).response?.status === 404;

      if (!isNotFound) throw err;
    }

    await this.client.loyaltyclass.insert({
      requestBody: {
        id: resourceId,
        issuerName: "MARÉE",
        reviewStatus: "UNDER_REVIEW",
        programName: "MARÉE REWARDS",
        hexBackgroundColor: "#4a4a4a",
        programLogo: {
          sourceUri: {
            uri: "https://storage.googleapis.com/wallet-assets-maree/MAREE.png",
          },
          contentDescription: {
            defaultValue: { language: "es-419", value: "Logo de MARÉE " },
          },
        },
        accountNameLabel: "Titular",
        accountIdLabel: "Teléfono",
      },
    });
  }

  private async upsertObject(data: WalletPassData): Promise<void> {
    const resourceId = `${this.issuerId}.user_${data.userId}`;

    const objectBody = {
      id: resourceId,
      classId: `${this.issuerId}.${this.classSuffix}`,
      state: "ACTIVE",
      heroImage: {
        sourceUri: {
          uri: `https://storage.googleapis.com/wallet-assets-maree/hero-image-visits-${data.points}.png`
        }
      },
      barcode: { type: "QR_CODE", value: data.userId },
      accountId: data.phone,
      accountName: `${data.firstName} ${data.lastName}`,
      loyaltyPoints: {
        label: "Visita",
        balance: { int: data.points },
      },
    };

    try {
      await this.client.loyaltyobject.get({ resourceId });
      await this.client.loyaltyobject.patch({
        resourceId,
        requestBody: objectBody,
      });
    } catch (err: unknown) {
      const isNotFound =
        err instanceof Error &&
        "response" in err &&
        (err as { response: { status: number } }).response?.status === 404;

      if (!isNotFound) throw err;

      await this.client.loyaltyobject.insert({ requestBody: objectBody });
    }
  }

  // Create signed JWT for "Save to wallet" link
  private createJWT(userId: string): string {
    const claims = {
      iss: this.credentials.client_email,
      aud: "google",
      origins: [],
      typ: "savetowallet",
      payload: {
        loyaltyObjects: [{ id: `${this.issuerId}.user_${userId}` }],
      },
    };

    const token = jwt.sign(claims, this.credentials.private_key, {
      algorithm: "RS256",
    });

    return `https://pay.google.com/gp/v/save/${token}`;
  }
}
