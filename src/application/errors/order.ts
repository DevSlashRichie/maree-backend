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

export class OrderAlreadyPending extends OrderError {
  readonly code = "order_already_pending";

  constructor() {
    super("Order is already mark pending");
  }
}
export class OrderAlreadyProcessing extends OrderError {
  readonly code = "order_already_processing";

  constructor() {
    super("Order is already mark processing");
  }
}
