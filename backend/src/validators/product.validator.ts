import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Product name is required"),

    description: z.string().min(10, "Description is too short"),

    category: z.string().min(1, "Category is required"),

    brand: z.string().optional(),

    price: z.coerce.number().min(0, "Price must be greater than or equal to 0"),

    discountPrice: z.coerce.number().min(0).optional(),

    stock: z.coerce.number().min(0, "Stock must be greater than or equal to 0"),

    sku: z.string().optional(),

    isFeatured: z.coerce.boolean().optional(),

    isBestSeller: z.coerce.boolean().optional(),

    isNewArrival: z.coerce.boolean().optional(),

    isFuture: z.coerce.boolean().optional(),

    isDigital: z.coerce.boolean().optional(),

    isPublished: z.coerce.boolean().optional(),

    tags: z
      .union([
        z.string(),
        z.array(z.string())
      ])
      .optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;