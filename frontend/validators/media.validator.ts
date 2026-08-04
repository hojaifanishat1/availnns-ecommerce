import { z } from "zod";

export const mediaValidator = z.object({
  _id: z.string().optional(),
  url: z.string().url("Invalid image or media URL format."),
  publicId: z.string().optional(),
  alt: z.string().max(150, "Alt text cannot exceed 150 characters").optional(),
  isPrimary: z.boolean().default(false),
  order: z.number().int("Order must be an integer").nonnegative("Order cannot be negative").default(0),
});

export type MediaValidatorType = z.infer<typeof mediaValidator>;
