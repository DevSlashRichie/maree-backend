export const PRODUCT_STATUSES = ["active", "inactive"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export function createProductStatus(status: string): ProductStatus {
  if (!PRODUCT_STATUSES.includes(status as ProductStatus)) {
    throw new InvalidProductStatusError(status);
  }
  return status as ProductStatus;
}

export class InvalidProductStatusError extends Error {
  readonly code = "INVALID_PRODUCT_STATUS";

  constructor(status: string) {
    super(
      `Product status '${status}' is invalid. Must be one of: ${PRODUCT_STATUSES.join(", ")}`,
    );
    this.name = "InvalidProductStatusError";
  }
}
