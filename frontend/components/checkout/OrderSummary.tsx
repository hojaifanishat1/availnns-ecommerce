"use client";

import {
  ShoppingBag,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { useCurrency } from "@/context/CurrencyContext";

interface Props {
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  loading: boolean;
}

// ======================================================
// HELPERS
// ======================================================

const cleanValue = (value: any): string => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  return String(value).trim();
};

// ======================================================
// GET PRODUCT CATEGORY
// ======================================================

const getCategoryName = (item: any): string => {
  const product =
    typeof item?.product === "object"
      ? item.product
      : {};

  const category =
    product?.category;

  if (typeof category === "string") {
    return category.toLowerCase();
  }

  if (
    category &&
    typeof category === "object"
  ) {
    return String(
      category.name ||
      category.title ||
      category.slug ||
      ""
    ).toLowerCase();
  }

  return String(
    product?.categoryName ||
    product?.categorySlug ||
    ""
  ).toLowerCase();
};

// ======================================================
// GET VARIANT
// ======================================================

const getVariant = (item: any) => {
  if (
    item?.variant &&
    typeof item.variant === "object"
  ) {
    return item.variant;
  }

  return {};
};

// ======================================================
// GET SELECTED COLOR
// ======================================================

const getSelectedColor = (item: any): string => {
  const variant = getVariant(item);

  return (
    cleanValue(item?.selectedColor) ||
    cleanValue(item?.color) ||
    cleanValue(variant?.color) ||
    cleanValue(variant?.attributes?.color)
  );
};

// ======================================================
// GET SELECTED SKU
// ======================================================

const getSelectedSKU = (item: any): string => {
  const variant = getVariant(item);

  return (
    cleanValue(item?.selectedVariantSKU) ||
    cleanValue(variant?.sku) ||
    cleanValue(variant?.SKU) ||
    cleanValue(variant?.variantSKU)
  );
};

// ======================================================
// GET CATEGORY-SPECIFIC VARIANT INFORMATION
// ======================================================

const getVariantDisplay = (item: any) => {
  const variant = getVariant(item);

  const category =
    getCategoryName(item);

  const result: {
    label: string;
    value: string;
  }[] = [];

  // ====================================================
  // CLOTHING / FASHION
  // ====================================================

  const isFashion =
    category.includes("fashion") ||
    category.includes("clothing") ||
    category.includes("apparel") ||
    category.includes("shirt") ||
    category.includes("t-shirt") ||
    category.includes("tshirt") ||
    category.includes("pant") ||
    category.includes("jeans") ||
    category.includes("dress") ||
    category.includes("shoe") ||
    category.includes("footwear");

  // ====================================================
  // ELECTRONICS / MOBILE / LAPTOP
  // ====================================================

  const isElectronics =
    category.includes("electronic") ||
    category.includes("mobile") ||
    category.includes("phone") ||
    category.includes("smartphone") ||
    category.includes("tablet") ||
    category.includes("laptop") ||
    category.includes("computer");

  // ====================================================
  // FASHION → SIZE
  // ====================================================

  if (isFashion) {
    const size =
      cleanValue(
        item?.selectedSize
      ) ||
      cleanValue(
        item?.size
      ) ||
      cleanValue(
        variant?.size
      ) ||
      cleanValue(
        variant?.attributes?.size
      );

    if (size) {
      result.push({
        label: "Size",
        value: size,
      });
    }
  }

  // ====================================================
  // ELECTRONICS → STORAGE
  // ====================================================

  if (isElectronics) {
    const storage =
      cleanValue(
        variant?.storage
      ) ||
      cleanValue(
        variant?.capacity
      ) ||
      cleanValue(
        variant?.attributes?.storage
      ) ||
      cleanValue(
        variant?.attributes?.capacity
      );

    if (storage) {
      result.push({
        label: "Storage",
        value: storage,
      });
    }
  }

  // ====================================================
  // GENERIC PRODUCT
  // If category doesn't match, check variant fields
  // WITHOUT showing capacity/storage as Size.
  // ====================================================

  if (
    !isFashion &&
    !isElectronics
  ) {
    const size =
      cleanValue(
        item?.selectedSize
      ) ||
      cleanValue(
        item?.size
      ) ||
      cleanValue(
        variant?.size
      ) ||
      cleanValue(
        variant?.attributes?.size
      );

    if (size) {
      result.push({
        label: "Size",
        value: size,
      });
    }

    const storage =
      cleanValue(
        variant?.storage
      ) ||
      cleanValue(
        variant?.capacity
      );

    if (storage) {
      result.push({
        label: "Storage",
        value: storage,
      });
    }
  }

  // ====================================================
  // COLOR → ALL CATEGORIES
  // ====================================================

  const color =
    getSelectedColor(item);

  if (color) {
    result.push({
      label: "Color",
      value: color,
    });
  }

  // ====================================================
  // SKU → OPTIONAL
  // ====================================================

  // SKU যদি user-এর সামনে দেখাতে না চাও,
  // নিচের অংশ uncomment করবে না.
  //
  // const sku = getSelectedSKU(item);
  //
  // if (sku) {
  //   result.push({
  //     label: "SKU",
  //     value: sku,
  //   });
  // }

  return result;
};

// ======================================================
// COMPONENT
// ======================================================

export default function OrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  discount,
  total,
  loading,
}: Props) {
  const { formatPrice } =
    useCurrency();

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm sticky top-5">

      {/* ==================================================
          HEADER
      ================================================== */}

      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
        <ShoppingBag size={24} />

        Order Summary
      </h2>

      {/* ==================================================
          ITEMS
      ================================================== */}

      <div className="space-y-5 max-h-[420px] overflow-y-auto">

        {items?.length === 0 && (
          <div className="py-8 text-center text-sm text-zinc-500">
            No items in cart
          </div>
        )}

        {items?.map(
          (
            item: any,
            index: number
          ) => {

            const product =
              typeof item?.product === "object" &&
              item?.product !== null
                ? item.product
                : {};

            const variantDisplay =
              getVariantDisplay(item);

            const image =
              product?.images?.[0]?.url ||
              product?.images?.[0] ||
              item?.image ||
              "/placeholder.png";

            const productName =
              product?.name ||
              item?.name ||
              "Product";

            const itemPrice =
              Number(
                item?.price ||
                product?.discountPrice ||
                product?.price ||
                0
              );

            const quantity =
              Number(
                item?.quantity || 1
              );

            return (
              <div
                key={
                  item?._id ||
                  `${item?.product?._id || item?.product}-${index}`
                }
                className="flex gap-4 border-b pb-4"
              >

                {/* IMAGE */}

                <div className="h-16 w-16 overflow-hidden rounded-xl bg-zinc-100 shrink-0">

                  <img
                    src={image}
                    alt={productName}
                    className="h-full w-full object-cover"
                  />

                </div>

                {/* INFO */}

                <div className="flex-1 min-w-0">

                  {/* PRODUCT NAME */}

                  <h3 className="text-sm font-semibold line-clamp-2">
                    {productName}
                  </h3>

                  {/* ==================================================
                      CATEGORY BASED VARIANTS
                  ================================================== */}

                  {variantDisplay.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">

                      {variantDisplay.map(
                        (
                          variant,
                          variantIndex
                        ) => (
                          <span
                            key={`${variant.label}-${variantIndex}`}
                            className="text-[11px] text-zinc-500 font-medium"
                          >
                            {variant.label}:{" "}
                            <strong className="text-zinc-800">
                              {variant.value}
                            </strong>
                          </span>
                        )
                      )}

                    </div>
                  )}

                  {/* QUANTITY */}

                  <p className="mt-1 text-xs text-zinc-500">
                    Qty: {quantity}
                  </p>

                </div>

                {/* PRICE */}

                <div className="font-semibold text-sm shrink-0">
                  {formatPrice(
                    itemPrice * quantity
                  )}
                </div>

              </div>
            );
          }
        )}

      </div>

      {/* ==================================================
          PRICE BREAKDOWN
      ================================================== */}

      <div className="my-6 border-t pt-5 space-y-3">

        {/* SUBTOTAL */}

        <div className="flex justify-between text-sm">

          <span className="text-zinc-500">
            Subtotal
          </span>

          <span>
            {formatPrice(subtotal)}
          </span>

        </div>

        {/* SHIPPING */}

        <div className="flex justify-between text-sm">

          <span className="text-zinc-500">
            Shipping
          </span>

          <span>
            {shipping === 0
              ? "FREE"
              : formatPrice(shipping)}
          </span>

        </div>

        {/* TAX */}

        <div className="flex justify-between text-sm">

          <span className="text-zinc-500">
            Tax
          </span>

          <span>
            {formatPrice(tax)}
          </span>

        </div>

        {/* DISCOUNT */}

        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">

            <span>
              Discount
            </span>

            <span>
              -{formatPrice(discount)}
            </span>

          </div>
        )}

        {/* TOTAL */}

        <div className="mt-4 flex justify-between border-t pt-4 text-xl font-bold">

          <span>
            Total
          </span>

          <span>
            {formatPrice(total)}
          </span>

        </div>

      </div>

      {/* ==================================================
          SECURITY
      ================================================== */}

      <div className="mb-5 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700">

        <ShieldCheck size={18} />

        Secure & Protected Checkout

      </div>

      {/* ==================================================
          BUTTON
      ================================================== */}

      <button
        disabled={loading}
        className="w-full rounded-2xl bg-black py-4 font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
      >

        {loading ? (
          <div className="flex items-center justify-center gap-2">

            <Loader2 className="animate-spin" />

            Processing...

          </div>
        ) : (
          "Place Order"
        )}

      </button>

    </div>
  );
}