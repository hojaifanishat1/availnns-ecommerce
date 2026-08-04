import { ProductForm } from "@/types/productForm";

export interface ValidationResult {
  valid: boolean;
  errors: Record<keyof ProductForm | string, string>;
}

export function validateProduct(
  product: ProductForm
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!product.name || !product.name.trim()) {
    errors.name = "Product name is required";
  }

  if (!product.category) {
    errors.category = "Category is required";
  }

  if (
    !product.pricing ||
    !product.pricing.price ||
    product.pricing.price <= 0
  ) {
    errors.price = "Valid price is required";
  }

  if (
    !product.images ||
    !Array.isArray(product.images) ||
    product.images.length === 0
  ) {
    errors.images = "At least one product image is required";
  }

  if (
    product.stock === undefined ||
    product.stock === null ||
    product.stock < 0
  ) {
    errors.stock = "Invalid stock value";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
