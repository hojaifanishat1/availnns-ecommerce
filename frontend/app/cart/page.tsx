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

import { useState, useEffect, useMemo } from "react";

import {
  getRelatedProducts,
  getProducts,
  getBestSellerProducts,
} from "@/services/product.service";

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

  const {
    cart,
    loading: cartLoading,
    totalItems,
    clearCart,
  } = cartContext;

  const { formatPrice } = useCurrency();

  const {
    addToWishlist,
    isInWishlist,
  } = useWishlist();

  // =========================================================
  // REMOVED ITEMS
  // =========================================================

  const [removedItems, setRemovedItems] =
    useState<any[]>(() => {
      if (typeof window !== "undefined") {
        try {
          const stored =
            localStorage.getItem(
              "last_removed_cart_item"
            );

          return stored
            ? [JSON.parse(stored)]
            : [];
        } catch {
          return [];
        }
      }

      return [];
    });

  // =========================================================
  // PRODUCTS
  // =========================================================

  const dealProducts = useAppSelector(
    (state: any) =>
      state.products.deals || []
  );

  const [
    discountedProducts,
    setDiscountedProducts,
  ] = useState<Product[]>([]);

  const [
    recommendedProducts,
    setRecommendedProducts,
  ] = useState<Product[]>([]);

  const [
    bestSellerProducts,
    setBestSellerProducts,
  ] = useState<Product[]>([]);

  const [
    viewedProducts,
    setViewedProducts,
  ] = useState<Product[]>([]);

  // =========================================================
  // SYNC REMOVED ITEMS
  // =========================================================

  useEffect(() => {
    const handleStorageChange = () => {
      const stored =
        localStorage.getItem(
          "last_removed_cart_item"
        );

      if (stored) {
        try {
          setRemovedItems([
            JSON.parse(stored),
          ]);
        } catch (error) {
          console.error(error);
        }
      } else {
        setRemovedItems([]);
      }
    };

    window.addEventListener(
      "cartItemRemoved",
      handleStorageChange
    );

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "cartItemRemoved",
        handleStorageChange
      );

      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  // =========================================================
  // LOAD DEALS / BEST SELLERS / VIEWED
  // =========================================================

  useEffect(() => {
    dispatch(fetchDealProducts());

    // -------------------------------------------------------
    // BEST SELLERS
    // -------------------------------------------------------

    getBestSellerProducts()
      .then((res) => {
        setBestSellerProducts(
          Array.isArray(res)
            ? res.slice(0, 4)
            : []
        );
      })
      .catch((error) => {
        console.error(
          "Failed to load best sellers:",
          error
        );
      });

    // -------------------------------------------------------
    // PREVIOUSLY VIEWED
    // -------------------------------------------------------

    const fetchPreviouslyViewed =
      async () => {
        try {
          if (
            typeof window !==
            "undefined"
          ) {
            const storedViewed =
              localStorage.getItem(
                "recently_viewed"
              ) ||
              localStorage.getItem(
                "viewed_products"
              );

            if (storedViewed) {
              const parsedViews =
                JSON.parse(
                  storedViewed
                );

              if (
                Array.isArray(
                  parsedViews
                ) &&
                parsedViews.length > 0
              ) {
                if (
                  typeof parsedViews[0] ===
                  "object"
                ) {
                  setViewedProducts(
                    parsedViews.slice(
                      0,
                      4
                    )
                  );

                  return;
                }
              }
            }
          }

          const allProds =
            await getProducts();

          if (
            Array.isArray(allProds)
          ) {
            setViewedProducts(
              allProds.slice(0, 4)
            );
          }
        } catch (error) {
          console.error(
            "Failed to load viewed products:",
            error
          );
        }
      };

    fetchPreviouslyViewed();
  }, [dispatch]);

  // =========================================================
  // DISCOUNTED PRODUCTS
  // =========================================================

  useEffect(() => {
    if (
      dealProducts.length > 0
    ) {
      const highDiscount =
        dealProducts.filter(
          (product: any) => {
            const discount =
              Number(
                product.discountPercentage ||
                  product.discount ||
                  0
              );

            return discount >= 50;
          }
        );

      setDiscountedProducts(
        highDiscount.slice(0, 4)
      );
    }
  }, [dealProducts]);

  // =========================================================
  // CART RELATED PRODUCTS
  // =========================================================

  useEffect(() => {
    const fetchCartRelatedData =
      async () => {
        try {
          let targetProductId:
            | string
            | null = null;

          if (
            cart?.items &&
            cart.items.length > 0
          ) {
            const firstItem =
              cart.items[0];

            targetProductId =
              firstItem?.product?._id?.toString() ||
              firstItem?.product?.toString() ||
              null;
          } else if (
            removedItems.length > 0
          ) {
            targetProductId =
              removedItems[0]
                ?.productId ||
              removedItems[0]?._id ||
              null;
          }

          let relatedPromise:
            Promise<any> =
            Promise.resolve([]);

          if (targetProductId) {
            relatedPromise =
              getRelatedProducts(
                targetProductId
              ).catch(() => []);
          } else {
            relatedPromise =
              getProducts().catch(
                () => []
              );
          }

          const relatedProds =
            await relatedPromise;

          setRecommendedProducts(
            Array.isArray(
              relatedProds
            )
              ? relatedProds.slice(
                  0,
                  4
                )
              : []
          );
        } catch (error) {
          console.error(
            "Failed to load cart recommendations:",
            error
          );
        }
      };

    if (!cartLoading) {
      fetchCartRelatedData();
    }
  }, [
    cart,
    cartLoading,
    removedItems,
  ]);

  // =========================================================
  // GET CART ITEM SELLING PRICE
  // =========================================================
  //
  // IMPORTANT:
  // We DON'T use cart.total here.
  //
  // cart.total can contain the original price.
  //
  // Instead we calculate:
  //
  // variant discount price
  //       ↓
  // item discount price
  //       ↓
  // product discount price
  //       ↓
  // variant regular price
  //       ↓
  // product regular price
  //       ↓
  // item price
  //
  // =========================================================

  const getCartItemPrice = (
    item: any
  ): number => {
    const product =
      typeof item?.product ===
        "object" &&
      item?.product !== null
        ? item.product
        : {};

    // -------------------------------------------------------
    // Direct variant
    // -------------------------------------------------------

    const directVariant =
      item?.variant ||
      item?.selectedVariant ||
      item?.productVariant ||
      null;

    // -------------------------------------------------------
    // Selected SKU
    // -------------------------------------------------------

    const selectedSKU =
      item?.selectedVariantSKU ||
      item?.variantSKU ||
      item?.variantSku ||
      item?.sku ||
      directVariant?.sku ||
      "";

    // -------------------------------------------------------
    // Find variant from product.variants
    // -------------------------------------------------------

    let variantFromProduct =
      null;

    if (
      Array.isArray(
        product?.variants
      )
    ) {
      variantFromProduct =
        product.variants.find(
          (variant: any) => {
            const variantSKU =
              variant?.sku ||
              variant?.SKU ||
              variant?.variantSKU ||
              variant?.variantSku ||
              "";

            if (
              selectedSKU &&
              variantSKU
            ) {
              return (
                String(
                  variantSKU
                ).toLowerCase() ===
                String(
                  selectedSKU
                ).toLowerCase()
              );
            }

            return false;
          }
        ) || null;
    }

    const variant =
      directVariant ||
      variantFromProduct ||
      null;

    // -------------------------------------------------------
    // DISCOUNT PRICE
    // -------------------------------------------------------

    const variantDiscountPrice =
      Number(
        variant?.discountPrice ??
          variant?.salePrice ??
          variant?.offerPrice ??
          0
      );

    const itemDiscountPrice =
      Number(
        item?.discountPrice ??
          item?.salePrice ??
          item?.offerPrice ??
          0
      );

    const productDiscountPrice =
      Number(
        product?.discountPrice ??
          product?.pricing
            ?.discountPrice ??
          product?.salePrice ??
          product?.offerPrice ??
          0
      );

    // -------------------------------------------------------
    // REGULAR PRICE
    // -------------------------------------------------------

    const variantRegularPrice =
      Number(
        variant?.price ??
          variant?.regularPrice ??
          variant?.basePrice ??
          0
      );

    const productRegularPrice =
      Number(
        product?.price ??
          product?.pricing?.price ??
          product?.regularPrice ??
          0
      );

    const itemPrice =
      Number(
        item?.price ??
          item?.regularPrice ??
          item?.basePrice ??
          0
      );

    // -------------------------------------------------------
    // FINAL SELLING PRICE
    // -------------------------------------------------------

    if (
      variantDiscountPrice > 0
    ) {
      return variantDiscountPrice;
    }

    if (
      itemDiscountPrice > 0
    ) {
      return itemDiscountPrice;
    }

    if (
      productDiscountPrice > 0
    ) {
      return productDiscountPrice;
    }

    if (
      variantRegularPrice > 0
    ) {
      return variantRegularPrice;
    }

    if (
      productRegularPrice > 0
    ) {
      return productRegularPrice;
    }

    return itemPrice;
  };

  // =========================================================
  // CART ITEMS
  // =========================================================

  const cartItems = useMemo(() => {
    return Array.isArray(
      cart?.items
    )
      ? cart.items
      : [];
  }, [cart]);

  // =========================================================
  // CORRECT SUBTOTAL
  // =========================================================
  //
  // Example:
  //
  // Original price = ৳500
  // Discount price = ৳250
  // Quantity = 1
  //
  // subtotal = ৳250
  //
  // =========================================================

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (
        total: number,
        item: any
      ) => {
        const price =
          getCartItemPrice(item);

        const quantity =
          Number(
            item?.quantity
          ) || 0;

        return (
          total +
          price * quantity
        );
      },
      0
    );
  }, [cartItems]);

  // =========================================================
  // ORIGINAL SUBTOTAL
  // =========================================================

  const originalSubtotal =
    useMemo(() => {
      return cartItems.reduce(
        (
          total: number,
          item: any
        ) => {
          const product =
            typeof item?.product ===
              "object" &&
            item?.product !== null
              ? item.product
              : {};

          const variant =
            item?.variant ||
            item?.selectedVariant ||
            item?.productVariant ||
            null;

          const selectedSKU =
            item?.selectedVariantSKU ||
            item?.variantSKU ||
            item?.variantSku ||
            item?.sku ||
            variant?.sku ||
            "";

          let productVariant =
            variant;

          if (
            !productVariant &&
            Array.isArray(
              product?.variants
            )
          ) {
            productVariant =
              product.variants.find(
                (v: any) => {
                  const sku =
                    v?.sku ||
                    v?.SKU ||
                    v?.variantSKU ||
                    v?.variantSku ||
                    "";

                  return (
                    selectedSKU &&
                    sku &&
                    String(
                      sku
                    ).toLowerCase() ===
                      String(
                        selectedSKU
                      ).toLowerCase()
                  );
                }
              ) || null;
          }

          const regularPrice =
            Number(
              productVariant?.price ??
                productVariant?.regularPrice ??
                product?.price ??
                product?.pricing
                  ?.price ??
                item?.originalPrice ??
                item?.price ??
                0
            );

          const quantity =
            Number(
              item?.quantity
            ) || 0;

          return (
            total +
            regularPrice *
              quantity
          );
        },
        0
      );
    }, [cartItems]);

  // =========================================================
  // TOTAL SAVINGS
  // =========================================================

  const totalSavings = Math.max(
    0,
    originalSubtotal -
      subtotal
  );

  // =========================================================
  // REMOVED ITEM
  // =========================================================

  const removeAlertItem = () => {
    localStorage.removeItem(
      "last_removed_cart_item"
    );

    setRemovedItems([]);
  };

  // =========================================================
  // MOVE TO WISHLIST
  // =========================================================

  const handleMoveToWishlist = (
    item: any
  ) => {
    const pId =
      item.productId ||
      item._id;

    if (!isInWishlist(pId)) {
      addToWishlist({
        _id: pId,
        name: item.name,
        price:
          item.price || 0,
        image: item.image,
      });
    }

    removeAlertItem();

    router.push("/wishlist");
  };

  // =========================================================
  // FIND SIMILAR
  // =========================================================

  const handleFindSimilar = (
    item: any
  ) => {
    const searchQuery =
      encodeURIComponent(
        String(
          item.name || ""
        ).split(" ")[0]
      );

    router.push(
      `/shop?search=${searchQuery}`
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (cartLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="space-y-4 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-black border-t-transparent" />

          <p className="font-medium text-gray-500">
            Loading your cart...
          </p>
        </div>
      </main>
    );
  }

  // =========================================================
  // EMPTY CART
  // =========================================================

  if (
    cartItems.length === 0 &&
    removedItems.length === 0
  ) {
    return (
      <main className="min-h-screen bg-gray-50 pb-24 pt-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">

            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-md">
              <ShoppingBag
                size={55}
                className="text-gray-400"
              />
            </div>

            <h1 className="mt-8 text-3xl font-black tracking-tight">
              Your cart is empty
            </h1>

            <p className="mt-3 text-gray-500">
              Discover amazing products
              and add them to your cart
              to get started.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-black px-8 py-4 font-semibold text-white transition-all hover:bg-zinc-800 hover:shadow-lg"
            >
              Start Shopping
              <ArrowRight size={18} />
            </Link>

          </div>

          {/* PREVIOUSLY VIEWED */}

          {viewedProducts.length >
            0 && (
            <section className="mt-12 border-t pt-10">

              <div className="mb-6 flex items-center gap-2">
                <History
                  className="text-blue-500"
                  size={22}
                />

                <h2 className="text-2xl font-black tracking-tight">
                  Items You Previously
                  Viewed
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                {viewedProducts.map(
                  (prod: any) => (
                    <ProductCard
                      key={
                        prod._id?.toString() ||
                        prod.id
                      }
                      product={prod}
                    />
                  )
                )}
              </div>

            </section>
          )}

          {/* BEST SELLERS */}

          {bestSellerProducts.length >
            0 && (
            <section className="mt-12 border-t pt-10">

              <div className="mb-6 flex items-center gap-2">
                <TrendingUp
                  className="text-emerald-500"
                  size={22}
                />

                <h2 className="text-2xl font-black tracking-tight">
                  Best Sellers For You
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                {bestSellerProducts.map(
                  (prod: any) => (
                    <ProductCard
                      key={
                        prod._id?.toString() ||
                        prod.id
                      }
                      product={prod}
                    />
                  )
                )}
              </div>

            </section>
          )}

        </div>
      </main>
    );
  }

  // =========================================================
  // MAIN CART
  // =========================================================

  return (
    <main className="min-h-screen bg-gray-50 pb-40 pt-10">

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <h1 className="text-3xl font-black tracking-tight">
              Shopping Cart
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {totalItems} products
              currently in your cart
            </p>

          </div>

          {cartItems.length >
            0 && (
            <button
              type="button"
              onClick={() => {
                if (clearCart) {
                  clearCart();
                }
              }}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 sm:self-auto"
            >
              <Trash2 size={16} />
              Clear Cart
            </button>
          )}

        </div>

        {/* CART ITEMS */}

        {cartItems.length >
          0 && (
          <section className="mb-8 space-y-4">

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center justify-between border-b pb-4">

                <h2 className="text-xl font-bold">
                  Cart Items
                </h2>

                <span className="rounded-full bg-gray-100 px-4 py-1 text-sm font-semibold text-gray-700">
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "Item"
                    : "Items"}
                </span>

              </div>

              <div className="space-y-4">

                {cartItems.map(
                  (
                    item: any,
                    index: number
                  ) => {

                    const itemId =
                      item?.product?._id?.toString() ||
                      item?.product?.toString() ||
                      index;

                    return (
                      <CartItem
                        key={itemId}
                        item={item}
                        maxStock={
                          item?.stock ||
                          item?.product
                            ?.stock ||
                          10
                        }
                      />
                    );
                  }
                )}

              </div>

            </div>

          </section>
        )}

        {/* REMOVED ITEM ALERT */}

        {removedItems.length >
          0 && (
          <section className="mb-12">

            <div className="rounded-3xl border border-red-100 bg-[#FFF8F8] p-6 shadow-sm">

              <div className="mb-4 flex items-center gap-2 text-base font-bold text-red-600">

                <AlertTriangle
                  size={20}
                  className="text-red-500"
                />

                <span>
                  {removedItems.length}{" "}
                  item(s) removed
                  from cart
                </span>

              </div>

              <div className="space-y-4">

                {removedItems.map(
                  (
                    item,
                    idx
                  ) => (
                    <div
                      key={
                        item.productId ||
                        idx
                      }
                      className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs sm:flex-row sm:items-center"
                    >

                      <div className="flex items-center gap-4">

                        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100">

                          {item.image ? (
                            <img
                              src={
                                item.image
                              }
                              alt={
                                item.name
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ShoppingBag
                              className="text-gray-400"
                              size={28}
                            />
                          )}

                        </div>

                        <div>

                          <h4 className="line-clamp-2 text-sm font-bold text-gray-900">
                            {item.name}
                          </h4>

                          <p className="mt-1 text-xs font-semibold text-red-500">
                            {item.status ||
                              "Item removed from cart"}
                          </p>

                        </div>

                      </div>

                      <div className="flex w-full items-center justify-end gap-3 sm:w-auto">

                        <button
                          type="button"
                          onClick={() =>
                            handleMoveToWishlist(
                              item
                            )
                          }
                          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
                        >
                          <Heart
                            size={15}
                          />
                          Wishlist
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleFindSimilar(
                              item
                            )
                          }
                          className="flex items-center gap-1.5 rounded-xl bg-black px-4 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800"
                        >
                          <Search
                            size={15}
                          />
                          Find Similar
                        </button>

                        <button
                          type="button"
                          onClick={
                            removeAlertItem
                          }
                          className="rounded-xl p-2.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                          title="Remove alert"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

          </section>
        )}

        {/* OFFERS */}

        {discountedProducts.length >
          0 && (
          <section className="mt-12">

            <div className="mb-6 flex items-center gap-2">

              <Percent
                className="text-red-500"
                size={22}
              />

              <h2 className="text-2xl font-black tracking-tight">
                Don't miss out on these
                offers
              </h2>

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">

              {discountedProducts.map(
                (prod: any) => (
                  <ProductCard
                    key={
                      prod._id?.toString() ||
                      prod.id
                    }
                    product={prod}
                  />
                )
              )}

            </div>

          </section>
        )}

        {/* RECOMMENDED */}

        <section className="mt-12">

          <div className="mb-6 flex items-center gap-2">

            <Flame
              className="text-orange-500"
              size={22}
            />

            <h2 className="text-2xl font-black tracking-tight">
              Recommended for you
            </h2>

          </div>

          {recommendedProducts.length ===
          0 ? (
            <p className="text-sm text-gray-500">
              No recommendations
              available right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">

              {recommendedProducts.map(
                (prod: any) => (
                  <ProductCard
                    key={prod._id?.toString()}
                    product={prod}
                  />
                )
              )}

            </div>
          )}

        </section>

        {/* BEST SELLERS */}

        <section className="mt-12">

          <div className="mb-6 flex items-center gap-2">

            <TrendingUp
              className="text-emerald-500"
              size={22}
            />

            <h2 className="text-2xl font-black tracking-tight">
              You May Also Like
            </h2>

          </div>

          {bestSellerProducts.length ===
          0 ? (
            <p className="text-sm text-gray-500">
              No products available
              right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">

              {bestSellerProducts.map(
                (prod: any) => (
                  <ProductCard
                    key={
                      prod._id?.toString() ||
                      prod.id
                    }
                    product={prod}
                  />
                )
              )}

            </div>
          )}

        </section>

      </div>

      {/* =====================================================
          FIXED CART SUMMARY
          ===================================================== */}

      {cartItems.length >
        0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[60] border-t border-gray-200 bg-white/95 px-4 py-4 pb-8 shadow-lg backdrop-blur-md sm:px-8 sm:pb-5"
          style={{
            bottom:
              "calc(env(safe-area-inset-bottom, 0px) + 4rem)",
          }}
        >

          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">

            {/* =================================================
                SUBTOTAL
                ================================================= */}

            <div className="flex w-full items-center justify-between gap-6 sm:w-auto sm:justify-start">

              <div>

                <p className="text-xs font-medium text-gray-500">
                  Subtotal (
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}
                  )
                </p>

                {/* DISCOUNT-AWARE SUBTOTAL */}

                <p className="text-2xl font-black text-gray-900">
                  {formatPrice(
                    subtotal
                  )}
                </p>

                {/* ORIGINAL SUBTOTAL */}

                {totalSavings >
                  0 && (
                  <div className="mt-1 flex items-center gap-2">

                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(
                        originalSubtotal
                      )}
                    </span>

                    <span className="text-xs font-bold text-emerald-600">
                      Save{" "}
                      {formatPrice(
                        totalSavings
                      )}
                    </span>

                  </div>
                )}

              </div>

              <div className="hidden h-8 w-px bg-gray-200 sm:block" />

              <div className="hidden sm:block">

                <p className="text-xs font-bold text-emerald-600">
                  ✓ Shipping & Tax
                  Calculated at
                  Checkout
                </p>

              </div>

            </div>

            {/* =================================================
                ACTIONS
                ================================================= */}

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
                Proceed To Checkout
                <ArrowRight size={16} />
              </Link>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}