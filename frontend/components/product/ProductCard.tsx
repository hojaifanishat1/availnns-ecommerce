"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Plus,
  Minus,
  Star,
  Eye,
  AlertTriangle,
  FolderTree,
  Zap,
  Truck,
  Trash2,
} from "lucide-react";
import { Product } from "@/types/product";
import useCart from "@/hooks/useCart";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  freeDeliveryThreshold?: number;
}

export default function ProductCard({
  product,
  onQuickView,
  freeDeliveryThreshold = 1000,
}: ProductCardProps) {
  // Type assertion to handle backend product schema fields safely
  const p = product as any;

  const { cart, addItem, updateItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  const [hoverImage, setHoverImage] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const isWishlisted = isInWishlist(p._id);

  const primaryImage = p.images?.[0]?.url || "/placeholder.png";
  const secondaryImage = p.images?.[1]?.url || primaryImage;

  // Safe stock calculation from root or inventory object or variants
  const totalVariantStock = p.variants?.reduce(
    (acc: number, v: any) => acc + Number(v.stock || 0),
    0
  );

  const stock = Number(
    p.stock !== undefined
      ? p.stock
      : p.inventory?.stock !== undefined
      ? p.inventory.stock
      : p.variants?.length > 0
      ? totalVariantStock
      : 0
  );

  const cartItem = cart?.items?.find((item: any) => {
    const itemProduct = item.product || {};
    const itemProductId =
      typeof itemProduct === "string"
        ? itemProduct
        : itemProduct._id?.toString() || itemProduct.id?.toString();

    return itemProductId === p._id?.toString();
  });

  const quantity = Number(cartItem?.quantity || 0);

  const regularPrice = p.price || p.pricing?.price || 0;
  const salePrice =
    p.discountPrice ||
    p.oldPrice ||
    p.compareAtPrice ||
    p.pricing?.discountPrice;

  const discountPercentage =
    salePrice && salePrice < regularPrice
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
      : 0;

  const handleIncreaseCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity >= stock) return;
    await addItem(product, 1);
  };

  const handleDecreaseCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity <= 1) {
      await updateItem(p._id, 0);
      return;
    }
    await updateItem(p._id, quantity - 1);
  };

  const rating = p.rating || p.ratingsAverage || 0;
  const numReviews = p.numReviews || p.ratingsQuantity || 0;

  const categoryName =
    typeof p.category === "string"
      ? p.category
      : p.category?.name || "General";

  // Base Slide Items
  const baseSlideItems = useMemo(() => {
    const items = [];

    if (stock > 0 && stock <= 5) {
      items.push({
        icon: <AlertTriangle size={13} className="text-amber-500 shrink-0" />,
        text: `Hurry! Only ${stock} items left`,
        textColor: "text-amber-600 font-medium",
      });
    }

    items.push({
      icon: <FolderTree size={13} className="text-blue-500 shrink-0" />,
      text: `Category: ${categoryName}`,
      textColor: "text-zinc-600 font-medium",
    });

    if (discountPercentage >= 25) {
      items.push({
        icon: <Zap size={13} className="text-rose-500 shrink-0 fill-rose-500" />,
        text: `Mega Deals - ${discountPercentage}% OFF`,
        textColor: "text-rose-600 font-bold",
      });
    }

    items.push({
      icon: <Truck size={13} className="text-emerald-500 shrink-0" />,
      text: `Free Delivery over ${formatPrice(freeDeliveryThreshold)}`,
      textColor: "text-emerald-600 font-medium",
    });

    return items;
  }, [stock, categoryName, discountPercentage, freeDeliveryThreshold, formatPrice]);

  // Seamless Extended List
  const extendedSlideItems = useMemo(() => {
    if (baseSlideItems.length <= 1) return baseSlideItems;
    return [...baseSlideItems, baseSlideItems[0]];
  }, [baseSlideItems]);

  // Perfect Seamless Loop Animation Effect
  useEffect(() => {
    if (baseSlideItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        
        if (nextIndex === extendedSlideItems.length - 1) {
          setTimeout(() => {
            setIsTransitioning(false);
            setCurrentIndex(0);
            
            setTimeout(() => {
              setIsTransitioning(true);
            }, 50);
          }, 500);
        }
        
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [extendedSlideItems.length, baseSlideItems.length]);

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full">
      <div>
        {/* Image & Interactive Overlay Container */}
        <div
          className="relative h-64 w-full overflow-hidden rounded-xl bg-gray-50"
          onMouseEnter={() => setHoverImage(true)}
          onMouseLeave={() => setHoverImage(false)}
        >
          <Link href={`/products/${p._id}`} className="block h-full w-full">
            <Image
              src={hoverImage ? secondaryImage : primaryImage}
              alt={p.name || "Product image"}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
                stock === 0 ? "grayscale opacity-60" : ""
              }`}
            />
          </Link>

          {/* Product Status Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1 z-10 pointer-events-none">
            {p.isBestSeller && stock > 0 && (
              <span className="rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white shadow-xs">
                Hot
              </span>
            )}
            {stock === 0 && (
              <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white shadow-xs">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isWishlisted) {
                removeFromWishlist(p._id);
              } else {
                addToWishlist({
                  _id: p._id,
                  name: p.name,
                  price: salePrice && salePrice > 0 ? salePrice : regularPrice,
                  image: primaryImage,
                });
              }
            }}
            className="absolute right-3 top-3 rounded-full bg-white/80 p-2.5 backdrop-blur-md shadow-sm transition hover:bg-white hover:scale-110 z-20 cursor-pointer text-zinc-700"
            aria-label="Wishlist"
          >
            <Heart
              size={18}
              className={isWishlisted ? "fill-rose-500 text-rose-500" : ""}
            />
          </button>

          {/* Quick View Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onQuickView) onQuickView(product);
            }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-4 py-2 text-xs font-semibold shadow-md opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 z-20 cursor-pointer text-zinc-900 hover:bg-white"
          >
            <Eye size={14} />
            Quick View
          </button>

          {/* Cart Quantity Controller / Add Button */}
          <div className="absolute right-3 bottom-3 z-20">
            {quantity === 0 ? (
              <button
                type="button"
                disabled={stock === 0}
                onClick={handleIncreaseCart}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg transition hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md ${
                  stock === 0
                    ? "bg-gray-200/80 text-gray-400 cursor-not-allowed"
                    : "bg-white/90 text-zinc-900 hover:bg-zinc-900 hover:text-white"
                }`}
                title="Add to Cart"
              >
                <Plus size={20} />
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl bg-zinc-900/90 backdrop-blur-md px-3 py-2 text-white shadow-lg">
                <button
                  type="button"
                  onClick={handleDecreaseCart}
                  className="cursor-pointer text-zinc-300 hover:text-white transition"
                  title={quantity <= 1 ? "Remove from cart" : "Decrease quantity"}
                >
                  {quantity <= 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                </button>
                <span className="font-bold text-xs min-w-[14px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= stock}
                  onClick={handleIncreaseCart}
                  className="cursor-pointer text-zinc-300 hover:text-white transition disabled:opacity-40"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="pt-4 px-1">
          <Link href={`/products/${p._id}`}>
            <h3 className="font-semibold text-sm text-zinc-900 line-clamp-1 transition hover:text-zinc-600">
              {p.name}
            </h3>
          </Link>

          {/* Ratings and Reviews */}
          <div className="flex items-center gap-1.5 text-xs my-1.5">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star size={13} fill="currentColor" />
              <span>{rating > 0 ? rating.toFixed(1) : "0.0"}</span>
            </div>
            <span className="text-zinc-400 font-medium">({numReviews})</span>
          </div>

          {/* Price & Discount Section */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-zinc-900">
                {formatPrice(
                  salePrice && salePrice > 0 ? salePrice : regularPrice
                )}
              </span>
              {salePrice && salePrice > 0 && salePrice < regularPrice && (
                <span className="text-xs font-medium text-zinc-400 line-through">
                  {formatPrice(regularPrice)}
                </span>
              )}
            </div>

            {discountPercentage > 0 && stock > 0 && (
              <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-extrabold text-rose-600">
                -{discountPercentage}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info Slider */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 px-1 overflow-hidden h-7 relative flex items-center">
        <div
          className={`absolute left-0 right-0 top-0 flex flex-col ${
            isTransitioning ? "transition-transform duration-500 ease-in-out" : ""
          } will-change-transform`}
          style={{
            transform: `translateY(-${currentIndex * 28}px)`,
          }}
        >
          {extendedSlideItems.map((item, index) => (
            <div
              key={index}
              className="h-7 shrink-0 flex items-center gap-1.5 text-[11px]"
            >
              <span className="flex items-center justify-center shrink-0">{item.icon}</span>
              <span className={`truncate leading-none ${item.textColor}`}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
