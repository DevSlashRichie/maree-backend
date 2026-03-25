import { ApplicationError } from "@/application/error";

export abstract class CreateProductError extends ApplicationError {
  abstract override readonly code: string;
}

export class ProductAlreadyExists extends CreateProductError {
  readonly code = "product_already_exists";

  constructor() {
    super("Product already exists");
  }
}
