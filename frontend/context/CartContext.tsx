"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  getCart,
  addToCart as addCartAPI,
  updateCart as updateCartAPI,
  removeCartItem as removeCartAPI,
  clearCart as clearCartAPI,
  mergeCart as mergeCartAPI,
} from "@/services/cart.service";

type CartContextType = {
  cart: any;
  totalItems: number;
  loading: boolean;
  cartLoading: boolean;

  addItem: (
    product: any,
    quantity?: number
  ) => Promise<void>;

  updateItem: (
    productId: string,
    quantity: number
  ) => Promise<void>;

  removeItem: (
    productId: string
  ) => Promise<void>;

  clearCart: () => Promise<void>;

  refreshCart: () => Promise<void>;
};

const CartContext =
  createContext<CartContextType | null>(null);

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<any>({
    items: [],
  });

  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );

  const getProductId = useCallback((value: any) => {
    if (!value) return null;

    if (typeof value === "string") return value;

    if (typeof value === "object") {
      return (
        value._id?.toString?.() ||
        value.id?.toString?.() ||
        value.productId?.toString?.() ||
        null
      );
    }

    return null;
  }, []);

  const normalizeCartItems = useCallback((items: any[] = []) => {
    const mergedMap = new Map();

    (items || []).forEach((item: any) => {
      const prod = item.product || {};
      const prodId = getProductId(prod);

      if (!prodId) return;

      const formattedProduct =
        typeof prod === "string"
          ? { _id: prod }
          : {
              ...prod,
              name: prod.name || "Product",
              images: prod.images || [],
              price: prod.discountPrice || prod.price || item.price || 0,
              stock: prod.stock !== undefined ? prod.stock : 10,
            };

      const itemPrice = Number(
        item.price || prod.discountPrice || prod.price || 0
      );
      const itemQty = Number(item.quantity || 1);

      if (mergedMap.has(prodId)) {
        const existing = mergedMap.get(prodId);
        existing.quantity += itemQty;
        existing.price = Number(existing.price || 0) + itemPrice * itemQty;
      } else {
        mergedMap.set(prodId, {
          ...item,
          product: formattedProduct,
          price: itemPrice,
          quantity: itemQty,
        });
      }
    });

    return Array.from(mergedMap.values()).map((entry: any) => ({
      ...entry,
      quantity: Number(entry.quantity || 1),
      price: Number(entry.price || 0),
    }));
  }, [getProductId]);

  // ==========================
  // UPDATE CART STATE (Fixed Duplicate Issue)
  // ==========================
  const updateCartState = useCallback((data: any) => {
    const rawCart = data?.cart || data || { items: [] };
    const formattedItems = normalizeCartItems(rawCart.items || []);

    const total = formattedItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const totalItems = formattedItems.reduce(
      (sum: number, item: any) => sum + Number(item.quantity || 0),
      0
    );

    setCart((prev: any) => ({
      ...prev,
      ...rawCart,
      items: formattedItems,
      total,
      totalItems,
    }));
  }, [normalizeCartItems]);

  // ==========================
  // GUEST SAVE
  // ==========================
  const saveGuestCart = (items: any[]) => {
    localStorage.setItem(
      "guestCart",
      JSON.stringify(items)
    );
  };

  // ==========================
  // GET GUEST CART
  // ==========================
  const normalizeGuestCartItems = (items: any[] = []) => {
    const mergedMap = new Map();

    (items || []).forEach((item: any) => {
      const product = item.product || {};
      const productId = getProductId(product);

      if (!productId) return;

      const quantity = Number(item.quantity || 1);

      if (mergedMap.has(productId)) {
        const existing = mergedMap.get(productId);
        existing.quantity += quantity;
      } else {
        mergedMap.set(productId, {
          ...item,
          product,
          quantity,
        });
      }
    });

    return Array.from(mergedMap.values());
  };

  const getGuestCart = () => {
    return normalizeGuestCartItems(
      JSON.parse(localStorage.getItem("guestCart") || "[]")
    );
  };

  // ==========================
  // LOAD CART
  // ==========================
  const refreshCart = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        const data = await getCart();
        updateCartState(data);

        const guestItems = getGuestCart();
        if (guestItems.length > 0) {
          try {
            const mergedData = await mergeCartAPI(guestItems);
            if (mergedData?.cart) {
              updateCartState(mergedData.cart);
            }

            if (typeof window !== "undefined") {
              localStorage.removeItem("guestCart");
            }
            window.dispatchEvent(new Event("cart:updated"));
          } catch (mergeError) {
            console.log("MERGE GUEST CART ERROR", mergeError);
          }
        }
      } else {
        const items = getGuestCart();
        if (typeof window !== "undefined") {
          localStorage.setItem("guestCart", JSON.stringify(items));
        }
        updateCartState({ items });
      }
    } catch (error) {
      console.log("GET CART ERROR", error);
      setCart({
        items: [],
      });
    } finally {
      setLoading(false);
    }
  }, [updateCartState]);

  useEffect(() => {
    refreshCart();
  }, [authToken, refreshCart]);

  useEffect(() => {
    const normalizedItems = normalizeCartItems(cart.items || []);
    const currentItems = cart.items || [];

    const hasChanged =
      normalizedItems.length !== currentItems.length ||
      normalizedItems.some((item: any, index: number) => {
        const currentItem = currentItems[index];
        return (
          Number(item.quantity || 0) !== Number(currentItem?.quantity || 0) ||
          getProductId(item.product) !== getProductId(currentItem?.product)
        );
      });

    if (hasChanged) {
      const total = normalizedItems.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
      const totalItems = normalizedItems.reduce(
        (sum: number, item: any) => sum + Number(item.quantity || 0),
        0
      );

      setCart((prev: any) => ({
        ...prev,
        items: normalizedItems,
        total,
        totalItems,
      }));
    }
  }, [cart.items, getProductId, normalizeCartItems]);

  useEffect(() => {
    const syncAuthToken = () => {
      setAuthToken(localStorage.getItem("token"));
    };

    const handleAuthChange = () => {
      syncAuthToken();
    };

    syncAuthToken();
    window.addEventListener("storage", syncAuthToken);
    window.addEventListener("focus", syncAuthToken);
    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("storage", syncAuthToken);
      window.removeEventListener("focus", syncAuthToken);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  // ==========================
  // ADD ITEM
  // ==========================
  const addItem = async (
    product: any,
    quantity: number = 1
  ) => {
    try {
      setCartLoading(true);

      const token = localStorage.getItem("token");
      const productId = typeof product === "string" ? product : product._id;

      // LOGIN USER
      if (token) {
        const data = await addCartAPI(
          productId,
          quantity
        );
        updateCartState(data);
      }
      // GUEST USER
      else {
        const items = getGuestCart();

        const normalizedItems = [...items];
        const existing = normalizedItems.find(
          (item: any) => getProductId(item.product) === productId
        );

        if (existing) {
          existing.quantity += quantity;
        } else {
          normalizedItems.push({
            product: typeof product === "object" ? product : {
              _id: productId,
              name: "Product",
              images: [],
              price: 0,
              stock: 10,
            },
            quantity,
          });
        }

        saveGuestCart(normalizedItems);
        updateCartState({ items: normalizedItems });
      }

      window.dispatchEvent(new Event("cart:updated"));
    } catch (error) {
      console.log("ADD CART ERROR", error);
    } finally {
      setCartLoading(false);
    }
  };

  // ==========================
  // UPDATE ITEM
  // ==========================
  const updateItem = async (
    productId: string,
    quantity: number
  ) => {
    try {
      setCartLoading(true);

      const token = localStorage.getItem("token");

      if (token) {
        const data = await updateCartAPI(
          productId,
          quantity
        );
        updateCartState(data);
      } else {
        const items = getGuestCart();

        const normalizedItems = [...items];
        const item = normalizedItems.find(
          (i: any) => getProductId(i.product) === productId
        );

        if (item) {
          item.quantity = quantity;
        }
        saveGuestCart(normalizedItems);
        updateCartState({ items: normalizedItems });
      }

      window.dispatchEvent(new Event("cart:updated"));
    } catch (error) {
      console.log("UPDATE CART ERROR", error);
    } finally {
      setCartLoading(false);
    }
  };

  // ==========================
  // REMOVE ITEM
  // ==========================
  const removeItem = async (
    productId: string
  ) => {
    try {
      setCartLoading(true);

      const token = localStorage.getItem("token");

      if (token) {
        const data = await removeCartAPI(productId);
        updateCartState(data);
      } else {
        const items = getGuestCart();
        const normalizedItems = items.filter(
          (item: any) => getProductId(item.product) !== productId
        );
        saveGuestCart(normalizedItems);
        updateCartState({ items: normalizedItems });
      }

      window.dispatchEvent(new Event("cart:updated"));
    } catch (error) {
      console.log("REMOVE CART ERROR", error);
    } finally {
      setCartLoading(false);
    }
  };

  // ==========================
  // CLEAR CART
  // ==========================
  const clearCart = async () => {
    try {
      setCartLoading(true);

      const token = localStorage.getItem("token");

      if (token) {
        await clearCartAPI();
      }

      localStorage.removeItem("guestCart");

      setCart({
        items: [],
        total: 0,
        totalItems: 0,
      });
      window.dispatchEvent(new Event("cart:updated"));
    } catch (error) {
      console.log("CLEAR CART ERROR", error);
    } finally {
      setCartLoading(false);
    }
  };

  // ==========================
  // TOTAL
  // ==========================
  const totalItems =
    cart?.items?.reduce(
      (total: number, item: any) =>
        total + Number(item.quantity || 0),
      0
    ) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItems,
        loading,
        cartLoading,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default function useCartContext() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be inside CartProvider"
    );
  }

  return context;
}
