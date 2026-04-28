import { PKPass } from "passkit-generator";
import type {
  AppleWalletPassData,
  AppleWalletPassPort,
  AppleWalletPassResult,
} from "@/domain/ports/apple-wallet-pass";

export class AppleWalletClient implements AppleWalletPassPort {
  constructor(
    private readonly teamIdentifier: string,
    private readonly passTypeIdentifier: string,
    private readonly wwdrPem: string,
    private readonly certPem: string,
    private readonly keyPem: string,
    private readonly keyPassphrase?: string,
  ) {}

  private async fetchImage(url: string): Promise<Buffer> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);
    return Buffer.from(await res.arrayBuffer());
  }

  async generateLoyaltyPass(
    data: AppleWalletPassData,
  ): Promise<AppleWalletPassResult> {
    const heroIndex = (data.points % 6) + 1;
    const [logoBuffer, stripBuffer] = await Promise.all([
      this.fetchImage(
        "https://storage.googleapis.com/wallet-assets-maree/logo1.png",
      ),
      this.fetchImage(
        `https://storage.googleapis.com/wallet-assets-maree/hero-image-visits-${heroIndex}.png`,
      ),
    ]);

    const pass = new PKPass(
      {
        "pass.json": Buffer.from(
          JSON.stringify({
            formatVersion: 1,
            passTypeIdentifier: this.passTypeIdentifier,
            teamIdentifier: this.teamIdentifier,
            organizationName: "MARÉE",
            description: "MARÉE Loyalty",
            storeCard: {},
          }),
        ),
        "logo.png": logoBuffer,
        "logo@2x.png": logoBuffer,
        "strip.png": stripBuffer,
        "strip@2x.png": stripBuffer,
      },
      {
        wwdr: this.wwdrPem,
        signerCert: this.certPem,
        signerKey: this.keyPem,
        signerKeyPassphrase: this.keyPassphrase,
      },
      {
        serialNumber: data.userId,
        logoText: "MARÉE",
        foregroundColor: "rgb(255, 255, 255)",
        backgroundColor: "rgb(74, 74, 74)",
        labelColor: "rgb(255, 255, 255)",
      },
    );

    pass.primaryFields.push({
      key: "balance",
      label: "Visitas",
      value: data.points,
    });

    pass.secondaryFields.push({
      key: "name",
      label: "Titular",
      value: `${data.firstName} ${data.lastName}`,
    });

    pass.auxiliaryFields.push({
      key: "phone",
      label: "Teléfono",
      value: data.phone,
    });

    pass.setBarcodes(data.userId);

    return { pkpassBuffer: pass.getAsBuffer() };
  }
}
