import { z } from "zod";
import { UserSchema } from "./user";

export const ActorSchema = UserSchema.extend({
  role: z.string().nullable(),
}).openapi("Actor");

export type ActorType = z.infer<typeof ActorSchema>;
