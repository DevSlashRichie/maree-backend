import { ApplicationError } from "@/application/error";

export abstract class OrderError extends ApplicationError {
  abstract override readonly code: string;
}

export class OrderNotFound extends OrderError {
  readonly code = "order_not_found";

  constructor() {
    super("Order not found");
  }
}

export class OrderAlreadyClosed extends OrderError {
  readonly code = "order_already_closed";

  constructor() {
    super("Order is already closed");
  }
}

export class OrderAlreadyMark extends OrderError {
  readonly code = "order_already_mark_ready";

  constructor() {
    super("Order is already mark ready");
  }
}

export class OrderInvalidTransition extends OrderError {
  readonly code = "invalid_transition";

  constructor(from: string, direction: string) {
    super(`Cannot move order from "${from}" ${direction}`);
  }
}
