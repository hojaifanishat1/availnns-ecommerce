"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ShoppingBag,
  Trash2,
  Flame,
  TrendingUp,
  Percent,
  AlertTriangle,
  Heart,
  Search,
  History,
} from "lucide-react";
import useCart from "@/hooks/useCart";
import CartItem from "@/components/cart/CartItem";
import { useCurrency } from "@/context/CurrencyContext";
import { useWishlist } from "@/context/WishlistContext";
import { useState, useEffect } from "react";
import { getDeliveryZones } from "@/services/deliveryZone.service";
import { getRelatedProducts, getProducts, getBestSellerProducts } from "@/services/product.service";
import { Product } from "@/types/product";
import {
  useAppDispatch,
  useAppSelector,
} from "@/hooks/redux";
import { fetchDealProducts } from "@/store/slices/productSlice";
import ProductCard from "@/components/product/ProductCard";

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartContext = useCart() as any;
  const { cart, loading: cartLoading, totalItems, clearCart } = cartContext;
  const { formatPrice } = useCurrency();
  const { addToWishlist, isInWishlist } = useWishlist();

  const [currentZone, setCurrentZone] = useState<any>(null);
  
  // লোকালস্টোরেজ থেকে ইনিশিয়াল স্টেট লোড করা যাতে রি-রেন্ডারে মুছে না যায়
  const [removedItems, setRemovedItems] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("last_removed_cart_item");
      return stored ? [JSON.parse(stored)] : [];
    }
    return [];
  });

  const dealProducts = useAppSelector(
    (state: any) => state.products.deals || []
  );

  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);

  // লোকালস্টোরেজ ও কাস্টম ইভেন্ট সিঙ্ক রাখা
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("last_removed_cart_item");
      if (stored) {
        try {
          setRemovedItems([JSON.parse(stored)]);
        } catch (e) {
          console.error(e);
        }
      } else {
        setRemovedItems([]);
      }
    };

    window.addEventListener("cartItemRemoved", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("cartItemRemoved", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    dispatch(fetchDealProducts());

    // Best Sellers ফেচ করা
    getBestSellerProducts()
      .then((res) => {
        setBestSellerProducts(Array.isArray(res) ? res.slice(0, 4) : []);
      })
      .catch((err) => console.error("Failed to load best sellers:", err));

    // ইউজার যে প্রোডাক্টগুলো আগে দেখেছে বা ব্রাউজ করেছে তা লোকালস্টোরেজ থেকে ফেচ করা
    const fetchPreviouslyViewed = async () => {
      try {
        if (typeof window !== "undefined") {
          const storedViewed = localStorage.getItem("recently_viewed") || localStorage.getItem("viewed_products");
          
          if (storedViewed) {
            const parsedViews = JSON.parse(storedViewed);
            if (Array.isArray(parsedViews) && parsedViews.length > 0) {
              if (typeof parsedViews[0] === "object") {
                setViewedProducts(parsedViews.slice(0, 4));
                return;
              }
            }
          }
        }

        const allProds = await getProducts();
        if (Array.isArray(allProds)) {
          setViewedProducts(allProds.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load viewed products:", err);
      }
    };

    fetchPreviouslyViewed();
  }, [dispatch]);

  useEffect(() => {
    if (dealProducts.length > 0) {
      const highDiscount = dealProducts.filter((p: any) => {
        const discount = Number(p.discountPercentage || p.discount || 0);
        return discount >= 50;
      });
      setDiscountedProducts(highDiscount.slice(0, 4));
    }
  }, [dealProducts]);

  useEffect(() => {
    const fetchCartRelatedData = async () => {
      try {
        const zonesDataPromise = getDeliveryZones().catch(() => []);
        
        let targetProductId: string | null = null;
        
        if (cart?.items && cart.items.length > 0) {
          const firstItem = cart.items[0];
          targetProductId = firstItem.product?._id?.toString() || firstItem.product?.toString();
        } else if (removedItems.length > 0) {
          targetProductId = removedItems[0].productId || removedItems[0]._id;
        }

        let relatedPromise: Promise<any> = Promise.resolve([]);
        if (targetProductId) {
          relatedPromise = getRelatedProducts(targetProductId).catch(() => []);
        } else {
          relatedPromise = getProducts().catch(() => []);
        }

        const [zonesData, relatedProds] = await Promise.all([
          zonesDataPromise,
          relatedPromise,
        ]);

        if (Array.isArray(zonesData) && zonesData.length > 0) {
          const activeZones = zonesData.filter((z: any) => z.active);
          setCurrentZone(activeZones[0] || zonesData[0]);
        }

        setRecommendedProducts(Array.isArray(relatedProds) ? relatedProds.slice(0, 4) : []);
      } catch (error) {
        console.error("Failed to load cart recommendations:", error);
      }
    };

    if (!cartLoading) {
      fetchCartRelatedData();
    }
  }, [cart, cartLoading, removedItems]);

  const removeAlertItem = () => {
    localStorage.removeItem("last_removed_cart_item");
    setRemovedItems([]);
  };

  const handleMoveToWishlist = (item: any) => {
    const pId = item.productId || item._id;
    if (!isInWishlist(pId)) {
      addToWishlist({
        _id: pId,
        name: item.name,
        price: item.price || 0,
        image: item.image,
      });
    }
    removeAlertItem();
    router.push("/wishlist");
  };

  const handleFindSimilar = (item: any) => {
    const searchQuery = encodeURIComponent(item.name.split(" ")[0]);
    router.push(`/shop?search=${searchQuery}`);
  };

  if (cartLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="space-y-4 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
          <p className="font-medium text-gray-500">Loading your cart...</p>
        </div>
      </main>
    );
  }

  // ==========================================
  // EMPTY CART STATE (Previously Viewed & Best Sellers)
  // ==========================================
  if (!cart?.items?.length && removedItems.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 pb-24 pt-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          
          {/* Main Empty Banner */}
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-md">
              <ShoppingBag size={55} className="text-gray-400" />
            </div>
            <h1 className="mt-8 text-3xl font-black tracking-tight">Your cart is empty</h1>
            <p className="mt-3 text-gray-500">Discover amazing products and add them to your cart to get started.</p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-black px-8 py-4 font-semibold text-white transition-all hover:bg-zinc-800 hover:shadow-lg"
            >
              Start Shopping <ArrowRight size={18} />
            </Link>
          </div>

          {/* 1. Items You Previously Viewed */}
          {viewedProducts.length > 0 && (
            <section className="mt-12 border-t pt-10">
              <div className="flex items-center gap-2 mb-6">
                <History className="text-blue-500" size={22} />
                <h2 className="text-2xl font-black tracking-tight">Items You Previously Viewed</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {viewedProducts.map((prod: any) => (
                  <ProductCard key={prod._id?.toString() || prod.id} product={prod} />
                ))}
              </div>
            </section>
          )}

          {/* 2. Best Sellers For You */}
          {bestSellerProducts.length > 0 && (
            <section className="mt-12 border-t pt-10">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="text-emerald-500" size={22} />
                <h2 className="text-2xl font-black tracking-tight">Best Sellers For You</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {bestSellerProducts.map((prod: any) => (
                  <ProductCard key={prod._id?.toString() || prod.id} product={prod} />
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
    );
  }

  const subtotal = Number(cart.total || 0);

  return (
    <main className="min-h-screen bg-gray-50 pb-40 pt-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Shopping Cart</h1>
            <p className="mt-1 text-gray-500 text-sm">{totalItems} products currently in your cart</p>
          </div>
          {cart?.items?.length > 0 && (
            <button
              onClick={() => {
                if (clearCart) clearCart();
              }}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 sm:self-auto"
            >
              <Trash2 size={16} /> Clear Cart
            </button>
          )}
        </div>

        {/* Cart Products List Section */}
        {cart?.items?.length > 0 && (
          <section className="space-y-4 mb-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-bold">Cart Items</h2>
                <span className="rounded-full bg-gray-100 px-4 py-1 text-sm font-semibold text-gray-700">
                  {totalItems} {totalItems === 1 ? "Item" : "Items"}
                </span>
              </div>
              <div className="space-y-4">
                {cart.items.map((item: any, index: number) => {
                  const itemId = item.product?._id?.toString() || item.product?.toString() || index;
                  return <CartItem key={itemId} item={item} />;
                })}
              </div>
            </div>
          </section>
        )}

        {/* Removed item alert card */}
        {removedItems.length > 0 && (
          <section className="mb-12">
            <div className="rounded-3xl border border-red-100 bg-[#FFF8F8] p-6 shadow-sm">
              <div className="flex items-center gap-2 text-red-600 font-bold mb-4 text-base">
                <AlertTriangle size={20} className="text-red-500" />
                <span>{removedItems.length} item(s) removed from cart</span>
              </div>

              <div className="space-y-4">
                {removedItems.map((item, idx) => (
                  <div key={item.productId || idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <ShoppingBag className="text-gray-400" size={28} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-2">{item.name}</h4>
                        <p className="text-xs font-semibold text-red-500 mt-1">{item.status || "Item removed from cart"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleMoveToWishlist(item)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Heart size={15} /> Wishlist
                      </button>
                      <button
                        onClick={() => handleFindSimilar(item)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition"
                      >
                        <Search size={15} /> Find Similar
                      </button>
                      <button
                        onClick={removeAlertItem}
                        className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Remove alert"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 1. Don't miss out on these offers */}
        {discountedProducts.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center gap-2 mb-6">
              <Percent className="text-red-500" size={22} />
              <h2 className="text-2xl font-black tracking-tight">Don't miss out on these offers</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {discountedProducts.map((prod: any) => (
                <ProductCard key={prod._id?.toString() || prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}

        {/* 2. Recommended for you */}
        <section className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="text-orange-500" size={22} />
            <h2 className="text-2xl font-black tracking-tight">Recommended for you</h2>
          </div>

          {recommendedProducts.length === 0 ? (
            <p className="text-sm text-gray-500">No recommendations available right now.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedProducts.map((prod: any) => (
                <ProductCard key={prod._id?.toString()} product={prod} />
              ))}
            </div>
          )}
        </section>

        {/* 3. You May Also Like */}
        <section className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-emerald-500" size={22} />
            <h2 className="text-2xl font-black tracking-tight">You May Also Like</h2>
          </div>

          {bestSellerProducts.length === 0 ? (
            <p className="text-sm text-gray-500">No products available right now.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {bestSellerProducts.map((prod: any) => (
                <ProductCard key={prod._id?.toString() || prod.id} product={prod} />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Fixed Footer Bar */}
      {cart?.items?.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[60] border-t border-gray-200 bg-white/95 backdrop-blur-md shadow-lg py-4 px-4 sm:px-8 pb-8 sm:pb-5"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 4rem)" }}
        >
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex w-full items-center justify-between gap-6 sm:w-auto sm:justify-start">
              <div>
                <p className="text-xs font-medium text-gray-500">Subtotal ({totalItems} items)</p>
                <p className="text-2xl font-black text-gray-900">{formatPrice(subtotal)}</p>
              </div>
              <div className="hidden h-8 w-px bg-gray-200 sm:block"></div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-emerald-600">✓ Shipping & Tax Calculated at Checkout</p>
              </div>
            </div>

            <div className="flex w-full items-center gap-3 sm:w-auto">
              <Link
                href="/shop"
                className="flex-1 rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-center text-sm font-bold text-gray-700 transition hover:bg-gray-50 sm:flex-none"
              >
                Continue Shopping
              </Link>
              <Link
                href="/checkout"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-zinc-800 hover:shadow-lg sm:flex-none"
              >
                Proceed To Checkout <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
