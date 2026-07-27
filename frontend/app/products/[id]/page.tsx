"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, ShieldCheck, RefreshCw, Truck, Clock, MapPin, Zap, CheckCircle2, XCircle } from "lucide-react";

import {
  getProductById,
  getRelatedProducts,
  getNewArrivalProducts,
  getBestSellerProducts,
  getTopPickProducts,
} from "@/services/product.service";

import { getDeliveryZones } from "@/services/deliveryZone.service";

import { Product } from "@/types/product";

import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductSection from "@/components/product/ProductSection";

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
  
  // Location & Zone States
  const [regularZone, setRegularZone] = useState<any>(null);
  const [expressAvailable, setExpressAvailable] = useState<boolean>(false);
  const [expressZoneInfo, setExpressZoneInfo] = useState<any>(null);
  const [zonesLoading, setZonesLoading] = useState(true);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { id } = await params;

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

        // Match user location with active delivery zones silently
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

        const addrCity = matchedAddr?.city?.toLowerCase() || "";
        const addrArea = (matchedAddr?.street || matchedAddr?.location?.formattedAddress || "").toLowerCase();

        // 1. Regular Zone Matching
        const foundRegular = activeZones.find((zone) => {
          const zName = zone.name.toLowerCase();
          const isExpress = zName.includes("3 hours") || zName.includes("[3 hours]");
          if (isExpress) return false;
          return zName.includes(addrCity) || (addrArea && zName.includes(addrArea));
        });

        if (foundRegular) {
          setRegularZone(foundRegular);
        } else if (activeZones.length > 0) {
          // Fallback to first non-express or any active zone
          const fallback = activeZones.find(z => !z.name.toLowerCase().includes("3 hours")) || activeZones[0];
          setRegularZone(fallback);
        }

        // 2. Express Zone Matching (3 hours)
        const foundExpress = activeZones.find((zone) => {
          const zName = zone.name.toLowerCase();
          const isExpress = zName.includes("3 hours") || zName.includes("[3 hours]");
          if (!isExpress) return false;
          return zName.includes(addrCity) || (addrArea && zName.includes(addrArea));
        });

        if (foundExpress) {
          setExpressAvailable(true);
          setExpressZoneInfo(foundExpress);
        } else {
          setExpressAvailable(false);
        }

      } catch (error) {
        console.log("Product details error:", error);
      } finally {
        setLoading(false);
        setZonesLoading(false);
      }
    };

    load();
  }, [params]);

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
          <div className="lg:col-span-7">
            <ProductGallery product={product} />
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <ProductInfo product={product} />

              {/* Delivery Information 2 Boxes Widget */}
              <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600">
                  <Truck size={16} className="text-black" />
                  <span>Delivery Information</span>
                </div>

                {zonesLoading ? (
                  <div className="text-xs text-gray-400">Checking delivery details...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                    
                    {/* Box 1: Regular Delivery */}
                    <div className="bg-white p-3 rounded-2xl border border-gray-100 flex flex-col justify-between gap-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800 flex items-center gap-1">
                          <Truck size={14} className="text-blue-600" /> Regular
                        </span>
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md">
                          Available
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 space-y-0.5">
                        <p className="flex items-center gap-1">
                          <Clock size={12} className="text-gray-400" /> Time: <strong className="text-gray-800">{regularZone?.estimatedDays || "3-5 Days"}</strong>
                        </p>
                        <p className="flex items-center gap-1">
                          <MapPin size={12} className="text-gray-400" /> Fee: <strong className="text-gray-800">{regularZone?.deliveryFee === 0 ? "Free" : `৳${regularZone?.deliveryFee || 60}`}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Box 2: Express Delivery */}
                    <div className={`bg-white p-3 rounded-2xl border flex flex-col justify-between gap-2 shadow-2xs ${expressAvailable ? "border-purple-200 bg-purple-50/20" : "border-gray-100 opacity-80"}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800 flex items-center gap-1">
                          <Zap size={14} className="text-purple-600" /> Express (3H)
                        </span>
                        {expressAvailable ? (
                          <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <CheckCircle2 size={11} /> Available
                          </span>
                        ) : (
                          <span className="text-[10px] bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <XCircle size={11} /> Not Available
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 space-y-0.5">
                        {expressAvailable ? (
                          <>
                            <p className="flex items-center gap-1">
                              <Clock size={12} className="text-purple-500" /> Time: <strong className="text-gray-800">{expressZoneInfo?.estimatedDays || "Within 3 Hours"}</strong>
                            </p>
                            <p className="flex items-center gap-1">
                              <MapPin size={12} className="text-purple-500" /> Fee: <strong className="text-gray-800">{expressZoneInfo?.deliveryFee === 0 ? "Free" : `৳${expressZoneInfo?.deliveryFee || 100}`}</strong>
                            </p>
                          </>
                        ) : (
                          <p className="text-[11px] text-gray-400 italic py-1">
                            Not supported for your current location.
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
