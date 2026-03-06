import { UserSchema } from "@/domain/entities/user";

export const UserDto = UserSchema.extend({}).openapi("User");

