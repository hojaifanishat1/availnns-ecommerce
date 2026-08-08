"use client";

import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
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
  Zap,
  SlidersHorizontal,
  ShieldCheck,
  Truck,
  RefreshCw,
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
  const [buyingNow, setBuyingNow] = useState(false);

  // Deep fallback to catch variants from any admin schema or properties
  const rawVariants = 
    product.variants || 
    (product as any).itemVariants || 
    (product as any).productVariants || 
    (product as any).options || 
    (product as any).attributes || 
    (product as any).sizes ||
    [];

  const variantsList = Array.isArray(rawVariants) 
    ? rawVariants 
    : (rawVariants && typeof rawVariants === "object" ? Object.values(rawVariants) : []);

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
  const [isSpecsOpen, setIsSpecsOpen] = useState(true);
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
      setBuyingNow(true);
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
    } finally {
      setBuyingNow(false);
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

  const rawSpecsList = product.specifications || [];
  const specsList = rawSpecsList.filter((item: any) => {
    const key = String(item?.key || "").toLowerCase();
    return !key.includes("available size") && !key.includes("available color");
  });

  const displayedSpecs = showAllSpecs ? specsList : specsList.slice(0, 4);
  const productDescription = product.description || (product as any).details || "";
  const displaySku = selectedVariant?.sku || product.sku;

  return (
    <div className="space-y-6 font-sans">
      {/* 1. TOP BADGES & STATUS BAR */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {product.flags?.isBestSeller && (
            <span className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-amber-300 px-4 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider shadow-md border border-zinc-700/50">
              <BadgeCheck size={14} className="text-amber-400" />
              BEST SELLER
            </span>
          )}

          {product.flags?.isNewArrival && (
            <span className="bg-white/80 text-zinc-900 backdrop-blur-md border border-zinc-200/80 px-4 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider shadow-sm">
              <Sparkles size={14} className="text-amber-500" />
              NEW ARRIVAL
            </span>
          )}

          <span className={`px-4 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-bold border backdrop-blur-md shadow-2xs ${
            currentStock > 0 
              ? "bg-emerald-50/90 text-emerald-700 border-emerald-200/80" 
              : "bg-rose-50/90 text-rose-700 border-rose-200/80"
          }`}>
            {currentStock > 0 ? <PackageCheck size={13} className="text-emerald-600" /> : <AlertCircle size={13} className="text-rose-600" />}
            {currentStock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {currentStock > 0 && currentStock <= lowStockThreshold && (
          <span className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 text-amber-800 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-extrabold animate-pulse shadow-sm">
            <AlertCircle size={13} className="text-amber-600" />
            Only {currentStock} left in stock!
          </span>
        )}
      </div>

      {/* 2. TITLE & LUXURY ACTION BUTTONS */}
      <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-6">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {product.brand && (
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
                {product.brand}
              </span>
            )}
            {displaySku && (
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-zinc-100/80 border border-zinc-200/80 text-zinc-600 text-[10px] font-mono font-bold tracking-wider">
                SKU: {displaySku}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-950 tracking-tight leading-[1.15]">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex text-amber-400 bg-amber-50/60 px-2.5 py-1 rounded-lg border border-amber-200/40">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={13}
                  fill={i <= Math.round(product.ratingsAverage || 0) ? "currentColor" : "none"}
                  className={i <= Math.round(product.ratingsAverage || 0) ? "text-amber-400" : "text-zinc-300"}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-zinc-500">
              <strong className="text-zinc-900 font-bold">{product.ratingsAverage || "4.8"}</strong> 
              <span className="text-zinc-300 mx-1.5">•</span> 
              <span className="underline cursor-pointer hover:text-black transition">{product.ratingsQuantity || "124"} Verified Reviews</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`border rounded-2xl p-3.5 transition-all duration-300 cursor-pointer shadow-xs ${
              isWishlisted 
                ? "bg-rose-50 border-rose-200 text-rose-600 scale-105 shadow-rose-100" 
                : "border-zinc-200/80 bg-white/80 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700"
            }`}
            aria-label="Wishlist"
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={handleShare}
            className="border border-zinc-200/80 bg-white/85 rounded-2xl p-3.5 hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-300 cursor-pointer text-zinc-700 shadow-xs"
            aria-label="Share"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={handleCopyLink}
            className="border border-zinc-200/80 bg-white/85 rounded-2xl p-3.5 hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-300 cursor-pointer text-zinc-700 shadow-xs relative"
            aria-label="Copy Link"
          >
            {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
          </button>
        </div>
      </div>

      {/* 3. ULTRA-LUXURY PRICING CARD */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-900 text-white p-6 sm:p-8 rounded-[2.5rem] shadow-2xl border border-zinc-800/80">
        <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-baseline justify-between flex-wrap gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Exclusive Pricing</p>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-sm">
                {formatPrice(salePrice)}
              </span>

              {discountPrice && discountPrice > 0 && (
                <div className="flex items-center gap-3">
                  <span className="line-through text-zinc-500 text-base sm:text-lg font-semibold">
                    {formatPrice(currentPrice)}
                  </span>
                  <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-zinc-950 font-black text-[11px] px-3 py-1 rounded-lg uppercase tracking-wider shadow-md">
                    Save {discountPercentage}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. SIZE SELECTION */}
      {availableSizes.length > 0 && (
        <div className="bg-white/90 backdrop-blur-md border border-zinc-200/80 p-5 sm:p-6 rounded-[2rem] shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Select Size</span>
            <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-3 py-0.5 rounded-full">{selectedSize}</span>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {availableSizes.map((size: any) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`border px-5 py-3 rounded-2xl text-xs font-extrabold transition-all duration-300 cursor-pointer shadow-xs ${
                  selectedSize === size
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-md scale-105 ring-2 ring-zinc-900/20"
                    : "bg-zinc-50/80 text-zinc-700 border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-100"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. COLOR SELECTION */}
      {availableColors.length > 0 && (
        <div className="bg-white/90 backdrop-blur-md border border-zinc-200/80 p-5 sm:p-6 rounded-[2rem] shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Select Color</span>
            <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-3 py-0.5 rounded-full">{selectedColor}</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {availableColors.map((color: any) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`border px-5 py-3 rounded-2xl text-xs font-extrabold transition-all duration-300 cursor-pointer flex items-center gap-2.5 shadow-xs ${
                  selectedColor === color
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-md scale-105 ring-2 ring-zinc-900/20"
                    : "bg-zinc-50/80 text-zinc-700 border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-100"
                }`}
              >
                <span 
                  className="w-4 h-4 rounded-full border border-zinc-300 shadow-2xs" 
                  style={{ backgroundColor: String(color).toLowerCase() }} 
                />
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. QUANTITY & DUAL CTA BUTTONS */}
      <div className="space-y-4 bg-gradient-to-b from-zinc-50/80 to-zinc-100/50 border border-zinc-200/80 p-5 sm:p-7 rounded-[2.5rem] shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Select Quantity</span>
          <div className="flex items-center border border-zinc-200/80 bg-white rounded-2xl p-1.5 shadow-xs">
            <button
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="border border-zinc-100 bg-zinc-50 rounded-xl p-2.5 hover:bg-zinc-100 disabled:opacity-30 transition cursor-pointer text-zinc-800"
              aria-label="Decrease"
            >
              <Minus size={14} />
            </button>

            <span className="font-black text-sm px-6 text-zinc-950 w-12 text-center">
              {quantity}
            </span>

            <button
              disabled={quantity >= currentStock}
              onClick={() => setQuantity((q) => q + 1)}
              className="border border-zinc-100 bg-zinc-50 rounded-xl p-2.5 hover:bg-zinc-100 disabled:opacity-30 transition cursor-pointer text-zinc-800"
              aria-label="Increase"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <button
            disabled={adding || currentStock === 0}
            onClick={handleAddToCart}
            className="bg-white border-2 border-zinc-900 hover:bg-zinc-100 text-zinc-950 rounded-2xl py-4 px-6 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer disabled:opacity-50 shadow-sm active:scale-98"
          >
            <ShoppingCart size={16} />
            {currentStock === 0 ? "Out Of Stock" : adding ? "Adding..." : "Add To Cart"}
          </button>

          <button
            disabled={buyingNow || currentStock === 0}
            onClick={buyNow}
            className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 hover:from-black hover:to-zinc-900 text-white rounded-2xl py-4 px-6 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer disabled:opacity-50 shadow-xl shadow-zinc-900/20 active:scale-98"
          >
            <Zap size={16} className="text-amber-400 fill-amber-400 animate-pulse" />
            {buyingNow ? "Processing..." : "Buy Now"}
          </button>
        </div>

        {/* Mini Trust Badges inside Cart Box */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-200/60 text-center">
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/60 border border-zinc-200/40">
            <Truck size={15} className="text-zinc-700 mb-1" />
            <span className="text-[10px] font-extrabold text-zinc-600">Fast Delivery</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/60 border border-zinc-200/40">
            <ShieldCheck size={15} className="text-zinc-700 mb-1" />
            <span className="text-[10px] font-extrabold text-zinc-600">Secure Pay</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/60 border border-zinc-200/40">
            <RefreshCw size={15} className="text-zinc-700 mb-1" />
            <span className="text-[10px] font-extrabold text-zinc-600">Easy Returns</span>
          </div>
        </div>
      </div>

      {/* 7. DESCRIPTION */}
      {productDescription && (
        <div className="bg-white/90 backdrop-blur-md border border-zinc-200/80 rounded-[2.5rem] p-6 sm:p-7 shadow-xs space-y-3.5">
          <h3 className="font-black text-[11px] uppercase tracking-widest text-zinc-400">Description</h3>
          <div className={`text-zinc-600 text-xs sm:text-sm leading-relaxed font-medium ${!isDescExpanded ? "line-clamp-3" : ""}`}>
            <p>{productDescription}</p>
          </div>
          {productDescription.length > 150 && (
            <button
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="text-xs font-extrabold text-zinc-900 hover:underline cursor-pointer pt-1 inline-flex items-center gap-1"
            >
              {isDescExpanded ? "Show Less" : "Read Full Description"}
            </button>
          )}
        </div>
      )}

      {/* 8. ULTRA-PREMIUM MINIMAL SPECIFICATIONS SECTION */}
      {specsList.length > 0 && (
        <div className="bg-gradient-to-br from-white via-zinc-50/40 to-white border border-zinc-200/90 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-5">
          <button
            onClick={() => setIsSpecsOpen(!isSpecsOpen)}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                <SlidersHorizontal size={18} />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-zinc-950 tracking-tight">Specifications</h3>
                <p className="text-xs text-zinc-400 font-semibold mt-0.5">Explore key product metrics and details</p>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-zinc-200/80 group-hover:bg-zinc-100 transition text-zinc-700 shadow-xs">
              {isSpecsOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>
          </button>

          {isSpecsOpen && (
            <div className="space-y-4 pt-4 border-t border-zinc-100/90">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {displayedSpecs.map((item: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-sm transition-all duration-300 group/card"
                  >
                    <span className="text-xs font-bold text-zinc-400 group-hover/card:text-zinc-600 transition-colors">{item.key}</span>
                    <span className="text-xs sm:text-sm font-black text-zinc-900 text-right">{item.value}</span>
                  </div>
                ))}
              </div>

              {specsList.length > 4 && (
                <button
                  onClick={() => setShowAllSpecs(!showAllSpecs)}
                  className="w-full py-4 bg-zinc-900 hover:bg-black text-white rounded-2xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-zinc-900/10 active:scale-98"
                >
                  {showAllSpecs ? (
                    <>Show Less <ChevronUp size={14} /></>
                  ) : (
                    <>Show All {specsList.length} Specifications <ChevronDown size={14} /></>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
