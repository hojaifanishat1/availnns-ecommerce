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
} from "lucide-react";

import {
  useState,
  useEffect,
} from "react";

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

  const [copied, setCopied] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "desc" | "specs"
  >("desc");

  // =========================================================
  // VARIANTS
  // =========================================================

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
    : rawVariants &&
      typeof rawVariants === "object"
    ? Object.values(rawVariants)
    : [];

  // =========================================================
  // COLOR HEX
  // =========================================================

  const getColorHex = (colorName: string): string => {
    const name = colorName
      .trim()
      .toLowerCase();

    const hexMap: Record<string, string> = {
      red: "#EF4444",
      blue: "#3B82F6",
      black: "#000000",
      white: "#FFFFFF",
      green: "#10B981",
      yellow: "#F59E0B",
      gray: "#6B7280",
      grey: "#6B7280",
      purple: "#8B5CF6",
      pink: "#EC4899",
      orange: "#F97316",
      navy: "#1E3A8A",
      brown: "#92400E",
      silver: "#D1D5DB",
      gold: "#F59E0B",
      beige: "#D6C7A1",
      cream: "#FFF7D6",
    };

    return (
      hexMap[name] ||
      colorName
    );
  };

  // =========================================================
  // PRIMARY ATTRIBUTE EXTRACTION
  // =========================================================

  const availableSizes = Array.from(
    new Set(
      variantsList
        .flatMap((v: any) => {
          if (!v) return [];

          if (typeof v === "string") {
            return [v];
          }

          const value =
            v.size ||
            v.capacity ||
            v.storage ||
            v.ram ||
            (
              v.name &&
              !String(v.name)
                .toLowerCase()
                .includes("color")
                ? v.value ||
                  v.name
                : null
            ) ||
            v.attributes?.size ||
            v.attributes?.capacity ||
            v.attributes?.storage ||
            v.attributes?.ram ||
            v.options?.[0]?.value ||
            v.title;

          return value
            ? [String(value).trim()]
            : [];
        })
        .filter(Boolean)
    )
  );

  // =========================================================
  // COLOR EXTRACTION
  // =========================================================

  const availableColors = Array.from(
    new Set(
      variantsList
        .flatMap((v: any) => {
          if (
            !v ||
            typeof v === "string"
          ) {
            return [];
          }

          const value =
            v.color ||
            (
              v.name &&
              String(v.name)
                .toLowerCase()
                .includes("color")
                ? v.value
                : null
            ) ||
            v.attributes?.color ||
            v.options?.find(
              (o: any) =>
                String(o.name || "")
                  .toLowerCase() ===
                "color"
            )?.value;

          return value
            ? [String(value).trim()]
            : [];
        })
        .filter(Boolean)
    )
  );

  // =========================================================
  // DYNAMIC ATTRIBUTE LABEL
  // =========================================================

  const getVariantAttributeLabel = (): string => {
    const productName =
      String(product.name || "")
        .toLowerCase();

    const categoryText = [
      (product as any).category?.name,
      (product as any).subCategory?.name,
      (product as any).categoryName,
      (product as any).subCategoryName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const combinedText =
      `${productName} ${categoryText}`;

    // -------------------------------------------------------
    // MOBILE / PHONE / LAPTOP / TABLET
    // -------------------------------------------------------

    if (
      combinedText.includes("mobile") ||
      combinedText.includes("phone") ||
      combinedText.includes("smartphone") ||
      combinedText.includes("iphone") ||
      combinedText.includes("galaxy") ||
      combinedText.includes("samsung") ||
      combinedText.includes("pixel") ||
      combinedText.includes("laptop") ||
      combinedText.includes("computer") ||
      combinedText.includes("notebook") ||
      combinedText.includes("tablet") ||
      combinedText.includes("ipad")
    ) {
      return "RAM & Storage";
    }

    // -------------------------------------------------------
    // DETECT RAM / STORAGE FROM VARIANT VALUES
    // -------------------------------------------------------

    const hasRamStoragePattern =
      availableSizes.some((value) => {
        const text = String(value)
          .toLowerCase();

        return (
          text.includes("gb") ||
          text.includes("tb") ||
          text.includes("/") &&
            (
              text.includes("8") ||
              text.includes("12") ||
              text.includes("16") ||
              text.includes("32") ||
              text.includes("64") ||
              text.includes("128") ||
              text.includes("256") ||
              text.includes("512") ||
              text.includes("1tb") ||
              text.includes("2tb")
            )
        );
      });

    if (hasRamStoragePattern) {
      return "RAM & Storage";
    }

    // -------------------------------------------------------
    // WATCH
    // -------------------------------------------------------

    if (
      combinedText.includes("watch") ||
      combinedText.includes("smartwatch") ||
      combinedText.includes("smart watch") ||
      combinedText.includes("band")
    ) {
      return "Dial / Strap Size";
    }

    const hasWatchSize =
      availableSizes.some((value) => {
        const text = String(value)
          .toLowerCase();

        return (
          text.includes("mm") ||
          text.includes("inch")
        );
      });

    if (hasWatchSize) {
      return "Dial / Strap Size";
    }

    // -------------------------------------------------------
    // SHOES
    // -------------------------------------------------------

    if (
      combinedText.includes("shoe") ||
      combinedText.includes("footwear") ||
      combinedText.includes("sneaker") ||
      combinedText.includes("sandal") ||
      combinedText.includes("boot")
    ) {
      return "Size";
    }

    // -------------------------------------------------------
    // CLOTHING
    // -------------------------------------------------------

    if (
      combinedText.includes("cloth") ||
      combinedText.includes("clothing") ||
      combinedText.includes("apparel") ||
      combinedText.includes("fashion") ||
      combinedText.includes("shirt") ||
      combinedText.includes("t-shirt") ||
      combinedText.includes("tshirt") ||
      combinedText.includes("pant") ||
      combinedText.includes("jeans") ||
      combinedText.includes("dress") ||
      combinedText.includes("hoodie") ||
      combinedText.includes("jacket")
    ) {
      return "Size";
    }

    // -------------------------------------------------------
    // ACCESSORIES
    // -------------------------------------------------------

    if (
      combinedText.includes("accessor") ||
      combinedText.includes("charger") ||
      combinedText.includes("cover") ||
      combinedText.includes("cable") ||
      combinedText.includes("headphone") ||
      combinedText.includes("earphone") ||
      combinedText.includes("earbud")
    ) {
      return "Specification";
    }

    // -------------------------------------------------------
    // DEFAULT
    // -------------------------------------------------------

    return "Size";
  };

  const variantAttributeLabel =
    getVariantAttributeLabel();

  // =========================================================
  // SELECTED VALUES
  // =========================================================

  const [selectedSize, setSelectedSize] =
    useState<string>(
      (availableSizes[0] as string) ||
        (product as any).size ||
        ""
    );

  const [selectedColor, setSelectedColor] =
    useState<string>(
      (availableColors[0] as string) ||
        (product as any).color ||
        ""
    );

  // =========================================================
  // KEEP DEFAULT SELECTION IN SYNC
  // =========================================================

  useEffect(() => {
    if (
      !selectedSize &&
      availableSizes.length > 0
    ) {
      setSelectedSize(
        availableSizes[0] as string
      );
    }

    if (
      !selectedColor &&
      availableColors.length > 0
    ) {
      setSelectedColor(
        availableColors[0] as string
      );
    }
  }, [
    availableSizes,
    availableColors,
    selectedSize,
    selectedColor,
  ]);

  // =========================================================
  // FIND SELECTED VARIANT
  // =========================================================

  const selectedVariant =
    variantsList.find((v: any) => {
      if (!v) {
        return false;
      }

      if (typeof v === "string") {
        return (
          v === selectedSize
        );
      }

      const vSize =
        v.size ||
        v.capacity ||
        v.storage ||
        v.ram ||
        v.attributes?.size ||
        v.attributes?.capacity ||
        v.attributes?.storage ||
        v.attributes?.ram ||
        v.options?.[0]?.value ||
        v.title;

      const vColor =
        v.color ||
        v.attributes?.color ||
        v.options?.find(
          (o: any) =>
            String(o.name || "")
              .toLowerCase() ===
            "color"
        )?.value;

      const matchSize =
        !selectedSize ||
        String(vSize || "")
          .trim()
          .toLowerCase() ===
          String(selectedSize)
            .trim()
            .toLowerCase();

      const matchColor =
        !selectedColor ||
        String(vColor || "")
          .trim()
          .toLowerCase() ===
          String(selectedColor)
            .trim()
            .toLowerCase();

      if (
        selectedSize &&
        selectedColor
      ) {
        return (
          matchSize &&
          matchColor
        );
      }

      return (
        matchSize ||
        matchColor
      );
    });

  // =========================================================
  // TOTAL VARIANT STOCK
  // =========================================================

  const totalVariantStock =
    variantsList.reduce(
      (
        acc: number,
        v: any
      ) =>
        acc +
        Number(
          v?.stock ??
            v?.quantity ??
            0
        ),
      0
    );

  // =========================================================
  // CURRENT STOCK
  // =========================================================

  const currentStock = Number(
    selectedVariant?.stock !==
      undefined
      ? selectedVariant.stock
      : selectedVariant?.quantity !==
        undefined
      ? selectedVariant.quantity
      : (product as any)
          .stock !== undefined
      ? (product as any).stock
      : product.inventory?.stock !==
        undefined
      ? product.inventory.stock
      : variantsList.length &&
        totalVariantStock > 0
      ? totalVariantStock
      : 10
  );

  // =========================================================
  // BASE PRICE
  // =========================================================

  const basePrice = Number(
    selectedVariant?.price &&
      Number(
        selectedVariant.price
      ) > 0
      ? selectedVariant.price
      : (product as any)
            .price &&
        Number(
          (product as any)
            .price
        ) > 0
      ? (product as any)
          .price
      : product.pricing?.price ||
          0
  );

  // =========================================================
  // DISCOUNT PRICE
  // =========================================================

  const discountPrice = Number(
    selectedVariant?.discountPrice &&
      Number(
        selectedVariant.discountPrice
      ) > 0
      ? selectedVariant.discountPrice
      : (product as any)
            .discountPrice &&
        Number(
          (product as any)
            .discountPrice
        ) > 0
      ? (product as any)
          .discountPrice
      : product.pricing
          ?.discountPrice || 0
  );

  // =========================================================
  // SALE PRICE
  // =========================================================

  const salePrice =
    discountPrice > 0
      ? discountPrice
      : basePrice;

  // =========================================================
  // DISCOUNT PERCENTAGE
  // =========================================================

  const discountPercentage =
    discountPrice &&
    discountPrice < basePrice
      ? Math.round(
          ((basePrice -
            discountPrice) /
            basePrice) *
            100
        )
      : 0;

  // =========================================================
  // SKU
  // =========================================================

  const displaySku = (() => {
    const baseSku =
      product.sku ||
      (product as any)
        .itemSku ||
      (product as any)
        .productSku ||
      (product as any)
        .code ||
      "";

    const variantSku =
      selectedVariant?.sku ||
      "";

    if (
      baseSku &&
      variantSku
    ) {
      return variantSku
        .toUpperCase()
        .includes(
          baseSku.toUpperCase()
        )
        ? variantSku.toUpperCase()
        : `${baseSku}-${variantSku}`.toUpperCase();
    }

    if (
      baseSku &&
      (selectedSize ||
        selectedColor)
    ) {
      const attributes = [
        selectedSize,
        selectedColor,
      ]
        .filter(Boolean)
        .join("-");

      return `${baseSku}-${attributes}`.toUpperCase();
    }

    return (
      baseSku ||
      variantSku ||
      ""
    );
  })();

  // =========================================================
  // LOW STOCK
  // =========================================================

  const lowStockThreshold =
    product.inventory
      ?.lowStockThreshold || 5;

  // =========================================================
  // RATING
  // =========================================================

  const ratingsAvg = Number(
    product.ratingsAverage ||
      (product as any)
        .averageRating ||
      0
  );

  const ratingsQty = Number(
    product.ratingsQuantity ||
      (product as any)
        .totalReviews ||
      (product as any)
        .numReviews ||
      0
  );

  // =========================================================
  // DESCRIPTION
  // =========================================================

  const productDescription =
    product.description ||
    (product as any)
      .details ||
    "";

  // =========================================================
  // SPECIFICATIONS
  // =========================================================

  const rawSpecsList =
    product.specifications ||
    [];

  const specsList =
    rawSpecsList.filter(
      (item: any) => {
        const key =
          String(
            item?.key || ""
          ).toLowerCase();

        return (
          !key.includes(
            "available size"
          ) &&
          !key.includes(
            "available color"
          ) &&
          !key.includes(
            "ram & storage"
          )
        );
      }
    );

  // =========================================================
  // ADD TO CART
  // =========================================================

  const handleAddToCart =
    async () => {
      try {
        setAdding(true);

        const productWithSelections =
          {
            ...product,
            price: salePrice,
            sku: displaySku,
            selectedVariantSKU:
              displaySku,
          };

        await addItem(
          {
            ...productWithSelections,
            selectedSize,
            selectedColor,
            stock: currentStock,
          },
          quantity
        );

        router.push("/cart");
      } catch (error) {
        console.log(error);
      } finally {
        setAdding(false);
      }
    };

  // =========================================================
  // BUY NOW
  // =========================================================

  const buyNow =
    async () => {
      try {
        setBuyingNow(true);

        const productWithSelections =
          {
            ...product,
            price: salePrice,
            sku: displaySku,
            selectedVariantSKU:
              displaySku,
          };

        await addItem(
          {
            ...productWithSelections,
            selectedSize,
            selectedColor,
            stock: currentStock,
          },
          quantity
        );

        router.push(
          "/checkout"
        );
      } catch (error) {
        console.log(error);
      } finally {
        setBuyingNow(false);
      }
    };

  // =========================================================
  // SHARE
  // =========================================================

  const handleShare =
    async () => {
      if (
        navigator.share
      ) {
        try {
          await navigator.share(
            {
              title:
                product.name,
              text:
                product.description,
              url:
                window.location
                  .href,
            }
          );
        } catch (error) {
          console.log(
            "Error sharing:",
            error
          );
        }
      } else {
        handleCopyLink();
      }
    };

  // =========================================================
  // COPY LINK
  // =========================================================

  const handleCopyLink =
    () => {
      navigator.clipboard.writeText(
        window.location.href
      );

      setCopied(true);

      setTimeout(
        () =>
          setCopied(false),
        2000
      );
    };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6 font-sans antialiased text-zinc-900">

      {/* =====================================================
          1. TOP BADGES
      ===================================================== */}

      <div className="flex items-center justify-between flex-wrap gap-3">

        <div className="flex gap-2.5 flex-wrap">

          {product.flags
            ?.isBestSeller && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] font-black tracking-wider shadow-sm">
              <Flame
                size={13}
                className="fill-white"
              />
              HOT SELLER
            </span>
          )}

          {product.flags
            ?.isNewArrival && (
            <span className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] font-black tracking-wider shadow-sm">
              <Sparkles
                size={13}
                className="text-amber-400"
              />
              NEW DROP
            </span>
          )}

          <span
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] font-bold border transition-all ${
              currentStock > 0
                ? "bg-emerald-50/80 text-emerald-800 border-emerald-200"
                : "bg-rose-50/80 text-rose-800 border-rose-200"
            }`}
          >
            {currentStock >
            0 ? (
              <PackageCheck
                size={14}
                className="text-emerald-600"
              />
            ) : (
              <ShieldAlert
                size={14}
                className="text-rose-600"
              />
            )}

            {currentStock >
            0
              ? "In Stock & Ready"
              : "Sold Out"}
          </span>

        </div>

        {currentStock >
          0 &&
          currentStock <=
            lowStockThreshold && (
            <span className="bg-amber-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] font-black animate-pulse shadow-sm">
              <AlertCircle
                size={13}
              />
              Only{" "}
              {currentStock}{" "}
              items left!
            </span>
          )}

      </div>

      {/* =====================================================
          2. TITLE / PRICE / RATING
      ===================================================== */}

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
                SKU:{" "}
                {displaySku}
              </span>
            )}

          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight leading-snug">
            {product.name}
          </h1>

          {/* PRICE */}

          <div className="flex items-baseline gap-3.5 flex-wrap pt-1">

            <span className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
              {formatPrice(
                salePrice
              )}
            </span>

            {discountPrice >
              0 && (
              <div className="flex items-center gap-2.5">

                <span className="line-through text-zinc-400 text-base font-semibold">
                  {formatPrice(
                    basePrice
                  )}
                </span>

                <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Save{" "}
                  {
                    discountPercentage
                  }
                  %
                </span>

              </div>
            )}

          </div>

          {/* RATINGS */}

          <div className="flex items-center gap-2.5 pt-1">

            <div className="flex text-amber-500 bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200/60">

              {[1, 2, 3, 4, 5].map(
                (i) => (
                  <Star
                    key={i}
                    size={13}
                    fill={
                      i <=
                      Math.round(
                        ratingsAvg ||
                          0
                      )
                        ? "currentColor"
                        : "none"
                    }
                    className={
                      i <=
                      Math.round(
                        ratingsAvg ||
                          0
                      )
                        ? "text-amber-500"
                        : "text-zinc-300"
                    }
                  />
                )
              )}

            </div>

            <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">

              <strong className="text-zinc-900 font-bold">
                {ratingsAvg >
                0
                  ? ratingsAvg.toFixed(
                      1
                    )
                  : "No Rating"}
              </strong>

              <span className="text-zinc-300">
                •
              </span>

              <span className="text-zinc-600 font-semibold">
                {ratingsQty}{" "}
                {ratingsQty ===
                1
                  ? "Review"
                  : "Reviews"}
              </span>

            </span>

          </div>

        </div>

        {/* ACTION BUTTONS */}

        <div className="flex items-center gap-2 shrink-0">

          <button
            type="button"
            onClick={() =>
              setIsWishlisted(
                !isWishlisted
              )
            }
            className={`border rounded-xl p-3 transition-all duration-200 cursor-pointer shadow-2xs ${
              isWishlisted
                ? "bg-rose-500 border-rose-500 text-white scale-105"
                : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700"
            }`}
            aria-label="Wishlist"
          >
            <Heart
              size={17}
              fill={
                isWishlisted
                  ? "currentColor"
                  : "none"
              }
            />
          </button>

          <button
            type="button"
            onClick={
              handleShare
            }
            className="border border-zinc-200 bg-white rounded-xl p-3 hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-200 cursor-pointer text-zinc-700 shadow-2xs"
            aria-label="Share"
          >
            <Share2
              size={17}
            />
          </button>

          <button
            type="button"
            onClick={
              handleCopyLink
            }
            className="border border-zinc-200 bg-white rounded-xl p-3 hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-200 cursor-pointer text-zinc-700 shadow-2xs"
            aria-label="Copy Link"
          >
            {copied ? (
              <Check
                size={17}
                className="text-emerald-600"
              />
            ) : (
              <Copy
                size={17}
              />
            )}
          </button>

        </div>

      </div>

      {/* =====================================================
          3. OPTIONS
      ===================================================== */}

      <div className="bg-gradient-to-b from-zinc-50/70 to-white border border-zinc-200/80 p-5 sm:p-6 rounded-3xl shadow-xs space-y-6">

        {/* ===================================================
            DYNAMIC PRIMARY ATTRIBUTE
        =================================================== */}

        {availableSizes.length >
          0 && (
          <div className="space-y-2.5">

            <div className="flex items-center justify-between">

              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">

                Available{" "}

                {variantAttributeLabel}:

                {" "}

                <strong className="text-zinc-900">
                  {selectedSize ||
                    "Select"}
                </strong>

              </span>

            </div>

            <div className="flex gap-2.5 flex-wrap">

              {availableSizes.map(
                (
                  size
                ) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      setSelectedSize(
                        String(
                          size
                        )
                      )
                    }
                    className={`border px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      selectedSize ===
                      size
                        ? "bg-black text-white border-black shadow-sm"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    {size}
                  </button>
                )
              )}

            </div>

          </div>
        )}

        {/* ===================================================
            COLORS
        =================================================== */}

        {availableColors.length >
          0 && (
          <div className="space-y-2.5">

            <div className="flex items-center justify-between">

              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">

                Available Color:

                {" "}

                <strong className="text-zinc-950 capitalize">
                  {selectedColor ||
                    "Select"}
                </strong>

              </span>

            </div>

            <div className="flex gap-3 flex-wrap">

              {availableColors.map(
                (
                  color
                ) => {
                  const colorName =
                    String(
                      color
                    );

                  const colorHex =
                    getColorHex(
                      colorName
                    );

                  return (
                    <button
                      key={
                        colorName
                      }
                      type="button"
                      onClick={() =>
                        setSelectedColor(
                          colorName
                        )
                      }
                      className={`w-9 h-9 rounded-full border-2 transition-all duration-200 cursor-pointer flex items-center justify-center ${
                        selectedColor ===
                        colorName
                          ? "border-black scale-110 ring-2 ring-black/10 shadow-sm"
                          : "border-zinc-300 hover:scale-105"
                      }`}
                      title={
                        colorName
                      }
                      aria-label={`Select ${colorName}`}
                    >
                      <span
                        className="w-7 h-7 rounded-full border border-black/10"
                        style={{
                          backgroundColor:
                            colorHex,
                        }}
                      />
                    </button>
                  );
                }
              )}

            </div>

          </div>
        )}

        {/* ===================================================
            QUANTITY
        =================================================== */}

        <div className="space-y-4 pt-2 border-t border-zinc-200/60">

          <div className="flex items-center justify-between flex-wrap gap-4">

            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Quantity
            </span>

            <div className="flex items-center border border-zinc-200 bg-white rounded-xl p-1 shadow-2xs">

              <button
                type="button"
                disabled={
                  quantity <= 1
                }
                onClick={() =>
                  setQuantity(
                    (q) =>
                      Math.max(
                        1,
                        q - 1
                      )
                  )
                }
                className="bg-zinc-50 border border-zinc-200 rounded-lg p-2 hover:bg-zinc-100 disabled:opacity-30 transition cursor-pointer text-zinc-800"
                aria-label="Decrease"
              >
                <Minus
                  size={13}
                />
              </button>

              <span className="font-bold text-xs px-5 text-zinc-900 w-10 text-center">
                {quantity}
              </span>

              <button
                type="button"
                disabled={
                  quantity >=
                  currentStock
                }
                onClick={() =>
                  setQuantity(
                    (q) =>
                      q + 1
                  )
                }
                className="bg-zinc-50 border border-zinc-200 rounded-lg p-2 hover:bg-zinc-100 disabled:opacity-30 transition cursor-pointer text-zinc-800"
                aria-label="Increase"
              >
                <Plus
                  size={13}
                />
              </button>

            </div>

          </div>

          {/* =================================================
              CART / BUY
          ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">

            <button
              type="button"
              disabled={
                adding ||
                currentStock ===
                  0
              }
              onClick={
                handleAddToCart
              }
              className="bg-white border-2 border-black hover:bg-black hover:text-white text-black rounded-xl py-3.5 px-5 font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-2xs active:scale-98"
            >
              <ShoppingCart
                size={15}
              />

              {currentStock ===
              0
                ? "Out Of Stock"
                : adding
                ? "Adding..."
                : "Add To Cart"}
            </button>

            <button
              type="button"
              disabled={
                buyingNow ||
                currentStock ===
                  0
              }
              onClick={
                buyNow
              }
              className="bg-black hover:bg-zinc-800 text-white rounded-xl py-3.5 px-5 font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-md active:scale-98"
            >
              <Zap
                size={15}
                className="text-amber-400 fill-amber-400"
              />

              {buyingNow
                ? "Processing..."
                : "Buy Now"}
            </button>

          </div>

        </div>

      </div>

      {/* =====================================================
          4. DESCRIPTION / SPECIFICATIONS
      ===================================================== */}

      {(productDescription ||
        specsList.length >
          0) && (
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">

          {/* TABS */}

          <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-2xl">

            {productDescription && (
              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "desc"
                  )
                }
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab ===
                  "desc"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <FileText
                  size={15}
                />
                Description
              </button>
            )}

            {specsList.length >
              0 && (
              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "specs"
                  )
                }
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab ===
                  "specs"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <Layers
                  size={15}
                />
                Specifications
              </button>
            )}

          </div>

          {/* TAB CONTENT */}

          <div className="pt-2">

            {activeTab ===
              "desc" &&
              productDescription && (
                <div className="text-zinc-600 text-xs sm:text-sm leading-relaxed space-y-3 animate-fadeIn">
                  <p className="whitespace-pre-line">
                    {
                      productDescription
                    }
                  </p>
                </div>
              )}

            {activeTab ===
              "specs" &&
              specsList.length >
                0 && (
                <div className="space-y-3 animate-fadeIn">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">

                    {specsList.map(
                      (
                        item: any,
                        index: number
                      ) => (
                        <div
                          key={
                            index
                          }
                          className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-100 text-xs"
                        >

                          <span className="font-medium text-zinc-500">
                            {
                              item.key
                            }
                          </span>

                          <span className="font-bold text-zinc-900 text-right">
                            {
                              item.value
                            }
                          </span>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

          </div>

        </div>
      )}

    </div>
  );
}