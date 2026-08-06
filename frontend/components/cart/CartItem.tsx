"use client";

import Image from "next/image";

import {
  Minus,
  Plus,
  Trash2,
  Heart,
  Truck,
  CheckCircle2,
} from "lucide-react";

import useCart from "@/hooks/useCart";

import {
  useWishlist
} from "@/context/WishlistContext";

import {
  useCurrency
} from "@/context/CurrencyContext";

type Props = {
  item: any;
};

export default function CartItem({
  item
}: Props) {

  const {
    updateItem,
    removeItem
  } = useCart();

  const {
    addToWishlist,
    isInWishlist
  } = useWishlist();

  const {
    formatPrice
  } = useCurrency();

  // =======================
  // PRODUCT (Fixed ID extraction)
  // =======================
  const product =
    typeof item?.product === "object" && item?.product !== null ? item.product : {};

  const productId =
    typeof item?.product === "string"
      ? item.product
      : item?.product?._id?.toString() || product?._id?.toString() || item?.product;

  const name =
    product?.name ||
    "Product";

  const stock =
    product?.stock ??
    999;

  const price =
    Number(
      item?.price ||
      product?.discountPrice ||
      product?.price ||
      0
    );

  const total =
    price *
    Number(item?.quantity || 1);

  const image =
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    "/placeholder.png";

  // =======================
  // REMOVE HELPER (LocalStorage Sync)
  // =======================
  const handleRemoveItem = async () => {
    // লোকালস্টোরেজে রিমুভ করা প্রোডাক্ট সেভ করা
    localStorage.setItem(
      "last_removed_cart_item",
      JSON.stringify({
        productId,
        name,
        image,
        status: "Item removed from cart",
      })
    );

    // কার্ট পেজকে ইনস্ট্যান্ট আপডেট করার জন্য ইভেন্ট ফায়ার করা
    window.dispatchEvent(new Event("cartItemRemoved"));

    // মূল রিমুভ ফাংশন কল করা
    await removeItem(productId);
  };

  // =======================
  // PLUS
  // =======================
  const increase = async () => {
    if (
      stock &&
      item.quantity >= stock
    ) {
      return;
    }

    await updateItem(
      productId,
      item.quantity + 1
    );
  };

  // =======================
  // MINUS
  // =======================
  const decrease = async () => {
    if (
      item.quantity <= 1
    ) {
      await handleRemoveItem();
      return;
    }

    await updateItem(
      productId,
      item.quantity - 1
    );
  };

  // =======================
  // WISHLIST
  // =======================
  const saveWishlist = () => {
    if (
      !isInWishlist(productId)
    ) {
      addToWishlist({
        _id: productId,
        name,
        price,
        image
      });
    }
  };

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
        {/* IMAGE */}
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
            className="
              object-cover
            "
          />

          {
            product?.discountPrice &&
            (
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
            )
          }
        </div>

        {/* DETAILS */}
        <div
          className="
            flex-1
          "
        >
          <div
            className="
              flex
              justify-between
              gap-3
            "
          >
            <div>
              <h3
                className="
                  font-bold
                  line-clamp-2
                "
              >
                {name}
              </h3>

              <p
                className="
                  mt-1
                  text-xl
                  font-black
                "
              >
                {formatPrice(price)}
              </p>
            </div>

            <button
              onClick={handleRemoveItem}
              className="
                text-gray-400
                hover:text-red-500
              "
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* STOCK */}
          <div className="mt-2">
            {
              stock > 0 ?
                (
                  <p
                    className="
                      flex
                      items-center
                      gap-1
                      text-sm
                      text-green-600
                    "
                  >
                    <CheckCircle2 size={15} />
                    In Stock
                  </p>
                )
                :
                (
                  <p
                    className="
                      text-sm
                      text-red-500
                    "
                  >
                    Out of stock
                  </p>
                )
            }
          </div>

          {/* DELIVERY */}
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

          {/* ACTION */}
          <div
            className="
              mt-5
              flex
              items-center
              justify-between
            "
          >
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
                onClick={decrease}
                className="
                  h-9
                  w-9
                  flex
                  items-center
                  justify-center
                  hover:bg-gray-100
                "
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
                {item.quantity}
              </span>

              <button
                onClick={increase}
                disabled={
                  stock &&
                  item.quantity >= stock
                }
                className="
                  h-9
                  w-9
                  flex
                  items-center
                  justify-center
                  hover:bg-gray-100
                  disabled:opacity-30
                "
              >
                <Plus size={15} />
              </button>
            </div>

            <div
              className="
                text-right
              "
            >
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
                "
              >
                {formatPrice(total)}
              </p>
            </div>
          </div>

          {/* BOTTOM */}
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
              onClick={saveWishlist}
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
              "
            >
              <Heart size={16} />
              Save
            </button>

            <button
              onClick={handleRemoveItem}
              className="
                rounded-xl
                px-4
                py-2
                text-sm
                font-medium
                text-red-500
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
