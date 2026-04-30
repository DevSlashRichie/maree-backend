import { z } from "zod";
import { UserSchema } from "./user";

export const ActorSchema = UserSchema.extend({
  role: z.string().nullable(),
  policies: z.array(z.string()),
}).openapi("Actor");

export type ActorType = z.infer<typeof ActorSchema>;
export type Actor = ActorType;
