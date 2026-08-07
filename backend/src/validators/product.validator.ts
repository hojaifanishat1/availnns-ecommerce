import { z } from "zod";

// Helper function to preprocess JSON strings from FormData
const parseJSONField = (fallback: any) =>
  z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return fallback;
      }
    }
    return val ?? fallback;
  }, z.any());

export const variantSchema = z.object({
  sku: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  colorHex: z.string().optional(),
  stock: z.coerce.number().min(0).optional(),
  price: z.coerce.number().min(0).optional(),
  discountPrice: z.coerce.number().min(0).optional(),
  image: z.string().optional(),
  active: z.coerce.boolean().optional(),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Product name is required"),

    description: z.string().min(10, "Description is too short"),

    shortDescription: z.string().optional(),

    category: z.string().min(1, "Category is required"),

    subCategory: z.string().optional(),

    brand: z.string().optional(),

    sku: z.string().optional(),

    price: z.coerce.number().min(0, "Price must be greater than or equal to 0"),

    discountPrice: z.coerce.number().min(0).optional(),

    stock: z.coerce.number().min(0, "Stock must be greater than or equal to 0"),

    lowStockThreshold: z.coerce.number().min(0).optional(),

    weight: z.coerce.number().min(0).optional(),

    // Flags
    isFeatured: z.coerce.boolean().optional(),

    isBestSeller: z.coerce.boolean().optional(),

    isNewArrival: z.coerce.boolean().optional(),

    isFuture: z.coerce.boolean().optional(),

    isDeal: z.coerce.boolean().optional(),

    isDigital: z.coerce.boolean().optional(),

    isPublished: z.coerce.boolean().optional(),

    isDraft: z.coerce.boolean().optional(),

    status: z.enum(["draft", "published", "archived"]).optional(),

    shippingClass: z.string().optional(),

    // Arrays & JSON Fields with preprocessing
    tags: parseJSONField([]).pipe(z.array(z.string())).optional(),

    sizes: parseJSONField([]).pipe(z.array(z.string())).optional(),

    colors: parseJSONField([]).pipe(z.array(z.string())).optional(),

    specifications: parseJSONField([]).pipe(
      z.array(
        z.object({
          key: z.string().optional(),
          value: z.string().optional(),
        })
      )
    ).optional(),

    attributes: parseJSONField([]).pipe(
      z.array(
        z.object({
          key: z.string().optional(),
          value: z.any().optional(),
        })
      )
    ).optional(),

    variants: parseJSONField([]).pipe(z.array(variantSchema)).optional(),

    shipping: parseJSONField({}).pipe(z.record(z.string(), z.any())).optional(),

    seo: parseJSONField({}).pipe(z.record(z.string(), z.any())).optional(),

    categoryFields: parseJSONField({}).pipe(z.record(z.string(), z.any())).optional(),

    images: parseJSONField([]).optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
