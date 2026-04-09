import { Err, Ok, type Result } from "oxide.ts";
import { UnknownError } from "@/application/error.ts";
import {
  ImageIsEmpty,
  UploadProductImageError,
} from "@/application/errors/upload-product-image.ts";

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
  data: UploadProductImageInput,
): Promise<Result<UploadProductImageOutput, UploadProductImageError>> {
  try {
    if (data.image.bytes.byteLength === 0) {
      throw new ImageIsEmpty();
    }

    const mockedImageUrl = "https://cdn.maree.local/mock/product-image.jpg";

    return Ok({
      url: mockedImageUrl,
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
