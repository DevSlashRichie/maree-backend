import z from "zod";

export const RegisterUserDto = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().min(6),
  email: z.email().optional(),
  password: z.string().min(6).optional(),
  role: z.string().optional(),
});
