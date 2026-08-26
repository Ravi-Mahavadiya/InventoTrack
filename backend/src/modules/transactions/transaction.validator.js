import { z } from "zod";

export const stockAdjustmentSchema = z.object({
  body: z.object({
    type: z.enum(["INCREASE", "DECREASE"], { required_error: "Type must be INCREASE or DECREASE" }),
    amount: z.number({ required_error: "Amount is required" }).min(1, "Amount must be at least 1"),
    reason: z.string().optional(),
  }),
});
