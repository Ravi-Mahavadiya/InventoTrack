import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({ name: z.string().min(1).optional() }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
  }),
});
