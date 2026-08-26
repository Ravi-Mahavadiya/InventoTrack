import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,15}$/;

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().regex(passwordRegex, "Password must be 6-15 characters and contain uppercase, lowercase, a number, and a special character"),
    role_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid role ID")
  })
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email("Invalid email address").optional(),
    password: z.string().regex(passwordRegex, "Password must be 6-15 characters and contain uppercase, lowercase, a number, and a special character").optional(),
    role_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid role ID").optional()
  })
});

export const updateProfileSchema = z.object({
  body: z.object({ name: z.string().min(1).optional() }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
  }),
});
