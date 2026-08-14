"use client";

import Image from "next/image";
import {
  Minus,
  Plus,
  Trash2,
  Heart,
  Truck,
  CheckCircle2,
  Package,
  Tag,
} from "lucide-react";

import useCart from "@/hooks/useCart";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";

type Props = {
  item: any;
  maxStock?: any;
};

export default function CartItem({
  item,
  maxStock,
}: Props) {
  const {
    updateItem,
    removeItem,
  } = useCart();

  const {
    addToWishlist,
    isInWishlist,
  } = useWishlist();

  const {
    formatPrice,
  } = useCurrency();

  // =========================================================
  // PRODUCT
  // =========================================================

  const product =
    typeof item?.product === "object" &&
    item?.product !== null
      ? item.product
      : {};

  const productId =
    typeof item?.product === "string"
      ? item.product
      : item?.product?._id?.toString() ||
        product?._id?.toString() ||
        item?.product ||
        "";

  const name =
    product?.name ||
    item?.name ||
    "Product";

  // =========================================================
  // DIRECT VARIANT
  // =========================================================

  const directVariant =
    item?.variant ||
    item?.selectedVariant ||
    item?.productVariant ||
    product?.selectedVariant ||
    null;

  // =========================================================
  // SELECTED VARIANT ID
  // =========================================================

  const selectedVariantId =
    item?.variantId?.toString() ||
    item?.selectedVariantId?.toString() ||
    item?.variant?._id?.toString() ||
    item?.selectedVariant?._id?.toString() ||
    "";

  // =========================================================
  // SELECTED VARIANT SKU
  // =========================================================

  const selectedVariantSKU =
    item?.selectedVariantSKU ||
    item?.variantSKU ||
    item?.variantSku ||
    item?.sku ||
    directVariant?.sku ||
    "";

  // =========================================================
  // FIND VARIANT FROM PRODUCT.VARIANTS
  // =========================================================

  const variantFromProduct =
    Array.isArray(product?.variants)
      ? product.variants.find(
          (v: any) => {
            const variantSku =
              v?.sku ||
              v?.SKU ||
              v?.variantSKU ||
              v?.variantSku ||
              "";

            const variantId =
              v?._id?.toString() || "";

            const skuMatch =
              selectedVariantSKU &&
              String(variantSku).toLowerCase() ===
                String(selectedVariantSKU).toLowerCase();

            const idMatch =
              selectedVariantId &&
              variantId === selectedVariantId;

            return skuMatch || idMatch;
          }
        )
      : null;

  const variant =
    directVariant ||
    variantFromProduct ||
    null;

  // =========================================================
  // SELECTED SIZE / RAM / STORAGE / CAPACITY
  // =========================================================

  const selectedSize =
    item?.selectedSize ||
    item?.size ||
    item?.variantSize ||
    item?.capacity ||
    item?.storage ||
    item?.ram ||

    variant?.size ||
    variant?.capacity ||
    variant?.storage ||
    variant?.ram ||

    variant?.attributes?.size ||
    variant?.attributes?.capacity ||
    variant?.attributes?.storage ||
    variant?.attributes?.ram ||

    variant?.options?.find(
      (option: any) =>
        [
          "size",
          "storage",
          "capacity",
          "ram",
        ].includes(
          String(
            option?.name || ""
          ).toLowerCase()
        )
    )?.value ||

    product?.selectedSize ||
    product?.size ||
    product?.capacity ||
    product?.storage ||
    "";

  // =========================================================
  // SELECTED COLOR
  // =========================================================

  const selectedColor =
    item?.selectedColor ||
    item?.color ||
    item?.variantColor ||

    variant?.color ||
    variant?.colour ||

    variant?.attributes?.color ||
    variant?.attributes?.colour ||

    variant?.options?.find(
      (option: any) =>
        [
          "color",
          "colour",
        ].includes(
          String(
            option?.name || ""
          ).toLowerCase()
        )
    )?.value ||

    product?.selectedColor ||
    product?.color ||
    "";

  // =========================================================
  // COLOR HEX
  // =========================================================

  const colorHex =
    item?.colorHex ||
    variant?.colorHex ||
    variant?.color?.hex ||
    variant?.color?.code ||
    "";

  // =========================================================
  // STOCK
  // =========================================================

  const stock =
    maxStock ??
    item?.stock ??
    variant?.stock ??
    variant?.quantity ??
    product?.stock ??
    product?.inventory?.stock ??
    999;

  // =========================================================
  // PRICE SOURCES
  // =========================================================

  /*
   * IMPORTANT:
   *
   * item.price অনেক সময় backend/cart থেকে
   * original price হিসেবে আসে।
   *
   * তাই item.price প্রথমে নেওয়া হচ্ছে না।
   *
   * Priority:
   *
   * 1. Variant discountPrice
   * 2. Item discountPrice
   * 3. Product discountPrice
   * 4. Variant price
   * 5. Product price
   * 6. Item price
   */

  const variantDiscountPrice = Number(
    variant?.discountPrice ??
    variant?.salePrice ??
    variant?.offerPrice ??
    0
  );

  const itemDiscountPrice = Number(
    item?.discountPrice ??
    item?.salePrice ??
    item?.offerPrice ??
    0
  );

  const productDiscountPrice = Number(
    product?.discountPrice ??
    product?.pricing?.discountPrice ??
    product?.salePrice ??
    product?.offerPrice ??
    0
  );

  // =========================================================
  // REGULAR / ORIGINAL PRICE
  // =========================================================

  const variantRegularPrice = Number(
    variant?.price ??
    variant?.regularPrice ??
    variant?.basePrice ??
    0
  );

  const productRegularPrice = Number(
    product?.price ??
    product?.pricing?.price ??
    product?.regularPrice ??
    0
  );

  const itemRegularPrice = Number(
    item?.originalPrice ??
    item?.regularPrice ??
    item?.basePrice ??
    item?.price ??
    0
  );

  // =========================================================
  // FINAL SELLING PRICE
  // =========================================================

  let price = 0;

  if (variantDiscountPrice > 0) {
    price = variantDiscountPrice;
  } else if (itemDiscountPrice > 0) {
    price = itemDiscountPrice;
  } else if (productDiscountPrice > 0) {
    price = productDiscountPrice;
  } else if (variantRegularPrice > 0) {
    price = variantRegularPrice;
  } else if (productRegularPrice > 0) {
    price = productRegularPrice;
  } else {
    price = itemRegularPrice;
  }

  // =========================================================
  // ORIGINAL PRICE
  // =========================================================

  let originalPrice = 0;

  if (
    variantRegularPrice > 0 &&
    variantRegularPrice > price
  ) {
    originalPrice = variantRegularPrice;
  } else if (
    productRegularPrice > 0 &&
    productRegularPrice > price
  ) {
    originalPrice = productRegularPrice;
  } else if (
    itemRegularPrice > 0 &&
    itemRegularPrice > price
  ) {
    originalPrice = itemRegularPrice;
  }

  // =========================================================
  // DISCOUNT
  // =========================================================

  const hasDiscount =
    originalPrice > price &&
    price > 0;

  const discountPercentage =
    hasDiscount
      ? Math.round(
          ((originalPrice - price) /
            originalPrice) *
            100
        )
      : 0;

  // =========================================================
  // QUANTITY
  // =========================================================

  const quantity =
    Number(item?.quantity) || 1;

  // =========================================================
  // TOTAL
  // =========================================================

  const total =
    price * quantity;

  // =========================================================
  // IMAGE
  // =========================================================

  const image =
    variant?.image?.url ||
    variant?.image ||
    item?.image?.url ||
    item?.image ||
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    "/placeholder.png";

  // =========================================================
  // REMOVE ITEM
  // =========================================================

  const handleRemoveItem = async () => {
    try {
      localStorage.setItem(
        "last_removed_cart_item",
        JSON.stringify({
          productId,
          name,
          image,
          selectedSize,
          selectedColor,
          selectedVariantSKU,
          status:
            "Item removed from cart",
        })
      );

      window.dispatchEvent(
        new Event("cartItemRemoved")
      );

      await removeItem(productId);
    } catch (error) {
      console.error(
        "Failed to remove cart item:",
        error
      );
    }
  };

  // =========================================================
  // INCREASE
  // =========================================================

  const increase = async () => {
    if (
      stock &&
      quantity >= Number(stock)
    ) {
      return;
    }

    await updateItem(
      productId,
      quantity + 1
    );
  };

  // =========================================================
  // DECREASE
  // =========================================================

  const decrease = async () => {
    if (quantity <= 1) {
      await handleRemoveItem();
      return;
    }

    await updateItem(
      productId,
      quantity - 1
    );
  };

  // =========================================================
  // WISHLIST
  // =========================================================

  const saveWishlist = () => {
    if (
      !isInWishlist(productId)
    ) {
      addToWishlist({
        _id: productId,
        name,
        price,
        image,
      });
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-4
        shadow-sm
        transition
        hover:shadow-md
      "
    >
      <div
        className="
          flex
          gap-4
        "
      >

        {/* ================================================= */}
        {/* IMAGE */}
        {/* ================================================= */}

        <div
          className="
            relative
            h-28
            w-28
            shrink-0
            overflow-hidden
            rounded-xl
            bg-gray-100
          "
        >
          <Image
            src={image}
            alt={name}
            fill
            sizes="112px"
            className="object-cover"
          />

          {hasDiscount && (
            <span
              className="
                absolute
                left-2
                top-2
                rounded-full
                bg-red-500
                px-2
                py-1
                text-[10px]
                font-bold
                text-white
              "
            >
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* ================================================= */}
        {/* DETAILS */}
        {/* ================================================= */}

        <div
          className="
            flex-1
            min-w-0
          "
        >

          {/* ================================================= */}
          {/* NAME + REMOVE */}
          {/* ================================================= */}

          <div
            className="
              flex
              justify-between
              gap-3
            "
          >

            <div className="min-w-0">

              {/* PRODUCT NAME */}

              <h3
                className="
                  font-bold
                  line-clamp-2
                  text-zinc-900
                "
              >
                {name}
              </h3>

              {/* ================================================= */}
              {/* VARIANT */}
              {/* ================================================= */}

              {(selectedSize ||
                selectedColor) && (
                <div
                  className="
                    mt-2
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                >

                  {/* SIZE */}

                  {selectedSize && (
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        border-zinc-200
                        bg-zinc-50
                        px-2.5
                        py-1.5
                        text-[11px]
                        font-medium
                        text-zinc-500
                      "
                    >
                      <Package
                        size={12}
                        className="text-zinc-400"
                      />

                      <span>
                        Variant:
                      </span>

                      <strong
                        className="
                          font-bold
                          text-zinc-900
                        "
                      >
                        {selectedSize}
                      </strong>
                    </span>
                  )}

                  {/* COLOR */}

                  {selectedColor && (
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        border-zinc-200
                        bg-zinc-50
                        px-2.5
                        py-1.5
                        text-[11px]
                        font-medium
                        text-zinc-500
                      "
                    >

                      {colorHex ? (
                        <span
                          className="
                            h-3
                            w-3
                            rounded-full
                            border
                            border-zinc-300
                          "
                          style={{
                            backgroundColor:
                              colorHex,
                          }}
                        />
                      ) : (
                        <span
                          className="
                            h-3
                            w-3
                            rounded-full
                            border
                            border-zinc-300
                          "
                          style={{
                            backgroundColor:
                              String(
                                selectedColor
                              ).toLowerCase(),
                          }}
                        />
                      )}

                      <span>
                        Color:
                      </span>

                      <strong
                        className="
                          font-bold
                          capitalize
                          text-zinc-900
                        "
                      >
                        {selectedColor}
                      </strong>

                    </span>
                  )}

                </div>
              )}

              {/* ================================================= */}
              {/* SKU */}
              {/* ================================================= */}

              {selectedVariantSKU && (
                <div
                  className="
                    mt-2
                    break-all
                    text-[10px]
                    font-mono
                    font-semibold
                    text-zinc-400
                  "
                >
                  SKU:{" "}
                  <span className="text-zinc-600">
                    {String(
                      selectedVariantSKU
                    ).toUpperCase()}
                  </span>
                </div>
              )}

              {/* ================================================= */}
              {/* PRICE */}
              {/* ================================================= */}

              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  items-center
                  gap-2
                "
              >

                {/* CURRENT PRICE */}

                <p
                  className="
                    text-xl
                    font-black
                    text-zinc-950
                  "
                >
                  {formatPrice(price)}
                </p>

                {/* ORIGINAL PRICE */}

                {hasDiscount && (
                  <p
                    className="
                      text-sm
                      font-medium
                      text-zinc-400
                      line-through
                    "
                  >
                    {formatPrice(
                      originalPrice
                    )}
                  </p>
                )}

                {/* SAVING */}

                {hasDiscount && (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1
                      rounded-md
                      bg-emerald-50
                      px-2
                      py-1
                      text-[10px]
                      font-bold
                      text-emerald-600
                    "
                  >
                    <Tag size={11} />

                    SAVE {discountPercentage}%
                  </span>
                )}

              </div>

            </div>

            {/* ================================================= */}
            {/* REMOVE BUTTON */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={
                handleRemoveItem
              }
              className="
                shrink-0
                text-gray-400
                transition
                hover:text-red-500
              "
              aria-label="Remove item"
            >
              <Trash2 size={20} />
            </button>

          </div>

          {/* ================================================= */}
          {/* STOCK */}
          {/* ================================================= */}

          <div className="mt-3">

            {Number(stock) > 0 ? (
              <p
                className="
                  flex
                  items-center
                  gap-1
                  text-sm
                  text-green-600
                "
              >
                <CheckCircle2
                  size={15}
                />

                In Stock (
                {stock} available)
              </p>
            ) : (
              <p
                className="
                  text-sm
                  text-red-500
                "
              >
                Out of stock
              </p>
            )}

          </div>

          {/* ================================================= */}
          {/* DELIVERY */}
          {/* ================================================= */}

          <div
            className="
              mt-3
              flex
              items-center
              gap-2
              text-sm
              text-gray-500
            "
          >
            <Truck size={15} />

            Delivery in 2-5 days
          </div>

          {/* ================================================= */}
          {/* QUANTITY + TOTAL */}
          {/* ================================================= */}

          <div
            className="
              mt-5
              flex
              items-center
              justify-between
              gap-4
            "
          >

            {/* ================================================= */}
            {/* QUANTITY */}
            {/* ================================================= */}

            <div
              className="
                flex
                items-center
                overflow-hidden
                rounded-full
                border
              "
            >

              <button
                type="button"
                onClick={decrease}
                disabled={
                  quantity <= 1 &&
                  Number(stock) <= 0
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  transition
                  hover:bg-gray-100
                  disabled:opacity-30
                "
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>

              <span
                className="
                  min-w-[40px]
                  text-center
                  font-bold
                "
              >
                {quantity}
              </span>

              <button
                type="button"
                onClick={increase}
                disabled={
                  Number(stock) > 0 &&
                  quantity >= Number(stock)
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  transition
                  hover:bg-gray-100
                  disabled:opacity-30
                "
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>

            </div>

            {/* ================================================= */}
            {/* TOTAL */}
            {/* ================================================= */}

            <div className="text-right">

              <p
                className="
                  text-xs
                  text-gray-500
                "
              >
                Total
              </p>

              <p
                className="
                  text-lg
                  font-black
                  text-zinc-950
                "
              >
                {formatPrice(total)}
              </p>

              {hasDiscount && (
                <p
                  className="
                    text-[11px]
                    text-zinc-400
                    line-through
                  "
                >
                  {formatPrice(
                    originalPrice *
                      quantity
                  )}
                </p>
              )}

            </div>

          </div>

          {/* ================================================= */}
          {/* ACTIONS */}
          {/* ================================================= */}

          <div
            className="
              mt-5
              flex
              items-center
              gap-3
              border-t
              pt-4
            "
          >

            <button
              type="button"
              onClick={
                saveWishlist
              }
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                px-4
                py-2
                text-sm
                font-medium
                transition
                hover:bg-gray-50
              "
            >
              <Heart size={16} />

              Save
            </button>

            <button
              type="button"
              onClick={
                handleRemoveItem
              }
              className="
                rounded-xl
                px-4
                py-2
                text-sm
                font-medium
                text-red-500
                transition
                hover:bg-red-50
              "
            >
              Remove
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}