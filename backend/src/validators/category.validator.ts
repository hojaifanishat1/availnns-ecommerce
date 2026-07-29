import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Category name is required"),

    description: z.string().optional(),

    image: z.string().optional(),

    parent: z.union([z.string(), z.null(), z.undefined()]).optional(),

    isFeatured: z.coerce.boolean().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),

    description: z.string().optional(),

    image: z.string().optional(),

    parent: z.union([z.string(), z.null(), z.undefined()]).optional(),

    isFeatured: z.coerce.boolean().optional(),
  }),
});
