"use client";

import { useEffect, useState, use } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, ShieldCheck, RefreshCw, Truck, Clock, MapPin, Zap, CheckCircle, XCircle, Star, PlusCircle, ShoppingCart } from "lucide-react";

import {
  getProductById,
  getRelatedProducts,
} from "@/services/product.service";

import { getDeliveryZones } from "@/services/deliveryZone.service";
import api from "@/services/api";

import { Product } from "@/types/product";

import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductSection from "@/components/product/ProductSection";
import ProductCard from "@/components/product/ProductCard";

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [previouslyBrowsed, setPreviouslyBrowsed] = useState<Product[]>([]);
  const [topSellers, setTopSellers] = useState<Product[]>([]);
  const [topRated, setTopRated] = useState<Product[]>([]); // Added missing topRated state

  // Location & Zone States
  const [matchedRegularZone, setMatchedRegularZone] = useState<any>(null);
  const [matchedExpressZone, setMatchedExpressZone] = useState<any>(null);
  const [expressAvailable, setExpressAvailable] = useState<boolean>(false);
  const [zonesLoading, setZonesLoading] = useState(true);

  // Review States
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // Frequently Bought Together States
  const [includeBundleItem, setIncludeBundleItem] = useState(true);
  const [bundleAdding, setBundleAdding] = useState(false);

  const [loading, setLoading] = useState(true);

  const fetchReviews = async (productId: string) => {
    try {
      const res = await api.get(`/reviews/product/${productId}`);
      setReviews(res.data.reviews || res.data || []);
    } catch (e) {
      console.log("Error loading reviews", e);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const productRes = await getProductById(id);
        const currentProduct = productRes?.product || productRes;

        if (!currentProduct) {
          notFound();
          return;
        }

        setProduct(currentProduct);
        await fetchReviews(id);

        const catId = typeof currentProduct.category === "object" && currentProduct.category !== null 
          ? (currentProduct.category as any)._id 
          : currentProduct.category;

        const [relatedRes, catProductsRes, topSellersRes, topRatedRes, zonesRes] = await Promise.all([
          getRelatedProducts(id),
          catId ? api.get(`/products?category=${catId}`).then(res => res.data.products || res.data).catch(() => []) : Promise.resolve([]),
          catId ? api.get(`/products?category=${catId}&sort=-sold&limit=4`).then(res => res.data.products || res.data).catch(() => []) : api.get(`/products?sort=-sold&limit=4`).then(res => res.data.products || res.data).catch(() => []),
          api.get(`/products?sort=-rating&limit=4`).then(res => res.data.products || res.data).catch(() => []), // Fetching top rated products
          getDeliveryZones().catch(() => []),
        ]);

        const filterItems = (items: any[]) => 
          Array.isArray(items) ? items.filter((item: Product) => (item._id?.toString() || item._id) !== id).slice(0, 4) : [];

        setRelated(filterItems(relatedRes));
        setCategoryProducts(filterItems(catProductsRes));
        setTopSellers(filterItems(topSellersRes));
        setTopRated(filterItems(topRatedRes));

        let activeZones: any[] = [];
        if (Array.isArray(zonesRes)) {
          activeZones = zonesRes.filter((z: any) => z.active);
        }

        const localData = localStorage.getItem("user_addresses");
        let matchedAddr: any = null;

        if (localData) {
          try {
            const parsedAddresses: any[] = JSON.parse(localData);
            const savedId = localStorage.getItem("selected_address_id");
            matchedAddr = 
              parsedAddresses.find((a) => a.id === savedId) || 
              parsedAddresses.find((a) => a.isDefault) || 
              parsedAddresses[0];
          } catch (e) {
            console.error("Error parsing user address for delivery:", e);
          }
        }

        const district = (matchedAddr?.city || matchedAddr?.district || "").toLowerCase();
        const area = (matchedAddr?.street || matchedAddr?.location?.formattedAddress || "").toLowerCase();

        const checkIsExpress = (zone: any) => {
          const zName = (zone.name || "").toLowerCase();
          const zDays = (zone.estimatedDays || "").toLowerCase();
          return zName.includes("3 hour") || zName.includes("express") || zDays.includes("3 hour");
        };

        const matchesLocation = (zone: any) => {
          const zName = (zone.name || "").toLowerCase();
          if (!district && !area) return true;
          return (district && zName.includes(district)) || (area && zName.includes(area)) || zName.includes("kishoreganj");
        };

        const foundExpress = activeZones.find((zone) => {
          return checkIsExpress(zone) && matchesLocation(zone);
        });

        const finalExpress = foundExpress || activeZones.find(z => checkIsExpress(z));

        if (finalExpress) {
          setExpressAvailable(true);
          setMatchedExpressZone(finalExpress);
        } else {
          setExpressAvailable(false);
          setMatchedExpressZone(null);
        }

        const foundRegular = activeZones.find((zone) => {
          return !checkIsExpress(zone) && matchesLocation(zone);
        });

        const finalRegular = foundRegular || activeZones.find(z => !checkIsExpress(z)) || activeZones[0];
        setMatchedRegularZone(finalRegular);

      } catch (error) {
        console.log("Product details error:", error);
      } finally {
        setLoading(false);
        setZonesLoading(false);
      }
    };

    if (id) {
      load();
    }
  }, [id]);

  useEffect(() => {
    if (product && typeof window !== "undefined") {
      try {
        const existing = localStorage.getItem("recently_viewed");
        let viewedList = existing ? JSON.parse(existing) : [];

        viewedList = viewedList.filter(
          (p: any) => (p._id?.toString() || p.id) !== (product._id?.toString() || product._id)
        );

        viewedList.unshift(product);
        if (viewedList.length > 10) {
          viewedList = viewedList.slice(0, 10);
        }

        localStorage.setItem("recently_viewed", JSON.stringify(viewedList));

        const filteredBrowsed = viewedList.filter(
          (p: any) => (p._id?.toString() || p.id) !== (product._id?.toString() || product._id)
        );
        setPreviouslyBrowsed(filteredBrowsed);
      } catch (error) {
        console.error("Failed to save/load recently viewed product:", error);
      }
    }
  }, [product]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");

    if (!comment.trim()) {
      setReviewError("Please write a comment.");
      return;
    }

    try {
      setReviewLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setReviewError("Please login to submit a review.");
        return;
      }

      await api.post("/reviews", {
        productId: product?._id,
        rating,
        comment,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReviewSuccess("Review submitted successfully!");
      setComment("");
      if (product?._id) {
        fetchReviews(product._id);
      }
    } catch (err: any) {
      setReviewError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500 animate-pulse">Loading amazing product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const categoryName = typeof product.category === "object" && product.category !== null 
    ? (product.category as any).name 
    : product.category;

  const categoryId = typeof product.category === "object" && product.category !== null 
    ? (product.category as any)._id 
    : product.category;

  const regularFeeAmount = Number(matchedRegularZone?.deliveryFee) ?? 60;
  const expressFeeAmount = Number(matchedExpressZone?.expressFee ?? matchedExpressZone?.expressDeliveryFee ?? matchedExpressZone?.charge ?? 50);

  // Bundle calculations
  const bundleItem = related.length > 0 ? related[0] : null;
  const selectedCount = 1 + (includeBundleItem && bundleItem ? 1 : 0);

  const handleAddBundleToCart = async () => {
    try {
      setBundleAdding(true);
      const token = localStorage.getItem("token");
      
      await api.post("/cart", { productId: product._id, quantity: 1 }, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      
      if (includeBundleItem && bundleItem) {
        await api.post("/cart", { productId: bundleItem._id, quantity: 1 }, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      }
      
      router.push("/cart");
    } catch (error) {
      console.log("Error adding bundle to cart", error);
    } finally {
      setBundleAdding(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/50 py-6 sm:py-8 lg:py-12 overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-6 text-xs sm:text-sm font-medium text-gray-500 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
          <Link href="/" className="flex items-center gap-1 hover:text-black transition">
            <Home size={15} /> Home
          </Link>
          <ChevronRight size={14} className="text-gray-400 shrink-0" />
          <Link href="/shop" className="hover:text-black transition">
            Shop
          </Link>
          {categoryName && (
            <>
              <ChevronRight size={14} className="text-gray-400 shrink-0" />
              <Link href={`/shop?category=${categoryId}`} className="hover:text-black transition">
                {categoryName}
              </Link>
            </>
          )}
          <ChevronRight size={14} className="text-gray-400 shrink-0" />
          <span className="text-black font-semibold truncate max-w-[150px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Main Section */}
        <section className="grid gap-8 lg:grid-cols-12 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10 border border-gray-100 shadow-sm items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <ProductGallery product={product} />
          </div>

          {/* Right Column: Product Info, Specs, Delivery, Bundle & Reviews */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6 sm:space-y-8 min-w-0">
            <div>
              <ProductInfo product={product} />

              {/* Frequently Bought Together Section */}
              {bundleItem && (
                <div className="mt-6 bg-gradient-to-br from-zinc-50 via-white to-zinc-50/80 border border-zinc-200/80 rounded-3xl p-4 sm:p-6 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                      <PlusCircle size={16} className="text-black" />
                      Frequently Bought Together
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    {/* Main Product Card */}
                    <div className="relative">
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs p-1 rounded-md border border-zinc-300 shadow-sm z-20 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled={true}
                          className="w-4 h-4 rounded border-zinc-400 text-black focus:ring-black cursor-not-allowed"
                        />
                      </span>
                      <ProductCard product={product} />
                    </div>

                    {/* Bundle Product Card with Top-Left Checkbox */}
                    <div className="relative">
                      <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs p-1 rounded-md border border-zinc-300 shadow-sm z-20 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={includeBundleItem}
                          onChange={(e) => setIncludeBundleItem(e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-400 text-black focus:ring-black cursor-pointer"
                        />
                      </span>
                      <ProductCard product={bundleItem} />
                    </div>
                  </div>

                  <button
                    disabled={bundleAdding}
                    onClick={handleAddBundleToCart}
                    className="w-full bg-zinc-900 hover:bg-black text-white rounded-xl py-3.5 px-4 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-md active:scale-98"
                  >
                    <ShoppingCart size={16} />
                    {bundleAdding ? "Processing..." : `Buy ${selectedCount} Item${selectedCount > 1 ? "s" : ""} Together`}
                  </button>
                </div>
              )}

              {/* Delivery Information Widget */}
              <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-3 sm:p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900">
                    <Truck size={16} className="text-black shrink-0" />
                    <span>Delivery Information</span>
                  </div>
                </div>

                {zonesLoading ? (
                  <div className="text-xs text-zinc-400">Checking delivery details...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col justify-between gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                          <Truck size={14} className="text-blue-600 shrink-0" /> Regular Delivery
                        </span>
                        <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded tracking-wide shrink-0">
                          STANDARD
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-600 space-y-1">
                        <p className="flex items-center gap-1.5">
                          <Clock size={12} className="text-zinc-400 shrink-0" /> Estimated: <strong className="text-zinc-900">{matchedRegularZone?.estimatedDays || "3-5 Days"}</strong>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-zinc-400 shrink-0" /> Delivery Fee:{" "}
                          <strong className="text-zinc-900">
                            {regularFeeAmount === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `৳${regularFeeAmount}`}
                          </strong>
                        </p>
                      </div>
                    </div>

                    <div className={`p-3.5 rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col justify-between gap-2 ${!expressAvailable ? "opacity-60 bg-zinc-50/50" : ""}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                          <Zap size={14} className="text-amber-500 fill-amber-500 shrink-0" /> Express (3 Hours)
                        </span>
                        {expressAvailable ? (
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                            <CheckCircle size={10} /> AVAILABLE
                          </span>
                        ) : (
                          <span className="text-[9px] bg-zinc-200 text-zinc-600 font-medium px-2 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                            <XCircle size={10} /> UNAVAILABLE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-600 space-y-1">
                        {expressAvailable ? (
                          <>
                            <p className="flex items-center gap-1.5">
                              <Clock size={12} className="text-amber-500 shrink-0" /> Estimated: <strong className="text-zinc-900">{matchedExpressZone?.estimatedDays || "Within 3 Hours"}</strong>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-amber-500 shrink-0" /> Delivery Fee:{" "}
                              <strong className="text-zinc-900">
                                {regularFeeAmount === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `৳${regularFeeAmount}`}
                              </strong>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Zap size={12} className="text-amber-500 shrink-0" /> Express Fee: <strong className="text-zinc-900">৳{expressFeeAmount}</strong>
                            </p>
                          </>
                        ) : (
                          <p className="text-[10px] text-zinc-400 italic py-1">
                            Not supported for your region.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 mt-4 border-t border-gray-100">
                <div className="flex items-center sm:flex-col sm:text-center p-3 rounded-2xl bg-gray-50 gap-3 sm:gap-1.5">
                  <Truck size={20} className="text-black shrink-0" />
                  <span className="text-[11px] font-bold text-gray-700">Express Shipping</span>
                </div>
                <div className="flex items-center sm:flex-col sm:text-center p-3 rounded-2xl bg-gray-50 gap-3 sm:gap-1.5">
                  <ShieldCheck size={20} className="text-black shrink-0" />
                  <span className="text-[11px] font-bold text-gray-700">100% Authentic</span>
                </div>
                <div className="flex items-center sm:flex-col sm:text-center p-3 rounded-2xl bg-gray-50 gap-3 sm:gap-1.5">
                  <RefreshCw size={20} className="text-black shrink-0" />
                  <span className="text-[11px] font-bold text-gray-700">Easy Returns</span>
                </div>
              </div>

            </div>

            {/* Customer Reviews Section */}
            <div className="bg-zinc-50/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-zinc-200/80 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">Customer Reviews</h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {reviews && reviews.length > 0 ? (
                  reviews.map((rev: any) => (
                    <div key={rev._id} className="p-3.5 rounded-2xl border border-zinc-200/80 bg-white space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-zinc-900 truncate">{rev.user?.name || "Anonymous User"}</span>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={11}
                              className={i < rev.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-600 break-words">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 italic">No reviews yet. Be the first to review this product!</p>
                )}
              </div>

              <form onSubmit={handleReviewSubmit} className="p-3.5 sm:p-4 rounded-2xl border border-zinc-200 bg-white space-y-3 shadow-2xs">
                <h4 className="text-[11px] font-black uppercase text-zinc-900 tracking-wider">Write a Review</h4>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-600">Rating:</span>
                  <div className="flex items-center gap-1 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        onClick={() => setRating(star)}
                        className={star <= rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <textarea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your feedback about the product..."
                    className="w-full rounded-xl border border-zinc-200 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black bg-zinc-50 resize-none"
                  />
                </div>

                {reviewError && <p className="text-xs text-red-600 font-semibold">{reviewError}</p>}
                {reviewSuccess && <p className="text-xs text-emerald-600 font-semibold">{reviewSuccess}</p>}

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-full sm:w-auto bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm active:scale-95 cursor-pointer text-center"
                >
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>

          </div>
        </section>

        {/* More from Category Section */}
        {categoryProducts.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <ProductSection 
              title={categoryName ? `More from ${categoryName}` : "More from this Category"} 
              products={categoryProducts} 
            />
          </div>
        )}

        {/* Customers Also Viewed Section */}
        {related.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <ProductSection 
              title="Customers also viewed" 
              products={related} 
            />
          </div>
        )}

        {/* Products Related to This Section */}
        {related.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <ProductSection 
              title="Products related to this" 
              products={related} 
            />
          </div>
        )}

        {/* Previously Browsed Products Section */}
        {previouslyBrowsed.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <ProductSection 
              title="Previously browsed products" 
              products={previouslyBrowsed} 
            />
          </div>
        )}

        {/* Top Selling / Bestsellers in this Category Section */}
        {topSellers.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <ProductSection 
              title={categoryName ? `Bestsellers in this category` : "Bestsellers in this Category"} 
              products={topSellers} 
            />
          </div>
        )}

        {/* Top Rated Products Section */}
        {topRated.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <ProductSection 
              title={categoryName ? `Top Rated Products for You` : "Top Rated Products"} 
              products={topRated} 
            />
          </div>
        )}

      </div>
    </main>
  );
}
