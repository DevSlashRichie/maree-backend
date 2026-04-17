export const ORDER_STATUSES = [
  "pending",
  "incoming",
  "set",
  "complete",
  "ready",
  "completed",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function createOrderStatus(status: string): OrderStatus {
  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    throw new InvalidOrderStatusError(status);
  }
  return status as OrderStatus;
}

export class InvalidOrderStatusError extends Error {
  readonly code = "INVALID_ORDER_STATUS";

  constructor(status: string) {
    super(
      `Order status '${status}' is invalid. Must be one of: ${ORDER_STATUSES.join(", ")}`,
    );
    this.name = "InvalidOrderStatusError";
  }
}
