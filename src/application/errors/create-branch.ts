import { ApplicationError } from "@/application/error";

export abstract class CreateBranchError extends ApplicationError {
  abstract override readonly code: string;
}

export class AlreadyExistsBranch extends CreateBranchError {
  readonly code = "branch_already_exists";

  constructor() {
    super("Branch already exists");
  }
}
