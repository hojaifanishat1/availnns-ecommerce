"use client";

import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
  Heart,
  Share2,
  PackageCheck,
  AlertCircle,
  Copy,
  Check,
  Zap,
  Flame,
  ShieldAlert,
  FileText,
  Layers,
  MessageSquare,
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

  // Deep fallback for variants from admin panel
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

  // Dynamic Size Extraction
  const availableSizes = Array.from(
    new Set(
      variantsList.flatMap((v: any) => {
        if (!v) return [];
        if (typeof v === "string") return [v];
        const val = 
          v.size ||
          v.capacity ||
          v.storage ||
          (v.name && !String(v.name).toLowerCase().includes("color") ? v.value || v.name : null) ||
          v.attributes?.size ||
          v.attributes?.capacity ||
          v.options?.[0]?.value ||
          v.title;
        return val ? [String(val).trim()] : [];
      }).filter(Boolean)
    )
  );

  // Dynamic Color Extraction
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
      v.capacity ||
      v.storage ||
      v.attributes?.size ||
      v.options?.[0]?.value ||
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
  const [activeTab, setActiveTab] = useState<"desc" | "specs">("desc");

  const lowStockThreshold = product.inventory?.lowStockThreshold || 5;

  const discountPercentage =
    discountPrice && discountPrice < currentPrice
      ? Math.round(((currentPrice - discountPrice) / currentPrice) * 100)
      : 0;

  const salePrice =
    discountPrice && discountPrice > 0
      ? discountPrice
      : currentPrice;

  const displaySku = (() => {
    const baseSku = 
      product.sku || 
      (product as any).itemSku || 
      (product as any).productSku || 
      (product as any).code || 
      "";

    const variantSku = selectedVariant?.sku || "";

    if (baseSku && variantSku) {
      return variantSku.toUpperCase().includes(baseSku.toUpperCase()) 
        ? variantSku.toUpperCase() 
        : `${baseSku}-${variantSku}`.toUpperCase();
    }

    if (baseSku && (selectedSize || selectedColor)) {
      const attributes = [selectedSize, selectedColor].filter(Boolean).join("-");
      return `${baseSku}-${attributes}`.toUpperCase();
    }

    return baseSku || variantSku || "";
  })();

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      const productWithSelections = {
        ...product,
        price: salePrice,
        sku: displaySku,
        selectedVariantSKU: displaySku,
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
        sku: displaySku,
        selectedVariantSKU: displaySku,
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

  const productDescription = product.description || (product as any).details || "";

  // Real ratings & reviews data fallback extraction from product object
  const ratingsAvg = Number(product.ratingsAverage || (product as any).averageRating || 0);
  const ratingsQty = Number(product.ratingsQuantity || (product as any).totalReviews || (product as any).numReviews || 0);

  return (
    <div className="space-y-6 font-sans antialiased text-zinc-900">
      
      {/* 1. TOP BADGES & STATUS BAR */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2.5 flex-wrap">
          {product.flags?.isBestSeller && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] font-black tracking-wider shadow-sm">
              <Flame size={13} className="fill-white" />
              HOT SELLER
            </span>
          )}

          {product.flags?.isNewArrival && (
            <span className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] font-black tracking-wider shadow-sm">
              <Sparkles size={13} className="text-amber-400" />
              NEW DROP
            </span>
          )}

          <span className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] font-bold border transition-all ${
            currentStock > 0 
              ? "bg-emerald-50/80 text-emerald-800 border-emerald-200" 
              : "bg-rose-50/80 text-rose-800 border-rose-200"
          }`}>
            {currentStock > 0 ? <PackageCheck size={14} className="text-emerald-600" /> : <ShieldAlert size={14} className="text-rose-600" />}
            {currentStock > 0 ? "In Stock & Ready" : "Sold Out"}
          </span>
        </div>

        {currentStock > 0 && currentStock <= lowStockThreshold && (
          <span className="bg-amber-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] font-black animate-pulse shadow-sm">
            <AlertCircle size={13} />
            Only {currentStock} items left!
          </span>
        )}
      </div>

      {/* 2. TITLE, PRICE & REAL REVIEWS HEADER */}
      <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-6">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            {product.brand && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 text-[10px] font-extrabold uppercase tracking-widest border border-zinc-200">
                {product.brand}
              </span>
            )}
            {displaySku && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-500 text-[10px] font-mono font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                SKU: {displaySku}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight leading-snug">
            {product.name}
          </h1>

          {/* PRICE */}
          <div className="flex items-baseline gap-3.5 flex-wrap pt-1">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
              {formatPrice(salePrice)}
            </span>

            {discountPrice && discountPrice > 0 && (
              <div className="flex items-center gap-2.5">
                <span className="line-through text-zinc-400 text-base font-semibold">
                  {formatPrice(currentPrice)}
                </span>
                <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Save {discountPercentage}%
                </span>
              </div>
            )}
          </div>

          {/* REAL RATING & REVIEWS DISPLAY */}
          <div className="flex items-center gap-2.5 pt-1">
            <div className="flex text-amber-500 bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200/60">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={13}
                  fill={i <= Math.round(ratingsAvg || 0) ? "currentColor" : "none"}
                  className={i <= Math.round(ratingsAvg || 0) ? "text-amber-500" : "text-zinc-300"}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
              <strong className="text-zinc-900 font-bold">{ratingsAvg > 0 ? ratingsAvg.toFixed(1) : "No Rating"}</strong> 
              <span className="text-zinc-300">•</span> 
              <span className="text-zinc-600 font-semibold">{ratingsQty} {ratingsQty === 1 ? "Review" : "Reviews"}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`border rounded-xl p-3 transition-all duration-200 cursor-pointer shadow-2xs ${
              isWishlisted 
                ? "bg-rose-500 border-rose-500 text-white scale-105" 
                : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700"
            }`}
            aria-label="Wishlist"
          >
            <Heart size={17} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={handleShare}
            className="border border-zinc-200 bg-white rounded-xl p-3 hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-200 cursor-pointer text-zinc-700 shadow-2xs"
            aria-label="Share"
          >
            <Share2 size={17} />
          </button>
          <button 
            onClick={handleCopyLink}
            className="border border-zinc-200 bg-white rounded-xl p-3 hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-200 cursor-pointer text-zinc-700 shadow-2xs"
            aria-label="Copy Link"
          >
            {copied ? <Check size={17} className="text-emerald-600" /> : <Copy size={17} />}
          </button>
        </div>
      </div>

      {/* 3. OPTIONS, SIZES, COLORS & BUTTONS CONTAINER */}
      <div className="bg-gradient-to-b from-zinc-50/70 to-white border border-zinc-200/80 p-5 sm:p-6 rounded-3xl shadow-xs space-y-6">
        
        {/* AVAILABLE SIZES */}
        {availableSizes.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Available Size: <strong className="text-zinc-900">{selectedSize || "Select"}</strong>
              </span>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              {availableSizes.map((size: any) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`border px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    selectedSize === size
                      ? "bg-black text-white border-black shadow-sm"
                      : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AVAILABLE COLORS */}
        {availableColors.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Available Color: <strong className="text-zinc-950 capitalize">{selectedColor || "Select"}</strong>
              </span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {availableColors.map((color: any) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-9 h-9 rounded-full border-2 transition-all duration-200 cursor-pointer flex items-center justify-center ${
                    selectedColor === color
                      ? "border-black scale-110 ring-2 ring-black/10 shadow-sm"
                      : "border-zinc-300 hover:scale-105"
                  }`}
                  title={color}
                >
                  <span 
                    className="w-7 h-7 rounded-full border border-black/10" 
                    style={{ backgroundColor: String(color).toLowerCase() }} 
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* QUANTITY & ACTIONS */}
        <div className="space-y-4 pt-2 border-t border-zinc-200/60">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Quantity</span>
            <div className="flex items-center border border-zinc-200 bg-white rounded-xl p-1 shadow-2xs">
              <button
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="bg-zinc-50 border border-zinc-200 rounded-lg p-2 hover:bg-zinc-100 disabled:opacity-30 transition cursor-pointer text-zinc-800"
                aria-label="Decrease"
              >
                <Minus size={13} />
              </button>

              <span className="font-bold text-xs px-5 text-zinc-900 w-10 text-center">
                {quantity}
              </span>

              <button
                disabled={quantity >= currentStock}
                onClick={() => setQuantity((q) => q + 1)}
                className="bg-zinc-50 border border-zinc-200 rounded-lg p-2 hover:bg-zinc-100 disabled:opacity-30 transition cursor-pointer text-zinc-800"
                aria-label="Increase"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              disabled={adding || currentStock === 0}
              onClick={handleAddToCart}
              className="bg-white border-2 border-black hover:bg-black hover:text-white text-black rounded-xl py-3.5 px-5 font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-2xs active:scale-98"
            >
              <ShoppingCart size={15} />
              {currentStock === 0 ? "Out Of Stock" : adding ? "Adding..." : "Add To Cart"}
            </button>

            <button
              disabled={buyingNow || currentStock === 0}
              onClick={buyNow}
              className="bg-black hover:bg-zinc-800 text-white rounded-xl py-3.5 px-5 font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-md active:scale-98"
            >
              <Zap size={15} className="text-amber-400 fill-amber-400" />
              {buyingNow ? "Processing..." : "Buy Now"}
            </button>
          </div>
        </div>

      </div>

      {/* 4. TABS (DESCRIPTION & SPECIFICATIONS) */}
      {(productDescription || specsList.length > 0) && (
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
          
          {/* Tab Navigation Buttons */}
          <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-2xl">
            {productDescription && (
              <button
                onClick={() => setActiveTab("desc")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "desc"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <FileText size={15} /> Description
              </button>
            )}

            {specsList.length > 0 && (
              <button
                onClick={() => setActiveTab("specs")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "specs"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <Layers size={15} /> Specifications
              </button>
            )}
          </div>

          {/* Tab Content Display */}
          <div className="pt-2">
            {activeTab === "desc" && productDescription && (
              <div className="text-zinc-600 text-xs sm:text-sm leading-relaxed space-y-3 animate-fadeIn">
                <p className="whitespace-pre-line">{productDescription}</p>
              </div>
            )}

            {activeTab === "specs" && specsList.length > 0 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {specsList.map((item: any, index: number) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-100 text-xs"
                    >
                      <span className="font-medium text-zinc-500">{item.key}</span>
                      <span className="font-bold text-zinc-900 text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
