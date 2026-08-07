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
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Award,
} from "lucide-react";
import { useState, useEffect } from "react";
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

  // Deep fallback to catch variants from any admin schema or properties
  const rawVariants = 
    product.variants || 
    (product as any).itemVariants || 
    (product as any).productVariants || 
    (product as any).options || 
    (product as any).attributes || 
    (product as any).sizes ||
    [];

  // Normalize variants to always be an array
  const variantsList = Array.isArray(rawVariants) 
    ? rawVariants 
    : (rawVariants && typeof rawVariants === "object" ? Object.values(rawVariants) : []);

  // Extract unique sizes safely covering all schemas (Duplicate prevention via Set)
  const availableSizes = Array.from(
    new Set(
      variantsList.flatMap((v: any) => {
        if (!v) return [];
        if (typeof v === "string") return [v];
        const val = 
          v.size ||
          (v.name && String(v.name).toLowerCase().includes("size") ? v.value : null) ||
          v.attributes?.size ||
          v.options?.find((o: any) => o.name?.toLowerCase() === "size")?.value ||
          (typeof v.name === "string" && !v.color ? v.name : null) ||
          v.title;
        return val ? [String(val).trim()] : [];
      }).filter(Boolean)
    )
  );

  // Extract unique colors safely covering all schemas (Duplicate prevention via Set)
  const availableColors = Array.from(
    new Set(
      variantsList.flatMap((v: any) => {
        if (!v || typeof v === "string") return [];
        const val = 
          v.color ||
          (v.name && String(v.name).toLowerCase().includes("color") ? v.value : null) ||
          v.attributes?.color ||
          v.options?.find((o: any) => o.name?.toLowerCase() === "color")?.value;
        return val ? [String(val).trim()] : [];
      }).filter(Boolean)
    )
  );

  const [selectedSize, setSelectedSize] = useState<string>(
    (availableSizes[0] as string) || (product as any).size || ""
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    (availableColors[0] as string) || (product as any).color || ""
  );

  useEffect(() => {
    if (!selectedSize && availableSizes.length > 0) {
      setSelectedSize(availableSizes[0] as string);
    }
    if (!selectedColor && availableColors.length > 0) {
      setSelectedColor(availableColors[0] as string);
    }
  }, [availableSizes, availableColors]);

  const selectedVariant = variantsList.find((v: any) => {
    if (!v) return false;
    if (typeof v === "string") return v === selectedSize;

    const vSize =
      v.size ||
      v.attributes?.size ||
      v.options?.find((o: any) => o.name?.toLowerCase() === "size")?.value ||
      (typeof v.name === "string" && !v.color ? v.name : null) ||
      v.title;
    
    const vColor =
      v.color ||
      v.attributes?.color ||
      v.options?.find((o: any) => o.name?.toLowerCase() === "color")?.value;

    const matchSize = !selectedSize || String(vSize)?.trim().toLowerCase() === String(selectedSize)?.trim().toLowerCase();
    const matchColor = !selectedColor || String(vColor)?.trim().toLowerCase() === String(selectedColor)?.trim().toLowerCase();
    
    if (selectedSize && selectedColor) {
      return matchSize && matchColor;
    }
    return matchSize || matchColor;
  });

  const totalVariantStock = variantsList.reduce(
    (acc: number, v: any) => acc + Number(v?.stock || v?.quantity || 0),
    0
  );

  const currentStock = Number(
    selectedVariant?.stock !== undefined
      ? selectedVariant.stock
      : selectedVariant?.quantity !== undefined
      ? selectedVariant.quantity
      : (product as any).stock !== undefined
      ? (product as any).stock
      : product.inventory?.stock !== undefined
      ? product.inventory.stock
      : variantsList.length && totalVariantStock > 0
      ? totalVariantStock
      : 10
  );

  const basePrice = Number(
    selectedVariant?.price && Number(selectedVariant.price) > 0
      ? selectedVariant.price
      : (product as any).price && Number((product as any).price) > 0
      ? (product as any).price
      : product.pricing?.price || 0
  );

  const currentPrice = basePrice;

  const discountPrice = Number(
    selectedVariant?.discountPrice && Number(selectedVariant.discountPrice) > 0
      ? selectedVariant.discountPrice
      : (product as any).discountPrice && Number((product as any).discountPrice) > 0
      ? (product as any).discountPrice
      : product.pricing?.discountPrice || 0
  );

  const [copied, setCopied] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const lowStockThreshold = product.inventory?.lowStockThreshold || 5;

  const discountPercentage =
    discountPrice && discountPrice < currentPrice
      ? Math.round(((currentPrice - discountPrice) / currentPrice) * 100)
      : 0;

  const salePrice =
    discountPrice && discountPrice > 0
      ? discountPrice
      : currentPrice;

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      const productWithSelections = {
        ...product,
        price: salePrice,
        selectedVariantSKU: selectedVariant?.sku || product.sku,
      };
      await addItem({
        ...productWithSelections,
        selectedSize,
        selectedColor,
      }, quantity);
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
        price: salePrice,
        selectedVariantSKU: selectedVariant?.sku || product.sku,
      };
      await addItem({
        ...productWithSelections,
        selectedSize,
        selectedColor,
      }, quantity);
      router.push("/checkout");
    } catch (error) {
      console.log(error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryName: string =
    typeof product.category === "object" && product.category !== null
      ? (product.category as any).name || "General"
      : typeof product.category === "string"
      ? product.category
      : "General";

  const specsList = product.specifications || [];
  const displayedSpecs = showAllSpecs ? specsList : specsList.slice(0, 4);

  // Single Clean Description Source (Prevents duplicate rendering)
  const productDescription = product.description || (product as any).details || "";

  return (
    <div className="space-y-6">
      {/* BADGES */}
      <div className="flex gap-2.5 flex-wrap">
        {product.flags?.isBestSeller && (
          <span className="bg-zinc-900 text-white px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-xs">
            <BadgeCheck size={15} className="text-amber-400" />
            Best Seller
          </span>
        )}

        {product.flags?.isNewArrival && (
          <span className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-xs">
            <Sparkles size={15} />
            New Arrival
          </span>
        )}

        <span className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium border ${currentStock > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
          {currentStock > 0 ? <PackageCheck size={14} /> : <AlertCircle size={14} />}
          {currentStock > 0 ? `In Stock (${currentStock} available)` : "Out of Stock"}
        </span>

        {currentStock > 0 && currentStock <= lowStockThreshold && (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold animate-pulse">
            <AlertCircle size={14} />
            Only {currentStock} left in stock!
          </span>
        )}
      </div>

      {/* TITLE & ACTIONS */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {product.brand && (
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Brand: <span className="text-zinc-800">{product.brand}</span>
            </p>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            {product.name}
          </h1>
        </div>

        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`border rounded-full p-3 transition cursor-pointer shadow-2xs ${isWishlisted ? "bg-rose-50 border-rose-200 text-rose-600" : "border-zinc-200 hover:border-black hover:bg-zinc-50 text-zinc-700"}`}
            aria-label="Wishlist"
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={handleShare}
            className="border border-zinc-200 rounded-full p-3 hover:border-black hover:bg-zinc-50 transition cursor-pointer text-zinc-700 shadow-2xs"
            aria-label="Share"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={handleCopyLink}
            className="border border-zinc-200 rounded-full p-3 hover:border-black hover:bg-zinc-50 transition cursor-pointer text-zinc-700 shadow-2xs relative"
            aria-label="Copy Product Link"
            title="Copy Link"
          >
            {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
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
              fill={i <= Math.round(product.ratingsAverage || 0) ? "currentColor" : "none"}
              className={i <= Math.round(product.ratingsAverage || 0) ? "" : "text-zinc-300"}
            />
          ))}
        </div>
        <span className="text-xs sm:text-sm font-medium text-zinc-600">
          <strong className="text-zinc-900">{product.ratingsAverage || 0}</strong> ({product.ratingsQuantity || 0} Customer Reviews)
        </span>
      </div>

      {/* PRICE SECTION */}
      <div className="flex flex-col gap-2 bg-zinc-50 border border-zinc-200/80 p-4 rounded-2xl">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900">
            {formatPrice(salePrice)}
          </h2>

          {discountPrice && discountPrice > 0 && (
            <div className="flex items-center gap-2">
              <span className="line-through text-zinc-400 text-lg font-medium">
                {formatPrice(currentPrice)}
              </span>
              <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2.5 py-1 rounded-lg">
                -{discountPercentage}% OFF
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-zinc-200/60 flex-wrap gap-2">
          {discountPrice && discountPrice > 0 && (
            <span className="text-emerald-600 font-semibold">
              You Save: {formatPrice(currentPrice - salePrice)} ({discountPercentage}%)
            </span>
          )}
          <span className="text-zinc-500">Tax Included</span>
        </div>
      </div>

      {/* SIZE SELECTION */}
      {availableSizes.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900">
              Select Size: <span className="font-normal text-zinc-600">{selectedSize}</span>
            </h3>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {availableSizes.map((size: any) => (
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
      {availableColors.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900">
              Select Color: <span className="font-normal text-zinc-600">{selectedColor}</span>
            </h3>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {availableColors.map((color: any) => (
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
              disabled={quantity >= currentStock}
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
            disabled={adding || currentStock === 0}
            onClick={handleAddToCart}
            className="flex-1 bg-zinc-900 hover:bg-black text-white rounded-2xl py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-md hover:scale-[1.01]"
          >
            <ShoppingCart size={18} />
            {currentStock === 0
              ? "Out Of Stock"
              : adding
              ? "Adding to Cart..."
              : "Add To Cart"}
          </button>

          <button
            disabled={currentStock === 0}
            onClick={buyNow}
            className="flex-1 border-2 border-zinc-900 hover:bg-zinc-900 hover:text-white text-zinc-900 rounded-2xl py-4 px-6 font-bold text-sm transition cursor-pointer disabled:opacity-50 text-center shadow-2xs hover:scale-[1.01]"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* SINGLE UNIQUE DESCRIPTION */}
      {productDescription && (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
          <h3 className="font-bold text-base text-zinc-900">Description</h3>
          <div className={`text-zinc-600 text-xs sm:text-sm leading-relaxed ${!isDescExpanded ? "line-clamp-3" : ""}`}>
            <p>{productDescription}</p>
          </div>
          {productDescription.length > 150 && (
            <button
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="text-xs font-bold text-black underline cursor-pointer pt-1"
            >
              {isDescExpanded ? "Show Less" : "Read More"}
            </button>
          )}
        </div>
      )}

      {/* SPECIFICATIONS */}
      {specsList.length > 0 && (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
          <button
            onClick={() => setIsSpecsOpen(!isSpecsOpen)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-zinc-900">Specifications</h3>
              <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-medium">
                {specsList.length} items
              </span>
            </div>
            <div className="p-1 rounded-full hover:bg-zinc-100 transition text-zinc-700">
              {isSpecsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </button>

          {isSpecsOpen && (
            <div className="space-y-3 pt-2 border-t border-zinc-100 animate-fadeIn">
              <div className="divide-y divide-zinc-100 overflow-hidden">
                {displayedSpecs.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between py-2.5 text-xs sm:text-sm">
                    <span className="text-zinc-500 font-medium">{item.key}</span>
                    <span className="font-semibold text-zinc-800 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
              {specsList.length > 4 && (
                <button
                  onClick={() => setShowAllSpecs(!showAllSpecs)}
                  className="w-full mt-2 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {showAllSpecs ? (
                    <>Show Less <ChevronUp size={14} /></>
                  ) : (
                    <>Show More Specifications <ChevronDown size={14} /></>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* PRODUCT META INFO */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Info title="Stock Status" value={`${currentStock} units`} />
        <Info title="Category" value={categoryName} />
        {product.sku && <Info title="SKU" value={product.sku} />}
        {product.brand && <Info title="Brand" value={product.brand} />}
        {(product as any).weight !== undefined && Number((product as any).weight) > 0 && (
          <Info title="Weight" value={`${(product as any).weight} kg`} />
        )}
      </div>

      {/* TRUST & SERVICE SECTION */}
      <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 space-y-3 text-xs sm:text-sm font-medium text-zinc-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3">
            <Truck size={18} className="text-zinc-900 shrink-0" />
            <div>
              <p className="font-bold text-zinc-900">Estimated Delivery</p>
              <p className="text-xs text-zinc-500">3-5 Business Days</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="text-zinc-900 shrink-0" />
            <div>
              <p className="font-bold text-zinc-900">Return & Replacement</p>
              <p className="text-xs text-zinc-500">7 Days Easy Return Policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-zinc-900 shrink-0" />
            <div>
              <p className="font-bold text-zinc-900">Secure Checkout</p>
              <p className="text-xs text-zinc-500">Cash on Delivery Available</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Award size={18} className="text-zinc-900 shrink-0" />
            <div>
              <p className="font-bold text-zinc-900">Original Product</p>
              <p className="text-xs text-zinc-500">100% Authentic Guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ title, value }: { title: string; value: any }) {
  const displayValue = 
    typeof value === "object" && value !== null 
      ? JSON.stringify(value) 
      : String(value ?? "N/A");

  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 shadow-2xs">
      <p className="text-zinc-400 text-[11px] font-medium uppercase tracking-wider">{title}</p>
      <p className="font-bold text-zinc-800 text-xs sm:text-sm mt-0.5 truncate">{displayValue}</p>
    </div>
  );
}
