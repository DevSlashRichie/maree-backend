export class ProductNotFound extends Error {
  readonly code = "product_not_found";
  constructor() {
    super("Product not found");
  }
}
