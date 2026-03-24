import { ApplicationError } from "@/application/error";

export abstract class GetActorError extends ApplicationError {
  abstract override readonly code: string;
}

export class ActorNotFoundError extends GetActorError {
  readonly code = "actor_not_found";

  constructor() {
    super("Actor not found");
  }
}
