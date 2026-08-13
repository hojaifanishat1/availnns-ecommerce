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
  // VARIANT OBJECT
  // =========================================================

  const variant =
    item?.variant ||
    item?.selectedVariant ||
    item?.productVariant ||
    product?.selectedVariant ||
    null;

  // =========================================================
  // SELECTED VARIANT SKU
  // =========================================================

  const selectedVariantSKU =
    item?.selectedVariantSKU ||
    item?.variantSKU ||
    item?.variantSku ||
    item?.sku ||
    variant?.sku ||
    "";

  // =========================================================
  // SELECTED SIZE / RAM / STORAGE
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
        ["size", "storage", "capacity", "ram"].includes(
          String(option?.name || "").toLowerCase()
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
        ["color", "colour"].includes(
          String(option?.name || "").toLowerCase()
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
  // VARIANT DISPLAY NAME
  // =========================================================

  const variantParts = [
    selectedSize,
    selectedColor,
  ].filter(Boolean);

  const variantLabel =
    variantParts.join(" • ");

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
  // PRICE
  // =========================================================

  const price = Number(
    item?.price ??
    variant?.discountPrice ??
    variant?.price ??
    product?.discountPrice ??
    product?.price ??
    product?.pricing?.discountPrice ??
    product?.pricing?.price ??
    0
  );

  // =========================================================
  // TOTAL
  // =========================================================

  const quantity =
    Number(item?.quantity) || 1;

  const total =
    price * quantity;

  // =========================================================
  // IMAGE
  // =========================================================

  const image =
    variant?.image ||
    item?.image ||
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    "/placeholder.png";

  // =========================================================
  // REMOVE
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
          status: "Item removed from cart",
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
        bg-white
        p-4
        shadow-sm
        hover:shadow-md
        transition
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

          {(product?.discountPrice ||
            variant?.discountPrice) && (
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
              Sale
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

                  {/* SIZE / RAM / STORAGE */}

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
                          text-zinc-900
                          font-bold
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
                          text-zinc-900
                          font-bold
                          capitalize
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
                    text-[10px]
                    font-mono
                    font-semibold
                    text-zinc-400
                    break-all
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

              <p
                className="
                  mt-2
                  text-xl
                  font-black
                  text-zinc-950
                "
              >
                {formatPrice(price)}
              </p>

            </div>

            {/* REMOVE */}

            <button
              type="button"
              onClick={
                handleRemoveItem
              }
              className="
                shrink-0
                text-gray-400
                hover:text-red-500
                transition
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

            {/* QUANTITY */}

            <div
              className="
                flex
                items-center
                rounded-full
                border
                overflow-hidden
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
                  h-9
                  w-9
                  flex
                  items-center
                  justify-center
                  hover:bg-gray-100
                  disabled:opacity-30
                  transition
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
                  h-9
                  w-9
                  flex
                  items-center
                  justify-center
                  hover:bg-gray-100
                  disabled:opacity-30
                  transition
                "
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>

            </div>

            {/* TOTAL */}

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
                  font-black
                  text-lg
                  text-zinc-950
                "
              >
                {formatPrice(total)}
              </p>

            </div>

          </div>

          {/* ================================================= */}
          {/* BOTTOM ACTIONS */}
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
                hover:bg-gray-50
                transition
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
                hover:bg-red-50
                transition
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