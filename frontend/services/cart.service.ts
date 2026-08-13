import api from "./api";

// =========================
// TYPES
// =========================

export type CartVariant = {
  size?: string;
  color?: string;

  selectedSize?: string;
  selectedColor?: string;

  selectedVariantSKU?: string;

  variant?: {
    sku?: string;
    size?: string;
    color?: string;
    capacity?: string;
    storage?: string;
    price?: number;
    discountPrice?: number;
    stock?: number;
    [key: string]: any;
  };
};

export type AddToCartPayload = {
  productId: string;
  quantity?: number;

  size?: string;
  color?: string;

  selectedSize?: string;
  selectedColor?: string;

  selectedVariantSKU?: string;

  variant?: CartVariant["variant"];
};

export type UpdateCartPayload = {
  productId: string;
  quantity: number;

  size?: string;
  color?: string;

  selectedSize?: string;
  selectedColor?: string;

  selectedVariantSKU?: string;
};

// =========================
// GET CART
// =========================

export const getCart = async () => {
  const res = await api.get("/cart");

  return res.data;
};

// =========================
// ADD CART
// =========================

export const addToCart = async (
  productId: string,
  quantity: number = 1,
  variant: CartVariant = {}
) => {
  const res = await api.post("/cart/add", {
    productId,
    quantity,

    // Old fields
    size: variant.size || "",
    color: variant.color || "",

    // Selected variant
    selectedSize: variant.selectedSize || "",
    selectedColor: variant.selectedColor || "",

    selectedVariantSKU:
      variant.selectedVariantSKU || "",

    // Complete variant
    variant: variant.variant || null,
  });

  return res.data;
};

// =========================
// MERGE GUEST CART
// =========================

export const mergeCart = async (
  items: any[]
) => {
  const res = await api.post("/cart/merge", {
    items,
  });

  return res.data;
};

// =========================
// UPDATE
// =========================

export const updateCart = async (
  productId: string,
  quantity: number,
  variant: CartVariant = {}
) => {
  const res = await api.put("/cart/update", {
    productId,
    quantity,

    size: variant.size || "",
    color: variant.color || "",

    selectedSize:
      variant.selectedSize || "",

    selectedColor:
      variant.selectedColor || "",

    selectedVariantSKU:
      variant.selectedVariantSKU || "",
  });

  return res.data;
};

// =========================
// REMOVE
// =========================

export const removeCartItem = async (
  productId: string,
  variant: CartVariant = {}
) => {
  const res = await api.post("/cart/remove", {
    productId,

    size: variant.size || "",
    color: variant.color || "",

    selectedSize:
      variant.selectedSize || "",

    selectedColor:
      variant.selectedColor || "",

    selectedVariantSKU:
      variant.selectedVariantSKU || "",
  });

  return res.data;
};

// =========================
// CLEAR
// =========================

export const clearCart = async () => {
  const res = await api.delete("/cart/clear");

  return res.data;
};