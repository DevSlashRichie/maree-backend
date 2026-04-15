import { Err, Ok, type Result } from "oxide.ts";
import { UnknownError } from "@/application/error.ts";
import {
  ImageIsEmpty,
  UploadProductImageError,
} from "@/application/errors/upload-product-image.ts";
import type { FilesPort } from "@/domain/ports/files";

type UploadProductImageInput = {
  image: {
    bytes: Uint8Array;
    name: string;
    contentType: string;
  };
};

type UploadProductImageOutput = {
  url: string;
};

export async function uploadProductImageUseCase(
  filesPort: FilesPort,
  data: UploadProductImageInput,
): Promise<Result<UploadProductImageOutput, UploadProductImageError>> {
  try {
    if (data.image.bytes.byteLength === 0) {
      throw new ImageIsEmpty();
    }

    const buffer = Buffer.from(data.image.bytes);
    const fileId = await filesPort.upload(
      buffer,
      data.image.name,
      data.image.contentType,
    );

    const url = await filesPort.getDownloadUrl(fileId);

    return Ok({
      url,
    });
  } catch (error) {
    if (error instanceof UploadProductImageError) return Err(error);

    return Err(
      new UnknownError(
        error instanceof Error ? error.message : "unknown error",
      ),
    );
  }
}
