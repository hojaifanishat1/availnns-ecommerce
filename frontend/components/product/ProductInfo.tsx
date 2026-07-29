"use client";

import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  ShieldCheck,
  BadgeCheck,
  Sparkles,
  Heart,
  Share2,
  PackageCheck,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import useCart from "@/hooks/useCart";
import { useCurrency } from "@/context/CurrencyContext";

export default function ProductInfo({
  product,
}: {
  product: Product;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || ""
  );
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || ""
  );

  const discountPercentage =
    product.discountPrice && product.discountPrice < product.price
      ? Math.round(
          ((product.price - product.discountPrice) / product.price) * 100
        )
      : 0;

  const salePrice =
    product.discountPrice && product.discountPrice > 0
      ? product.discountPrice
      : product.price;

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      // সাইজ ও কালারসহ প্রডাক্ট অবজেক্ট তৈরি করে পাস করা হচ্ছে
      const productWithSelections = {
        ...product,
        selectedSize,
        selectedColor,
      };
      await addItem(productWithSelections, quantity);
      router.push("/cart");
    } catch (error) {
      console.log(error);
    } finally {
      setAdding(false);
    }
  };

  const buyNow = async () => {
    try {
      const productWithSelections = {
        ...product,
        selectedSize,
        selectedColor,
      };
      await addItem(productWithSelections, quantity);
      router.push("/checkout");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* BADGES */}
      <div className="flex gap-2.5 flex-wrap">
        {product.isBestSeller && (
          <span className="bg-zinc-900 text-white px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-xs">
            <BadgeCheck size={15} className="text-amber-400" />
            Best Seller
          </span>
        )}

        {product.isNewArrival && (
          <span className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-xs">
            <Sparkles size={15} />
            New Arrival
          </span>
        )}

        <span className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium border ${product.stock > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
          {product.stock > 0 ? <PackageCheck size={14} /> : <AlertCircle size={14} />}
          {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
        </span>
      </div>

      {/* TITLE & ACTIONS */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">
          {product.name}
        </h1>

        <div className="flex gap-2 shrink-0">
          <button 
            className="border border-zinc-200 rounded-full p-3 hover:border-black hover:bg-zinc-50 transition cursor-pointer text-zinc-700 shadow-2xs"
            aria-label="Wishlist"
          >
            <Heart size={18} />
          </button>
          <button 
            className="border border-zinc-200 rounded-full p-3 hover:border-black hover:bg-zinc-50 transition cursor-pointer text-zinc-700 shadow-2xs"
            aria-label="Share"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* RATING */}
      <div className="flex items-center gap-3">
        <div className="flex text-amber-500">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={16}
              fill={i <= Math.round(product.rating || 0) ? "currentColor" : "none"}
              className={i <= Math.round(product.rating || 0) ? "" : "text-zinc-300"}
            />
          ))}
        </div>
        <span className="text-xs sm:text-sm font-medium text-zinc-600">
          <strong className="text-zinc-900">{product.rating || 0}</strong> ({product.numReviews || 0} Reviews)
        </span>
      </div>

      {/* PRICE */}
      <div className="flex items-center gap-3 flex-wrap bg-zinc-50 border border-zinc-200/80 p-4 rounded-2xl">
        <h2 className="text-3xl sm:text-4xl font-black text-zinc-900">
          {formatPrice(salePrice)}
        </h2>

        {product.discountPrice > 0 && (
          <div className="flex items-center gap-2">
            <span className="line-through text-zinc-400 text-lg font-medium">
              {formatPrice(product.price)}
            </span>
            <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2.5 py-1 rounded-lg">
              -{discountPercentage}% OFF
            </span>
          </div>
        )}
      </div>

      {/* SIZE SELECTION */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900">
              Select Size: <span className="font-normal text-zinc-600">{selectedSize}</span>
            </h3>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`border px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedSize === size
                    ? "bg-black text-white border-black shadow-sm scale-102"
                    : "bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* COLOR SELECTION */}
      {product.colors && product.colors.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900">
              Select Color: <span className="font-normal text-zinc-600">{selectedColor}</span>
            </h3>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`border px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedColor === color
                    ? "bg-black text-white border-black shadow-sm scale-102"
                    : "bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QUANTITY & ACTION BUTTONS */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Quantity:</span>
          <div className="flex items-center border border-zinc-200 bg-white rounded-2xl p-1 shadow-2xs">
            <button
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="border border-zinc-200 rounded-xl p-2.5 hover:bg-zinc-100 disabled:opacity-40 transition cursor-pointer text-zinc-800"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>

            <span className="font-bold text-base px-5 text-zinc-900 w-12 text-center">
              {quantity}
            </span>

            <button
              disabled={quantity >= product.stock}
              onClick={() => setQuantity((q) => q + 1)}
              className="border border-zinc-200 rounded-xl p-2.5 hover:bg-zinc-100 disabled:opacity-40 transition cursor-pointer text-zinc-800"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            disabled={adding || product.stock === 0}
            onClick={handleAddToCart}
            className="flex-1 bg-zinc-900 hover:bg-black text-white rounded-2xl py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-md hover:scale-[1.01]"
          >
            <ShoppingCart size={18} />
            {product.stock === 0
              ? "Out Of Stock"
              : adding
              ? "Adding to Cart..."
              : "Add To Cart"}
          </button>

          <button
            disabled={product.stock === 0}
            onClick={buyNow}
            className="flex-1 border-2 border-zinc-900 hover:bg-zinc-900 hover:text-white text-zinc-900 rounded-2xl py-4 px-6 font-bold text-sm transition cursor-pointer disabled:opacity-50 text-center shadow-2xs hover:scale-[1.01]"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs space-y-2">
        <h3 className="font-bold text-base text-zinc-900">Description</h3>
        <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* SPECIFICATIONS */}
      {product.specifications && product.specifications.length > 0 && (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
          <h3 className="font-bold text-base text-zinc-900">Specifications</h3>
          <div className="divide-y divide-zinc-100">
            {product.specifications.map((item, index) => (
              <div key={index} className="flex justify-between py-2 text-xs sm:text-sm">
                <span className="text-zinc-500 font-medium">{item.key}</span>
                <span className="font-semibold text-zinc-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCT META INFO */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Info title="Stock Status" value={`${product.stock} units`} />
        <Info
          title="Category"
          value={
            typeof product.category === "object" && product.category !== null
              ? product.category.name
              : "General"
          }
        />
        {product.warrantyPeriod && (
          <Info title="Warranty" value={product.warrantyPeriod} />
        )}
      </div>

      {/* SERVICE & GUARANTEES */}
      <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 space-y-3 text-xs sm:text-sm font-medium text-zinc-700">
        <div className="flex items-center gap-3">
          <Truck size={18} className="text-zinc-900" />
          <span>Fast Delivery across the country</span>
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck size={18} className="text-zinc-900" />
          <span>100% Secure Payment & Buyer Protection</span>
        </div>
        {product.freeShipping && (
          <div className="flex items-center gap-3 text-emerald-600 font-semibold">
            <span>🚚 Free Shipping Available on this item</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-2xs">
      <p className="text-zinc-400 text-[11px] font-medium uppercase tracking-wider">{title}</p>
      <p className="font-bold text-zinc-800 text-xs sm:text-sm mt-0.5 truncate">{value}</p>
    </div>
  );
}
