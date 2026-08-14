"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  ShieldCheck,
  Package,
  ChevronRight,
} from "lucide-react";

import useCart from "@/hooks/useCart";
import { useCurrency } from "@/context/CurrencyContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({
  open,
  onClose,
}: Props) {
  const {
    cart,
    totalItems,
    updateItem,
    removeItem,
  } = useCart();

  const {
    formatPrice,
  } = useCurrency();

  // =========================================================
  // BODY SCROLL LOCK + ESCAPE
  // =========================================================

  useEffect(() => {
    if (!open) return;

    const previousOverflow =
      document.body.style.overflow;

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  // =========================================================
  // CART ITEMS
  // =========================================================

  const items = useMemo(() => {
    return Array.isArray(cart?.items)
      ? cart.items
      : [];
  }, [cart]);

  // =========================================================
  // PRICE HELPER
  // =========================================================

  const getItemPricing = (item: any) => {
    const product =
      typeof item?.product === "object" &&
      item?.product !== null
        ? item.product
        : {};

    // -------------------------------------------------------
    // DIRECT VARIANT
    // -------------------------------------------------------

    const directVariant =
      item?.variant ||
      item?.selectedVariant ||
      item?.productVariant ||
      null;

    // -------------------------------------------------------
    // VARIANT SKU
    // -------------------------------------------------------

    const selectedSKU =
      item?.selectedVariantSKU ||
      item?.variantSKU ||
      item?.variantSku ||
      item?.sku ||
      directVariant?.sku ||
      "";

    // -------------------------------------------------------
    // FIND VARIANT FROM PRODUCT.VARIANTS
    // -------------------------------------------------------

    const variantFromProduct =
      Array.isArray(product?.variants)
        ? product.variants.find(
            (variant: any) => {
              const variantSKU =
                variant?.sku ||
                variant?.SKU ||
                variant?.variantSKU ||
                variant?.variantSku ||
                "";

              if (
                selectedSKU &&
                variantSKU
              ) {
                return (
                  String(variantSKU)
                    .toLowerCase() ===
                  String(selectedSKU)
                    .toLowerCase()
                );
              }

              return false;
            }
          )
        : null;

    const variant =
      directVariant ||
      variantFromProduct ||
      null;

    // -------------------------------------------------------
    // DISCOUNT PRICES
    // -------------------------------------------------------

    const variantDiscountPrice =
      Number(
        variant?.discountPrice ??
          variant?.salePrice ??
          variant?.offerPrice ??
          0
      );

    const itemDiscountPrice =
      Number(
        item?.discountPrice ??
          item?.salePrice ??
          item?.offerPrice ??
          0
      );

    const productDiscountPrice =
      Number(
        product?.discountPrice ??
          product?.pricing?.discountPrice ??
          product?.salePrice ??
          product?.offerPrice ??
          0
      );

    // -------------------------------------------------------
    // REGULAR PRICES
    // -------------------------------------------------------

    const variantRegularPrice =
      Number(
        variant?.price ??
          variant?.regularPrice ??
          variant?.basePrice ??
          0
      );

    const productRegularPrice =
      Number(
        product?.price ??
          product?.pricing?.price ??
          product?.regularPrice ??
          0
      );

    const itemPrice =
      Number(
        item?.price ??
          item?.originalPrice ??
          item?.regularPrice ??
          0
      );

    // -------------------------------------------------------
    // FINAL SELLING PRICE
    // -------------------------------------------------------

    let price = 0;

    if (
      variantDiscountPrice > 0
    ) {
      price =
        variantDiscountPrice;
    } else if (
      itemDiscountPrice > 0
    ) {
      price =
        itemDiscountPrice;
    } else if (
      productDiscountPrice > 0
    ) {
      price =
        productDiscountPrice;
    } else if (
      variantRegularPrice > 0
    ) {
      price =
        variantRegularPrice;
    } else if (
      productRegularPrice > 0
    ) {
      price =
        productRegularPrice;
    } else {
      price = itemPrice;
    }

    // -------------------------------------------------------
    // ORIGINAL PRICE
    // -------------------------------------------------------

    let originalPrice = 0;

    if (
      variantRegularPrice > price &&
      variantRegularPrice > 0
    ) {
      originalPrice =
        variantRegularPrice;
    } else if (
      productRegularPrice > price &&
      productRegularPrice > 0
    ) {
      originalPrice =
        productRegularPrice;
    } else if (
      itemPrice > price &&
      itemPrice > 0
    ) {
      originalPrice =
        itemPrice;
    }

    // -------------------------------------------------------
    // DISCOUNT CHECK
    // -------------------------------------------------------

    const hasDiscount =
      originalPrice > price &&
      price > 0;

    // -------------------------------------------------------
    // DISCOUNT PERCENTAGE
    // -------------------------------------------------------

    const discountPercentage =
      hasDiscount
        ? Math.round(
            ((originalPrice - price) /
              originalPrice) *
              100
          )
        : 0;

    return {
      product,
      variant,
      price,
      originalPrice,
      hasDiscount,
      discountPercentage,
    };
  };

  // =========================================================
  // SUBTOTAL
  // =========================================================

  const subtotal = useMemo(() => {
    return items.reduce(
      (
        sum: number,
        item: any
      ) => {
        const pricing =
          getItemPricing(item);

        const quantity =
          Number(item?.quantity) || 0;

        return (
          sum +
          pricing.price *
            quantity
        );
      },
      0
    );
  }, [items]);

  // =========================================================
  // ORIGINAL SUBTOTAL
  // =========================================================

  const originalSubtotal =
    useMemo(() => {
      return items.reduce(
        (
          sum: number,
          item: any
        ) => {
          const pricing =
            getItemPricing(item);

          const quantity =
            Number(item?.quantity) || 0;

          const basePrice =
            pricing.hasDiscount
              ? pricing.originalPrice
              : pricing.price;

          return (
            sum +
            basePrice *
              quantity
          );
        },
        0
      );
    }, [items]);

  // =========================================================
  // TOTAL SAVINGS
  // =========================================================

  const totalSavings =
    Math.max(
      0,
      originalSubtotal -
        subtotal
    );

  // =========================================================
  // CLOSE IF NOT OPEN
  // =========================================================

  if (!open) {
    return null;
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* ===================================================== */}
      {/* OVERLAY */}
      {/* ===================================================== */}

      <div
        onClick={onClose}
        className="
          fixed
          inset-0
          z-[60]
          bg-black/50
          backdrop-blur-[3px]
          animate-in
          fade-in
          duration-200
        "
      />

      {/* ===================================================== */}
      {/* DRAWER */}
      {/* ===================================================== */}

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        className="
          fixed
          right-0
          top-0
          z-[70]
          flex
          h-[100dvh]
          w-full
          max-w-[460px]
          flex-col
          overflow-hidden
          bg-white
          shadow-2xl
          animate-in
          slide-in-from-right
          duration-300
        "
      >

        {/* =================================================== */}
        {/* HEADER */}
        {/* =================================================== */}

        <div
          className="
            shrink-0
            border-b
            border-zinc-200
            bg-white
            px-5
            py-4
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            {/* TITLE */}

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-zinc-900
                  text-white
                "
              >
                <ShoppingBag
                  size={19}
                />
              </div>

              <div>

                <h2
                  className="
                    text-base
                    font-black
                    tracking-tight
                    text-zinc-950
                  "
                >
                  Shopping Cart
                </h2>

                <p
                  className="
                    mt-0.5
                    text-xs
                    font-medium
                    text-zinc-500
                  "
                >
                  {totalItems || 0}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}{" "}
                  in your cart
                </p>

              </div>

            </div>

            {/* CLOSE */}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close cart"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-zinc-200
                text-zinc-500
                transition
                hover:bg-zinc-100
                hover:text-zinc-900
              "
            >
              <X size={19} />
            </button>

          </div>

        </div>

        {/* =================================================== */}
        {/* CART ITEMS */}
        {/* =================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            bg-zinc-50/70
            px-4
            py-4
            sm:px-5
          "
        >

          {/* ================================================= */}
          {/* EMPTY CART */}
          {/* ================================================= */}

          {items.length === 0 ? (

            <div
              className="
                flex
                h-full
                min-h-[500px]
                flex-col
                items-center
                justify-center
                px-6
                text-center
              "
            >

              <div
                className="
                  flex
                  h-24
                  w-24
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  shadow-sm
                  ring-1
                  ring-zinc-200
                "
              >
                <ShoppingBag
                  size={38}
                  className="text-zinc-400"
                />
              </div>

              <h3
                className="
                  mt-6
                  text-lg
                  font-black
                  text-zinc-950
                "
              >
                Your cart is empty
              </h3>

              <p
                className="
                  mt-2
                  max-w-xs
                  text-sm
                  leading-6
                  text-zinc-500
                "
              >
                Looks like you haven't
                added anything to your
                cart yet.
              </p>

              <Link
                href="/shop"
                onClick={onClose}
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-zinc-900
                  px-6
                  py-3
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-zinc-800
                "
              >
                Start Shopping

                <ArrowRight
                  size={16}
                />
              </Link>

            </div>

          ) : (

            <div className="space-y-3">

              {/* ================================================= */}
              {/* ITEMS */}
              {/* ================================================= */}

              {items.map(
                (
                  item: any,
                  index: number
                ) => {

                  const pricing =
                    getItemPricing(
                      item
                    );

                  const product =
                    pricing.product;

                  const variant =
                    pricing.variant;

                  const productId =
                    typeof item?.product ===
                    "string"
                      ? item.product
                      : product?._id ||
                        product?.id ||
                        item?.productId ||
                        "";

                  const quantity =
                    Number(
                      item?.quantity
                    ) || 1;

                  const stock =
                    item?.stock ??
                    variant?.stock ??
                    product?.stock ??
                    999;

                  // ------------------------------------------------
                  // SIZE / STORAGE
                  // ------------------------------------------------

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
                    "";

                  // ------------------------------------------------
                  // COLOR
                  // ------------------------------------------------

                  const selectedColor =
                    item?.selectedColor ||
                    item?.color ||
                    item?.variantColor ||
                    variant?.color ||
                    variant?.colour ||
                    "";

                  // ------------------------------------------------
                  // COLOR HEX
                  // ------------------------------------------------

                  const colorHex =
                    item?.colorHex ||
                    variant?.colorHex ||
                    variant?.color?.hex ||
                    variant?.color?.code ||
                    "";

                  // ------------------------------------------------
                  // IMAGE
                  // ------------------------------------------------

                  const image =
                    variant?.image?.url ||
                    variant?.image ||
                    item?.image?.url ||
                    item?.image ||
                    product?.images?.[0]
                      ?.url ||
                    product?.images?.[0] ||
                    "/placeholder.png";

                  // ------------------------------------------------
                  // ITEM TOTAL
                  // ------------------------------------------------

                  const itemTotal =
                    pricing.price *
                    quantity;

                  return (

                    <div
                      key={
                        item?._id ||
                        `${productId}-${index}`
                      }
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

                      {/* ================================================= */}
                      {/* TOP */}
                      {/* ================================================= */}

                      <div
                        className="
                          flex
                          gap-3
                        "
                      >

                        {/* IMAGE */}

                        <Link
                          href={
                            product?._id
                              ? `/products/${product._id}`
                              : "/shop"
                          }
                          onClick={onClose}
                          className="
                            relative
                            h-20
                            w-20
                            shrink-0
                            overflow-hidden
                            rounded-xl
                            bg-zinc-100
                            ring-1
                            ring-zinc-200
                          "
                        >

                          <Image
                            src={image}
                            alt={
                              product?.name ||
                              "Product"
                            }
                            fill
                            sizes="80px"
                            className="
                              object-cover
                              transition
                              duration-300
                              hover:scale-105
                            "
                          />

                          {/* DISCOUNT BADGE */}

                          {pricing.hasDiscount && (
                            <span
                              className="
                                absolute
                                left-1.5
                                top-1.5
                                rounded-md
                                bg-red-500
                                px-1.5
                                py-0.5
                                text-[9px]
                                font-black
                                text-white
                              "
                            >
                              -{pricing.discountPercentage}%
                            </span>
                          )}

                        </Link>

                        {/* INFO */}

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >

                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-2
                            "
                          >

                            <Link
                              href={
                                product?._id
                                  ? `/products/${product._id}`
                                  : "/shop"
                              }
                              onClick={onClose}
                              className="
                                line-clamp-2
                                text-sm
                                font-bold
                                leading-5
                                text-zinc-900
                                hover:text-zinc-600
                              "
                            >
                              {product?.name ||
                                item?.name ||
                                "Product"}
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                productId &&
                                removeItem(
                                  productId
                                )
                              }
                              aria-label="Remove item"
                              className="
                                shrink-0
                                rounded-lg
                                p-1
                                text-zinc-400
                                transition
                                hover:bg-red-50
                                hover:text-red-500
                              "
                            >
                              <Trash2
                                size={16}
                              />
                            </button>

                          </div>

                          {/* VARIANTS */}

                          {(selectedSize ||
                            selectedColor) && (

                            <div
                              className="
                                mt-2
                                flex
                                flex-wrap
                                gap-1.5
                              "
                            >

                              {selectedSize && (
                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1
                                    rounded-md
                                    bg-zinc-100
                                    px-2
                                    py-1
                                    text-[10px]
                                    font-semibold
                                    text-zinc-600
                                  "
                                >
                                  <Package
                                    size={10}
                                  />

                                  {selectedSize}
                                </span>
                              )}

                              {selectedColor && (
                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1
                                    rounded-md
                                    bg-zinc-100
                                    px-2
                                    py-1
                                    text-[10px]
                                    font-semibold
                                    text-zinc-600
                                  "
                                >

                                  <span
                                    className="
                                      h-2.5
                                      w-2.5
                                      rounded-full
                                      border
                                      border-zinc-300
                                    "
                                    style={{
                                      backgroundColor:
                                        colorHex ||
                                        String(
                                          selectedColor
                                        ).toLowerCase(),
                                    }}
                                  />

                                  {selectedColor}

                                </span>
                              )}

                            </div>

                          )}

                          {/* PRICE */}

                          <div
                            className="
                              mt-2
                              flex
                              flex-wrap
                              items-center
                              gap-2
                            "
                          >

                            <span
                              className="
                                text-sm
                                font-black
                                text-zinc-950
                              "
                            >
                              {formatPrice(
                                pricing.price
                              )}
                            </span>

                            {pricing.hasDiscount && (
                              <span
                                className="
                                  text-[11px]
                                  font-medium
                                  text-zinc-400
                                  line-through
                                "
                              >
                                {formatPrice(
                                  pricing.originalPrice
                                )}
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                      {/* ================================================= */}
                      {/* BOTTOM */}
                      {/* ================================================= */}

                      <div
                        className="
                          mt-4
                          flex
                          items-center
                          justify-between
                          border-t
                          border-zinc-100
                          pt-3
                        "
                      >

                        {/* QUANTITY */}

                        <div
                          className="
                            flex
                            items-center
                            overflow-hidden
                            rounded-full
                            border
                            border-zinc-200
                            bg-zinc-50
                          "
                        >

                          <button
                            type="button"
                            onClick={() => {
                              if (
                                !productId
                              ) {
                                return;
                              }

                              if (
                                quantity <=
                                1
                              ) {
                                removeItem(
                                  productId
                                );
                                return;
                              }

                              updateItem(
                                productId,
                                quantity -
                                  1
                              );
                            }}
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              text-zinc-600
                              transition
                              hover:bg-white
                              hover:text-zinc-950
                            "
                            aria-label="Decrease quantity"
                          >
                            <Minus
                              size={13}
                            />
                          </button>

                          <span
                            className="
                              min-w-[30px]
                              text-center
                              text-xs
                              font-black
                              text-zinc-900
                            "
                          >
                            {quantity}
                          </span>

                          <button
                            type="button"
                            disabled={
                              Number(stock) >
                                0 &&
                              quantity >=
                                Number(
                                  stock
                                )
                            }
                            onClick={() => {
                              if (
                                !productId
                              ) {
                                return;
                              }

                              if (
                                Number(
                                  stock
                                ) >
                                  0 &&
                                quantity >=
                                  Number(
                                    stock
                                  )
                              ) {
                                return;
                              }

                              updateItem(
                                productId,
                                quantity +
                                  1
                              );
                            }}
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              text-zinc-600
                              transition
                              hover:bg-white
                              hover:text-zinc-950
                              disabled:cursor-not-allowed
                              disabled:opacity-30
                            "
                            aria-label="Increase quantity"
                          >
                            <Plus
                              size={13}
                            />
                          </button>

                        </div>

                        {/* TOTAL */}

                        <div className="text-right">

                          <p
                            className="
                              text-[10px]
                              font-medium
                              uppercase
                              tracking-wider
                              text-zinc-400
                            "
                          >
                            Item Total
                          </p>

                          <p
                            className="
                              text-sm
                              font-black
                              text-zinc-950
                            "
                          >
                            {formatPrice(
                              itemTotal
                            )}
                          </p>

                        </div>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </div>

        {/* =================================================== */}
        {/* FOOTER */}
        {/* =================================================== */}

        {items.length > 0 && (

          <div
            className="
              shrink-0
              border-t
              border-zinc-200
              bg-white
              px-5
              pb-5
              pt-4
            "
          >

            {/* SAVINGS */}

            {totalSavings > 0 && (
              <div
                className="
                  mb-3
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  bg-emerald-50
                  px-3
                  py-2.5
                  text-xs
                  font-bold
                  text-emerald-700
                "
              >

                <span
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Tag size={14} />

                  You're saving
                </span>

                <span>
                  {formatPrice(
                    totalSavings
                  )}
                </span>

              </div>
            )}

            {/* SUBTOTAL */}

            <div
              className="
                space-y-2
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  text-sm
                "
              >

                <span
                  className="
                    text-zinc-500
                  "
                >
                  Subtotal
                </span>

                <span
                  className="
                    font-bold
                    text-zinc-900
                  "
                >
                  {formatPrice(
                    subtotal
                  )}
                </span>

              </div>

              <div
                className="
                  flex
                  items-center
                  justify-between
                  text-xs
                "
              >

                <span
                  className="
                    text-zinc-400
                  "
                >
                  Delivery
                </span>

                <span
                  className="
                    font-semibold
                    text-zinc-500
                  "
                >
                  Calculated at checkout
                </span>

              </div>

              <div
                className="
                  my-3
                  border-t
                  border-dashed
                  border-zinc-200
                "
              />

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-sm
                      font-black
                      text-zinc-950
                    "
                  >
                    Estimated Total
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      text-zinc-400
                    "
                  >
                    Taxes & delivery
                    calculated at checkout
                  </p>

                </div>

                <span
                  className="
                    text-xl
                    font-black
                    tracking-tight
                    text-zinc-950
                  "
                >
                  {formatPrice(
                    subtotal
                  )}
                </span>

              </div>

            </div>

            {/* VIEW CART */}

            <Link
              href="/cart"
              onClick={onClose}
              className="
                mt-4
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-zinc-900
                py-3.5
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-zinc-800
                active:scale-[0.99]
              "
            >
              View Cart

              <ArrowRight
                size={17}
              />
            </Link>

            {/* CHECKOUT */}

            <Link
              href="/checkout"
              onClick={onClose}
              className="
                mt-2
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-zinc-200
                bg-white
                py-3.5
                text-sm
                font-bold
                text-zinc-900
                transition
                hover:bg-zinc-50
              "
            >
              Secure Checkout

              <ChevronRight
                size={16}
              />
            </Link>

            {/* TRUST */}

            <div
              className="
                mt-4
                flex
                items-center
                justify-center
                gap-2
                text-[10px]
                font-medium
                text-zinc-400
              "
            >

              <ShieldCheck
                size={13}
                className="text-emerald-600"
              />

              Secure & encrypted
              checkout

            </div>

          </div>

        )}

      </aside>
    </>
  );
}