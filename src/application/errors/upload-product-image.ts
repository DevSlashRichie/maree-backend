import { ApplicationError } from "@/application/error.ts";

export abstract class UploadProductImageError extends ApplicationError {
  abstract override readonly code: string;
}

export class ImageIsEmpty extends UploadProductImageError {
  readonly code = "image_is_empty";

  constructor() {
    super("Image is empty");
  }
}

export class ProductDoesNotExist extends UploadProductImageError {
  readonly code = "product_does_not_exist";

  constructor() {
    super("Product does not exist");
  }
}
