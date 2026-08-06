"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, ShieldCheck, RefreshCw, Truck, Clock, MapPin, Zap, CheckCircle, XCircle, Star } from "lucide-react";

import {
  getProductById,
  getRelatedProducts,
  getNewArrivalProducts,
  getBestSellerProducts,
  getTopPickProducts,
} from "@/services/product.service";

import { getDeliveryZones } from "@/services/deliveryZone.service";
import api from "@/services/api";

import { Product } from "@/types/product";

import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductSection from "@/components/product/ProductSection";

export const dynamic = "force-dynamic";

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [recent, setRecent] = useState<Product[]>([]);
  const [bestSeller, setBestSeller] = useState<Product[]>([]);
  const [topPicks, setTopPicks] = useState<Product[]>([]);

  // Location & Zone States (Info Only)
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
        const resolvedParams = await params;
        const id = resolvedParams.id;

        const [
          productRes,
          relatedRes,
          newRes,
          bestRes,
          topPickRes,
          zonesRes,
        ] = await Promise.all([
          getProductById(id),
          getRelatedProducts(id),
          getNewArrivalProducts(),
          getBestSellerProducts(),
          getTopPickProducts(),
          getDeliveryZones().catch(() => []),
        ]);

        const currentProduct = productRes.product;

        if (!currentProduct) {
          notFound();
          return;
        }

        setProduct(currentProduct);
        await fetchReviews(id);

        setRelated(
          relatedRes.filter((item: Product) => item._id !== id).slice(0, 4)
        );
        setRecent(
          newRes.filter((item: Product) => item._id !== id).slice(0, 4)
        );
        setBestSeller(
          bestRes.filter((item: Product) => item._id !== id).slice(0, 4)
        );
        setTopPicks(
          topPickRes.filter((item: Product) => item._id !== id).slice(0, 4)
        );

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

    load();
  }, [params]);

  // Recently Viewed প্রোডাক্ট লোকালস্টোরেজে সেভ করার লজিক
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
      } catch (error) {
        console.error("Failed to save recently viewed product:", error);
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

  // Fee Calculations
  const regularFeeAmount = Number(matchedRegularZone?.deliveryFee) ?? 60;
  const expressFeeAmount = Number(matchedExpressZone?.expressFee ?? matchedExpressZone?.expressDeliveryFee ?? matchedExpressZone?.charge ?? 50);

  return (
    <main className="min-h-screen bg-gray-50/50 py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-xs sm:text-sm font-medium text-gray-500 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/" className="flex items-center gap-1 hover:text-black transition">
            <Home size={15} /> Home
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link href="/shop" className="hover:text-black transition">
            Shop
          </Link>
          {categoryName && (
            <>
              <ChevronRight size={14} className="text-gray-400" />
              <Link href={`/shop?category=${categoryId}`} className="hover:text-black transition">
                {categoryName}
              </Link>
            </>
          )}
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-black font-semibold truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Main Product Section */}
        <section className="grid gap-10 lg:grid-cols-12 bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-gray-100 shadow-sm">
          <div className="lg:col-span-7 space-y-8">
            <ProductGallery product={product} />
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <ProductInfo product={product} />

              {/* Delivery Information Widget (Info Only Style) */}
              <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900">
                    <Truck size={16} className="text-black" />
                    <span>Delivery Information</span>
                  </div>
                </div>

                {zonesLoading ? (
                  <div className="text-xs text-zinc-400">Checking delivery details...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                    
                    {/* Regular Delivery Info */}
                    <div className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col justify-between gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                          <Truck size={14} className="text-blue-600" /> Regular Delivery
                        </span>
                        <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded tracking-wide">
                          STANDARD
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-600 space-y-1">
                        <p className="flex items-center gap-1.5">
                          <Clock size={12} className="text-zinc-400" /> Estimated: <strong className="text-zinc-900">{matchedRegularZone?.estimatedDays || "3-5 Days"}</strong>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-zinc-400" /> Delivery Fee:{" "}
                          <strong className="text-zinc-900">
                            {regularFeeAmount === 0 ? (
                              <span className="text-emerald-600 font-bold">FREE</span>
                            ) : (
                              `৳${regularFeeAmount}`
                            )}
                          </strong>
                        </p>
                      </div>
                    </div>

                    {/* Express Delivery Info */}
                    <div className={`p-3.5 rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col justify-between gap-2 ${!expressAvailable ? "opacity-60 bg-zinc-50/50" : ""}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                          <Zap size={14} className="text-amber-500 fill-amber-500" /> Express (3 Hours)
                        </span>
                        {expressAvailable ? (
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
                            <CheckCircle size={10} /> AVAILABLE
                          </span>
                        ) : (
                          <span className="text-[9px] bg-zinc-200 text-zinc-600 font-medium px-2 py-0.5 rounded flex items-center gap-0.5">
                            <XCircle size={10} /> UNAVAILABLE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-600 space-y-1">
                        {expressAvailable ? (
                          <>
                            <p className="flex items-center gap-1.5">
                              <Clock size={12} className="text-amber-500" /> Estimated: <strong className="text-zinc-900">{matchedExpressZone?.estimatedDays || "Within 3 Hours"}</strong>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-amber-500" /> Delivery Fee:{" "}
                              <strong className="text-zinc-900">
                                {regularFeeAmount === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `৳${regularFeeAmount}`}
                              </strong>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Zap size={12} className="text-amber-500" /> Express Fee: <strong className="text-zinc-900">৳{expressFeeAmount}</strong>
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
            </div>

            {/* Extra Trust Badges / Guarantees */}
            <div className="mt-8 grid grid-cols-3 gap-3 pt-6 border-t border-gray-100">
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50">
                <Truck size={20} className="text-black mb-1.5" />
                <span className="text-[11px] font-bold text-gray-700">Express Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50">
                <ShieldCheck size={20} className="text-black mb-1.5" />
                <span className="text-[11px] font-bold text-gray-700">100% Authentic</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50">
                <RefreshCw size={20} className="text-black mb-1.5" />
                <span className="text-[11px] font-bold text-gray-700">Easy Returns</span>
              </div>
            </div>
          </div>
        </section>

        {/* Product Description Section */}
        {product.description && (
          <section className="mt-12 bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider">Description</h3>
            <div className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100">
              {product.description}
            </div>
          </section>
        )}

        {/* Customer Reviews Section */}
        <section className="mt-12 bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-gray-100 shadow-sm space-y-8">
          <h3 className="text-base font-bold text-zinc-900 uppercase tracking-tight">Customer Reviews</h3>

          {/* Existing Reviews List */}
          <div className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((rev: any) => (
                <div key={rev._id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900">{rev.user?.name || "Anonymous User"}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < rev.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600">{rev.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">No reviews yet. Be the first to review this product!</p>
            )}
          </div>

          {/* Add Review Form */}
          <form onSubmit={handleReviewSubmit} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/30 space-y-4">
            <h4 className="text-xs font-bold uppercase text-zinc-900">Write a Review</h4>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-600">Rating:</span>
              <div className="flex items-center gap-1 cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    onClick={() => setRating(star)}
                    className={star <= rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your feedback about the product..."
                className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:ring-1 focus:ring-black bg-white"
              />
            </div>

            {reviewError && <p className="text-xs text-red-600 font-semibold">{reviewError}</p>}
            {reviewSuccess && <p className="text-xs text-emerald-600 font-semibold">{reviewSuccess}</p>}

            <button
              type="submit"
              disabled={reviewLoading}
              className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
            >
              {reviewLoading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </section>

        {/* Product Recommendations Sections */}
        <div className="mt-16 space-y-12">
          {related.length > 0 && (
            <ProductSection title="Related Products" products={related} />
          )}

          {topPicks.length > 0 && (
            <ProductSection title="Top Picks For You" products={topPicks} />
          )}

          {bestSeller.length > 0 && (
            <ProductSection title="Best Sellers" products={bestSeller} />
          )}

          {recent.length > 0 && (
            <ProductSection title="New Arrivals" products={recent} />
          )}
        </div>
      </div>
    </main>
  );
}
