"use client";

import Image from "next/image";

import {
  Package,
  Truck,
  Receipt,
  Tag,
  Loader2,
  Zap,
} from "lucide-react";

import { useCurrency } from "@/context/CurrencyContext";

// ======================================================
// TYPES
// ======================================================

type VariantData = {
  sku?: string;

  size?: string;
  color?: string;

  capacity?: string;
  storage?: string;

  ram?: string;
  RAM?: string;

  memory?: string;

  price?: number;
  discountPrice?: number;
  stock?: number;

  [key: string]: any;
};

type OrderSummaryItem = {
  product?: any;

  quantity?: number;

  price?: number;
  discountPrice?: number;

  image?: string;

  size?: string;
  color?: string;

  capacity?: string;
  storage?: string;

  ram?: string;
  RAM?: string;

  memory?: string;

  selectedSize?: string;
  selectedColor?: string;

  selectedCapacity?: string;
  selectedStorage?: string;

  selectedRAM?: string;
  selectedRam?: string;

  selectedMemory?: string;

  selectedVariantSKU?: string;

  variant?: VariantData | null;

  variantId?: string;

  [key: string]: any;
};

type OrderSummaryProps = {
  items?: OrderSummaryItem[];

  subtotal?: number;

  shipping?: number;

  tax?: number;

  discount?: number;

  total?: number;

  loading?: boolean;

  showPlaceOrderButton?: boolean;

  onPlaceOrder?: () => void;

  placeOrderLoading?: boolean;

  className?: string;

  deliveryType?: "regular" | "express";

  regularDeliveryFee?: number;

  expressFee?: number;
};

// ======================================================
// HELPERS
// ======================================================

const cleanString = (value: any): string => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
};

const toNumber = (
  value: any,
  fallback = 0
): number => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

// ======================================================
// PRODUCT CATEGORY
// ======================================================

const getCategoryText = (
  product: any
): string => {
  if (!product) {
    return "";
  }

  const category =
    product?.category;

  const subCategory =
    product?.subCategory;

  const values = [
    typeof category === "string"
      ? category
      : category?.name,

    typeof category === "string"
      ? ""
      : category?.slug,

    typeof category === "string"
      ? ""
      : category?.title,

    typeof subCategory === "string"
      ? subCategory
      : subCategory?.name,

    typeof subCategory === "string"
      ? subCategory
      : subCategory?.slug,

    typeof subCategory === "string"
      ? ""
      : subCategory?.title,

    product?.categoryName,
    product?.categorySlug,
    product?.categoryType,
  ];

  return values
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .trim();
};

// ======================================================
// CATEGORY DETECTION
// ======================================================

const isFashionProduct = (
  product: any
): boolean => {
  const category =
    getCategoryText(product);

  return (
    category.includes("fashion") ||
    category.includes("clothing") ||
    category.includes("apparel") ||
    category.includes("garment") ||
    category.includes("shirt") ||
    category.includes("t-shirt") ||
    category.includes("tshirt") ||
    category.includes("dress") ||
    category.includes("jeans") ||
    category.includes("pant") ||
    category.includes("shoe") ||
    category.includes("footwear") ||
    category.includes("sneaker") ||
    category.includes("men's") ||
    category.includes("mens") ||
    category.includes("women's") ||
    category.includes("womens") ||
    category.includes("kids")
  );
};

const isMobileProduct = (
  product: any
): boolean => {
  const category =
    getCategoryText(product);

  return (
    category.includes("mobile") ||
    category.includes("smartphone") ||
    category.includes("phone") ||
    category.includes("cell phone")
  );
};

const isTabletProduct = (
  product: any
): boolean => {
  const category =
    getCategoryText(product);

  return (
    category.includes("tablet") ||
    category.includes("ipad")
  );
};

const isLaptopProduct = (
  product: any
): boolean => {
  const category =
    getCategoryText(product);

  return (
    category.includes("laptop") ||
    category.includes("computer") ||
    category.includes("desktop") ||
    category.includes("notebook") ||
    category.includes("macbook")
  );
};

const isElectronicsProduct = (
  product: any
): boolean => {
  const category =
    getCategoryText(product);

  return (
    category.includes("electronic") ||
    category.includes("electronics") ||
    category.includes("gadget") ||
    category.includes("smartwatch") ||
    category.includes("watch") ||
    category.includes("headphone") ||
    category.includes("earphone") ||
    category.includes("earbud") ||
    category.includes("camera") ||
    category.includes("television") ||
    category.includes("monitor") ||
    category.includes("speaker") ||
    category.includes("gaming") ||
    category.includes("console") ||
    category.includes("accessories")
  );
};

// ======================================================
// VARIANT VALUE
// ======================================================

const getVariantValue = (
  item: OrderSummaryItem,
  variant: VariantData | null,
  keys: string[]
): string => {
  for (const key of keys) {
    const itemValue =
      item?.[key];

    if (
      itemValue !== undefined &&
      itemValue !== null &&
      cleanString(itemValue)
    ) {
      return cleanString(
        itemValue
      );
    }

    const variantValue =
      variant?.[key];

    if (
      variantValue !== undefined &&
      variantValue !== null &&
      cleanString(variantValue)
    ) {
      return cleanString(
        variantValue
      );
    }
  }

  return "";
};

// ======================================================
// VARIANT FIELDS
// ======================================================

const getVariantFields = (
  item: OrderSummaryItem
) => {
  const product =
    item?.product || {};

  const variant =
    item?.variant ||
    product?.variant ||
    null;

  const fields: {
    label: string;
    value: string;
  }[] = [];

  const fashion =
    isFashionProduct(product);

  const mobile =
    isMobileProduct(product);

  const tablet =
    isTabletProduct(product);

  const laptop =
    isLaptopProduct(product);

  const electronics =
    isElectronicsProduct(product);

  if (fashion) {
    const size =
      getVariantValue(
        item,
        variant,
        [
          "selectedSize",
          "size",
        ]
      );

    const color =
      getVariantValue(
        item,
        variant,
        [
          "selectedColor",
          "color",
        ]
      );

    if (size) {
      fields.push({
        label: "Size",
        value: size,
      });
    }

    if (color) {
      fields.push({
        label: "Color",
        value: color,
      });
    }

    return fields;
  }

  if (
    mobile ||
    tablet ||
    laptop
  ) {
    const storage =
      getVariantValue(
        item,
        variant,
        [
          "selectedStorage",
          "storage",
        ]
      );

    const capacity =
      getVariantValue(
        item,
        variant,
        [
          "selectedCapacity",
          "capacity",
        ]
      );

    const ram =
      getVariantValue(
        item,
        variant,
        [
          "selectedRAM",
          "selectedRam",
          "ram",
          "RAM",
          "selectedMemory",
          "memory",
        ]
      );

    const color =
      getVariantValue(
        item,
        variant,
        [
          "selectedColor",
          "color",
        ]
      );

    if (storage) {
      fields.push({
        label: "Storage",
        value: storage,
      });
    }

    if (
      capacity &&
      capacity !== storage
    ) {
      fields.push({
        label: "Capacity",
        value: capacity,
      });
    }

    if (ram) {
      fields.push({
        label: "RAM",
        value: ram,
      });
    }

    if (color) {
      fields.push({
        label: "Color",
        value: color,
      });
    }

    return fields;
  }

  if (electronics) {
    const storage =
      getVariantValue(
        item,
        variant,
        [
          "selectedStorage",
          "storage",
        ]
      );

    const capacity =
      getVariantValue(
        item,
        variant,
        [
          "selectedCapacity",
          "capacity",
        ]
      );

    const ram =
      getVariantValue(
        item,
        variant,
        [
          "selectedRAM",
          "selectedRam",
          "ram",
          "RAM",
          "selectedMemory",
          "memory",
        ]
      );

    const color =
      getVariantValue(
        item,
        variant,
        [
          "selectedColor",
          "color",
        ]
      );

    const size =
      getVariantValue(
        item,
        variant,
        [
          "selectedSize",
          "size",
        ]
      );

    if (storage) {
      fields.push({
        label: "Storage",
        value: storage,
      });
    }

    if (
      capacity &&
      capacity !== storage
    ) {
      fields.push({
        label: "Capacity",
        value: capacity,
      });
    }

    if (ram) {
      fields.push({
        label: "RAM",
        value: ram,
      });
    }

    if (color) {
      fields.push({
        label: "Color",
        value: color,
      });
    }

    if (size) {
      fields.push({
        label: "Size",
        value: size,
      });
    }

    return fields;
  }

  const size =
    getVariantValue(
      item,
      variant,
      [
        "selectedSize",
        "size",
      ]
    );

  const color =
    getVariantValue(
      item,
      variant,
      [
        "selectedColor",
        "color",
      ]
    );

  const storage =
    getVariantValue(
      item,
      variant,
      [
        "selectedStorage",
        "storage",
      ]
    );

  const capacity =
    getVariantValue(
      item,
      variant,
      [
        "selectedCapacity",
        "capacity",
      ]
    );

  const ram =
    getVariantValue(
      item,
      variant,
      [
        "selectedRAM",
        "selectedRam",
        "ram",
        "RAM",
        "selectedMemory",
        "memory",
      ]
    );

  if (size) {
    fields.push({
      label: "Size",
      value: size,
    });
  }

  if (storage) {
    fields.push({
      label: "Storage",
      value: storage,
    });
  }

  if (
    capacity &&
    capacity !== storage
  ) {
    fields.push({
      label: "Capacity",
      value: capacity,
    });
  }

  if (ram) {
    fields.push({
      label: "RAM",
      value: ram,
    });
  }

  if (color) {
    fields.push({
      label: "Color",
      value: color,
    });
  }

  return fields;
};

// ======================================================
// IMAGE
// ======================================================

const getProductImage = (
  product: any,
  item?: OrderSummaryItem
): string => {
  const images =
    product?.images;

  if (
    Array.isArray(images) &&
    images.length > 0
  ) {
    const first =
      images[0];

    if (
      typeof first === "string" &&
      first.trim()
    ) {
      return first;
    }

    if (
      typeof first === "object" &&
      first !== null
    ) {
      return (
        first?.url ||
        first?.secure_url ||
        first?.src ||
        "/placeholder-product.png"
      );
    }
  }

  if (
    typeof product?.image === "string" &&
    product.image.trim()
  ) {
    return product.image;
  }

  if (
    typeof item?.image === "string" &&
    item.image.trim()
  ) {
    return item.image;
  }

  return "/placeholder-product.png";
};

// ======================================================
// MAIN
// ======================================================

export default function OrderSummary({
  items = [],

  subtotal = 0,

  shipping = 0,

  tax = 0,

  discount = 0,

  total = 0,

  loading = false,

  showPlaceOrderButton = false,

  onPlaceOrder,

  placeOrderLoading = false,

  className = "",

  deliveryType = "regular",

  regularDeliveryFee = 0,

  expressFee = 0,
}: OrderSummaryProps) {
  const {
    formatPrice,
  } = useCurrency();

  if (loading) {
    return (
      <div
        className={`rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm ${className}`}
      >
        <div className="flex min-h-[280px] items-center justify-center">
          <div className="text-center">
            <Loader2
              className="mx-auto mb-3 h-7 w-7 animate-spin text-zinc-500"
            />

            <p className="text-xs font-medium text-zinc-500">
              Loading order summary...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const safeSubtotal =
    toNumber(subtotal);

  const safeShipping =
    toNumber(shipping);

  const safeTax =
    toNumber(tax);

  const safeDiscount =
    toNumber(discount);

  const safeTotal =
    Math.max(
      0,
      toNumber(
        total,
        safeSubtotal +
          safeShipping +
          safeTax -
          safeDiscount
      )
    );

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm ${className}`}
    >
      <div className="border-b border-zinc-100 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white">
            <Package size={17} />
          </div>

          <div>
            <h2 className="text-base font-bold tracking-tight text-zinc-900">
              Order Summary
            </h2>

            <p className="mt-0.5 text-[11px] text-zinc-500">
              {items.length}{" "}
              {items.length === 1
                ? "item"
                : "items"}{" "}
              in your order
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-6">
        {items.length === 0 ? (
          <div className="py-10 text-center">
            <Package className="mx-auto mb-3 h-8 w-8 text-zinc-300" />

            <p className="text-sm font-semibold text-zinc-500">
              Your cart item is empty
            </p>
          </div>
        ) : (
          <div>
            {items.map(
              (
                item,
                index
              ) => {
                const product =
                  item?.product || {};

                const productName =
                  product?.name ||
                  item?.name ||
                  "Product";

                const variant = item?.variant || product?.variant || null;

                const rawBasePrice = 
                  variant?.price ??
                  item?.price ??
                  product?.price ??
                  0;

                const rawDiscountPrice = 
                  variant?.discountPrice ??
                  item?.discountPrice ??
                  product?.discountPrice ??
                  0;

                const basePrice = toNumber(rawBasePrice);
                const discountPrice = toNumber(rawDiscountPrice);

                const hasDiscount = discountPrice > 0 && discountPrice < basePrice;
                const effectiveUnitPrice = hasDiscount ? discountPrice : basePrice;

                const quantity =
                  Math.max(
                    1,
                    toNumber(
                      item?.quantity,
                      1
                    )
                  );

                const lineTotal = effectiveUnitPrice * quantity;

                const image =
                  getProductImage(
                    product,
                    item
                  );

                const variantFields =
                  getVariantFields(
                    item
                  );

                const sku =
                  cleanString(
                    item?.selectedVariantSKU ||
                      variant?.sku
                  );

                const itemKey = [
                  product?._id ||
                    product?.id ||
                    "product",

                  sku,

                  item?.selectedSize ||
                    item?.size ||
                    "",

                  item?.selectedColor ||
                    item?.color ||
                    "",

                  index,
                ].join("-");

                return (
                  <div
                    key={itemKey}
                    className="flex gap-3 border-b border-zinc-200 py-5 last:border-b-0"
                  >
                    <div className="relative h-[70px] w-[70px] shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
                      <Image
                        src={image}
                        alt={productName}
                        fill
                        sizes="70px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-sm font-bold leading-5 text-zinc-900">
                            {productName}
                          </h3>

                          {variantFields.length >
                            0 && (
                            <div className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
                              {variantFields.map(
                                (
                                  field,
                                  fieldIndex
                                ) => (
                                  <span
                                    key={`${field.label}-${fieldIndex}`}
                                    className="text-[11px] text-zinc-500"
                                  >
                                    {
                                      field.label
                                    }
                                    :{" "}
                                    <strong className="font-semibold text-zinc-700">
                                      {
                                        field.value
                                      }
                                    </strong>
                                  </span>
                                )
                              )}
                            </div>
                          )}

                          {sku && (
                            <p className="mt-1 text-[10px] text-zinc-400">
                              SKU:{" "}
                              <span className="font-semibold text-zinc-500">
                                {sku}
                              </span>
                            </p>
                          )}

                          <p className="mt-1 text-[11px] text-zinc-400">
                            Qty:{" "}
                            <span className="font-semibold text-zinc-600">
                              {quantity}
                            </span>
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="flex flex-col items-end">
                            <p className="text-sm font-bold text-zinc-900">
                              {formatPrice(
                                lineTotal
                              )}
                            </p>
                          </div>

                          {quantity >
                            1 && (
                            <p className="mt-0.5 text-[10px] text-zinc-400">
                              {formatPrice(
                                effectiveUnitPrice
                              )}{" "}
                              each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 bg-zinc-50/50 px-5 py-5 sm:px-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-zinc-500">
              <Receipt
                size={14}
                className="text-zinc-400"
              />

              Subtotal
            </span>

            <span className="font-semibold text-zinc-900">
              {formatPrice(
                safeSubtotal
              )}
            </span>
          </div>

          {deliveryType ===
            "express" &&
            regularDeliveryFee >
              0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-zinc-500">
                  <Truck
                    size={14}
                    className="text-zinc-400"
                  />

                  Regular Delivery
                </span>

                <span className="font-semibold text-zinc-900">
                  {formatPrice(
                    regularDeliveryFee
                  )}
                </span>
              </div>
            )}

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-zinc-500">
              <Truck
                size={14}
                className="text-zinc-400"
              />

              Shipping
            </span>

            <span
              className={
                safeShipping === 0
                  ? "font-bold text-emerald-600"
                  : "font-semibold text-zinc-900"
              }
            >
              {safeShipping ===
              0
                ? "FREE"
                : formatPrice(
                    safeShipping
                  )}
            </span>
          </div>

          {deliveryType ===
            "express" &&
            expressFee > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-amber-600">
                  <Zap
                    size={14}
                  />

                  Express Fee
                </span>

                <span className="font-bold text-amber-700">
                  {formatPrice(
                    expressFee
                  )}
                </span>
              </div>
            )}

          {safeTax > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                Tax
              </span>

              <span className="font-semibold text-zinc-900">
                {formatPrice(
                  safeTax
                )}
              </span>
            </div>
          )}

          {safeDiscount >
            0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-emerald-600">
                <Tag size={14} />

                Discount
              </span>

              <span className="font-bold text-emerald-600">
                -
                {formatPrice(
                  safeDiscount
                )}
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-zinc-200 pt-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Total
              </p>

              <p className="mt-0.5 text-[10px] text-zinc-400">
                Inclusive of selected delivery
              </p>
            </div>

            <p className="text-xl font-black tracking-tight text-zinc-900">
              {formatPrice(
                safeTotal
              )}
            </p>
          </div>
        </div>

        {showPlaceOrderButton && (
          <button
            type="button"
            disabled={
              placeOrderLoading
            }
            onClick={
              onPlaceOrder
            }
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placeOrderLoading ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                Processing...
              </>
            ) : (
              "Place Order"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
