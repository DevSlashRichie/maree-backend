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

  async generateLoyaltyPass(
    data: AppleWalletPassData,
  ): Promise<AppleWalletPassResult> {
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
