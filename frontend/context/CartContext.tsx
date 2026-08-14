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

// ======================================================
// TYPES
// ======================================================

type CartVariantData = {
  sku?: string;
  size?: string;
  color?: string;
  capacity?: string;
  storage?: string;
  price?: number;
  discountPrice?: number;
  stock?: number;
  [key: string]: any;
};

type CartItemVariant = {
  size?: string;
  color?: string;

  selectedSize?: string;
  selectedColor?: string;

  selectedVariantSKU?: string;

  variant?: CartVariantData | null;
};

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
    quantity: number,
    variant?: CartItemVariant
  ) => Promise<void>;

  removeItem: (
    productId: string,
    variant?: CartItemVariant
  ) => Promise<void>;

  clearCart: () => Promise<void>;

  refreshCart: () => Promise<void>;
};

// ======================================================
// CONTEXT
// ======================================================

const CartContext =
  createContext<CartContextType | null>(null);

// ======================================================
// LOCAL STORAGE
// ======================================================

const VARIANT_STORAGE_KEY =
  "cart_variant_metadata";

const GUEST_CART_KEY =
  "guestCart";

// ======================================================
// HELPERS
// ======================================================

const cleanString = (
  value: any
): string => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
};

// ======================================================
// PROVIDER
// ======================================================

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] =
    useState<any>({
      items: [],
      total: 0,
      totalItems: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [cartLoading, setCartLoading] =
    useState(false);

  const [authToken, setAuthToken] =
    useState<string | null>(
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null
    );

  // ====================================================
  // PRODUCT ID
  // ====================================================

  const getProductId = useCallback(
    (value: any): string | null => {
      if (!value) {
        return null;
      }

      if (typeof value === "string") {
        return value;
      }

      if (typeof value === "object") {
        return (
          value?._id?.toString?.() ||
          value?.id?.toString?.() ||
          value?.productId?.toString?.() ||
          null
        );
      }

      return null;
    },
    []
  );

  // ====================================================
  // VARIANT LIST
  // ====================================================

  const getVariantsList =
    useCallback((product: any): any[] => {
      const rawVariants =
        product?.variants ||
        product?.itemVariants ||
        product?.productVariants ||
        [];

      if (Array.isArray(rawVariants)) {
        return rawVariants;
      }

      if (
        rawVariants &&
        typeof rawVariants === "object"
      ) {
        return Object.values(rawVariants);
      }

      return [];
    }, []);

  // ====================================================
  // FIND VARIANT
  // ====================================================

  const findMatchedVariant =
    useCallback(
      (
        product: any,
        size: string = "",
        color: string = "",
        sku: string = ""
      ): CartVariantData | null => {
        const variants =
          getVariantsList(product);

        if (!variants.length) {
          return null;
        }

        const cleanSize =
          cleanString(size).toLowerCase();

        const cleanColor =
          cleanString(color).toLowerCase();

        const cleanSKU =
          cleanString(sku).toLowerCase();

        if (cleanSKU) {
          const skuMatch =
            variants.find(
              (variant: any) => {
                if (
                  !variant ||
                  typeof variant === "string"
                ) {
                  return false;
                }

                const variantSKU =
                  cleanString(
                    variant?.sku ||
                      variant?.SKU ||
                      variant?.variantSKU ||
                      variant?.variantSku ||
                      variant?.code ||
                      ""
                  ).toLowerCase();

                return (
                  variantSKU ===
                  cleanSKU
                );
              }
            );

          if (skuMatch) {
            return skuMatch;
          }
        }

        if (
          !cleanSize &&
          !cleanColor
        ) {
          return null;
        }

        const match =
          variants.find(
            (variant: any) => {
              if (
                !variant ||
                typeof variant === "string"
              ) {
                return false;
              }

              const variantSize =
                cleanString(
                  variant?.size ||
                    variant?.capacity ||
                    variant?.storage ||
                    variant?.attributes?.size ||
                    variant?.attributes?.capacity ||
                    variant?.attributes?.storage ||
                    ""
                ).toLowerCase();

              const variantColor =
                cleanString(
                  variant?.color ||
                    variant?.attributes?.color ||
                    ""
                ).toLowerCase();

              const sizeMatch =
                !cleanSize ||
                variantSize ===
                  cleanSize;

              const colorMatch =
                !cleanColor ||
                variantColor ===
                  cleanColor;

              return (
                sizeMatch &&
                colorMatch
              );
            }
          );

        return match || null;
      },
      [getVariantsList]
    );

  // ====================================================
  // VARIANT PRICE
  // ====================================================

  const getVariantPrice =
    useCallback(
      (
        product: any,
        variant?: CartVariantData | null
      ): number => {
        const discountPrice = Number(
          variant?.discountPrice ?? product?.discountPrice ?? 0
        );
        const regularPrice = Number(
          variant?.price ?? product?.price ?? product?.pricing?.price ?? 0
        );

        if (discountPrice > 0 && discountPrice < regularPrice) {
          return discountPrice;
        }

        return regularPrice > 0 ? regularPrice : discountPrice;
      },
      []
    );

  // ====================================================
  // VARIANT STOCK
  // ====================================================

  const getVariantStock =
    useCallback(
      (
        product: any,
        variant?: CartVariantData | null
      ): number => {
        if (
          variant?.stock !==
            undefined &&
          variant?.stock !== null
        ) {
          return Number(
            variant.stock
          );
        }

        if (
          product?.stock !==
            undefined
        ) {
          return Number(
            product.stock
          );
        }

        if (
          product?.inventory?.stock !==
            undefined
        ) {
          return Number(
            product.inventory.stock
          );
        }

        return 0;
      },
      []
    );

  // ====================================================
  // LOCAL VARIANT METADATA
  // ====================================================

  type VariantMetadata = {
    productId: string;
    selectedSize?: string;
    selectedColor?: string;
    selectedVariantSKU?: string;
    variantId?: string;
    price?: number;
    stock?: number;
    variant?: CartVariantData | null;
  };

  const getVariantMetadata =
    useCallback(
      (): VariantMetadata[] => {
        if (
          typeof window ===
          "undefined"
        ) {
          return [];
        }

        try {
          return JSON.parse(
            localStorage.getItem(
              VARIANT_STORAGE_KEY
            ) || "[]"
          );
        } catch {
          return [];
        }
      },
      []
    );

  const saveVariantMetadata =
    useCallback(
      (
        metadata: VariantMetadata
      ) => {
        if (
          typeof window ===
          "undefined"
        ) {
          return;
        }

        try {
          const existing =
            getVariantMetadata();

          const key =
            [
              metadata.productId,
              metadata.selectedSize || "",
              metadata.selectedColor || "",
              metadata.selectedVariantSKU || "",
            ].join("__");

          const filtered =
            existing.filter(
              (item) => {
                const itemKey =
                  [
                    item.productId,
                    item.selectedSize || "",
                    item.selectedColor || "",
                    item.selectedVariantSKU || "",
                  ].join("__");

                return (
                  itemKey !== key
                );
              }
            );

          filtered.push(
            metadata
          );

          localStorage.setItem(
            VARIANT_STORAGE_KEY,
            JSON.stringify(
              filtered
            )
          );
        } catch (error) {
          console.log(
            "SAVE VARIANT METADATA ERROR:",
            error
          );
        }
      },
      [getVariantMetadata]
    );

  // ====================================================
  // FIND LOCAL VARIANT
  // ====================================================

  const findLocalVariantMetadata =
    useCallback(
      (
        productId: string,
        item: any
      ): VariantMetadata | null => {
        const metadata =
          getVariantMetadata();

        if (!metadata.length) {
          return null;
        }

        const selectedSKU =
          cleanString(
            item?.selectedVariantSKU ||
              item?.variant?.sku ||
              item?.sku ||
              ""
          );

        const selectedSize =
          cleanString(
            item?.selectedSize ||
              item?.size ||
              item?.variant?.size ||
              item?.variant?.capacity ||
              item?.variant?.storage ||
              ""
          );

        const selectedColor =
          cleanString(
            item?.selectedColor ||
              item?.color ||
              item?.variant?.color ||
              ""
          );

        if (selectedSKU) {
          const skuMatch =
            metadata.find(
              (meta) =>
                String(
                  meta.productId
                ) ===
                  String(
                    productId
                  ) &&
                cleanString(
                  meta.selectedVariantSKU
                ).toLowerCase() ===
                  selectedSKU.toLowerCase()
            );

          if (skuMatch) {
            return skuMatch;
          }
        }

        const sizeColorMatch =
          metadata.find(
            (meta) =>
              String(
                meta.productId
              ) ===
                String(
                  productId
                ) &&
              cleanString(
                meta.selectedSize
              ).toLowerCase() ===
                selectedSize.toLowerCase() &&
              cleanString(
                meta.selectedColor
              ).toLowerCase() ===
                selectedColor.toLowerCase()
          );

        return (
          sizeColorMatch ||
          null
        );
      },
      [getVariantMetadata]
    );

  // ====================================================
  // EXTRACT VARIANT DATA
  // ====================================================

  const extractVariantData =
    useCallback(
      (
        item: any,
        product: any
      ) => {
        const productId =
          getProductId(
            item?.product
          ) ||
          getProductId(product);

        const localMetadata =
          productId
            ? findLocalVariantMetadata(
                productId,
                item
              )
            : null;

        const backendVariant =
          item?.variant ||
          null;

        const selectedSize =
          cleanString(
            item?.selectedSize ||
              item?.size ||
              backendVariant?.size ||
              backendVariant?.capacity ||
              backendVariant?.storage ||
              localMetadata?.selectedSize ||
              ""
          );

        const selectedColor =
          cleanString(
            item?.selectedColor ||
              item?.color ||
              backendVariant?.color ||
              localMetadata?.selectedColor ||
              ""
          );

        const selectedVariantSKU =
          cleanString(
            item?.selectedVariantSKU ||
              backendVariant?.sku ||
              localMetadata?.selectedVariantSKU ||
              ""
          );

        return {
          selectedSize,
          selectedColor,
          selectedVariantSKU,
          backendVariant,
          localMetadata,
        };
      },
      [
        getProductId,
        findLocalVariantMetadata,
      ]
    );

  // ====================================================
  // CREATE VARIANT KEY
  // ====================================================

  const getVariantKey =
    useCallback(
      (
        productId: string,
        selectedSize: string,
        selectedColor: string,
        selectedSKU: string
      ) => {
        const sku =
          cleanString(
            selectedSKU
          ).toLowerCase();

        const size =
          cleanString(
            selectedSize
          ).toLowerCase();

        const color =
          cleanString(
            selectedColor
          ).toLowerCase();

        if (sku) {
          return `${productId}__sku__${sku}`;
        }

        return `${productId}__size__${size}__color__${color}`;
      },
      []
    );

  // ====================================================
  // NORMALIZE CART ITEMS
  // ====================================================

  const normalizeCartItems =
    useCallback(
      (items: any[] = []) => {
        const mergedMap =
          new Map<string, any>();

        for (
          const item of items
        ) {
          const product =
            typeof item?.product ===
              "object" &&
            item?.product !== null
              ? item.product
              : {};

          const productId =
            getProductId(
              item?.product
            );

          if (!productId) {
            continue;
          }

          const {
            selectedSize,
            selectedColor,
            selectedVariantSKU,
            backendVariant,
            localMetadata,
          } =
            extractVariantData(
              item,
              product
            );

          let finalVariant =
            backendVariant ||
            localMetadata?.variant ||
            null;

          if (!finalVariant) {
            finalVariant =
              findMatchedVariant(
                product,
                selectedSize,
                selectedColor,
                selectedVariantSKU
              );
          }

          const variantStock =
            getVariantStock(
              product,
              finalVariant
            );

          const properVariantPrice = getVariantPrice(product, finalVariant);
          const itemPrice = properVariantPrice > 0 ? properVariantPrice : Number(item?.price || 0);

          const quantity =
            Number(
              item?.quantity || 1
            );

          const variantId =
            finalVariant?._id ||
            finalVariant?.id ||
            localMetadata?.variantId ||
            null;

          const formattedProduct =
            {
              ...product,

              _id:
                product?._id ||
                productId,

              name:
                product?.name ||
                "Product",

              images:
                product?.images || [],

              price:
                itemPrice,

              stock:
                variantStock,

              selectedSize,

              selectedColor,

              selectedVariantSKU,

              variantId,

              variant:
                finalVariant,
            };

          const uniqueKey =
            getVariantKey(
              productId,
              selectedSize,
              selectedColor,
              selectedVariantSKU
            );

          const normalizedItem =
            {
              ...item,

              product:
                formattedProduct,

              quantity,

              price:
                itemPrice,

              size:
                selectedSize,

              color:
                selectedColor,

              selectedSize,

              selectedColor,

              selectedVariantSKU,

              variant:
                finalVariant,

              variantId,

              stock:
                variantStock,
            };

          if (
            mergedMap.has(
              uniqueKey
            )
          ) {
            const existing =
              mergedMap.get(
                uniqueKey
              );

            existing.quantity =
              Number(
                existing.quantity ||
                  0
              ) + quantity;
          } else {
            mergedMap.set(
              uniqueKey,
              normalizedItem
            );
          }
        }

        return Array.from(
          mergedMap.values()
        );
      },
      [
        getProductId,
        extractVariantData,
        findMatchedVariant,
        getVariantStock,
        getVariantPrice,
        getVariantKey,
      ]
    );

  // ====================================================
  // UPDATE CART STATE
  // ====================================================

  const updateCartState =
    useCallback(
      (data: any) => {
        const rawCart =
          data?.cart ||
          data || {
            items: [],
          };

        const formattedItems =
          normalizeCartItems(
            rawCart?.items || []
          );

        const total =
          formattedItems.reduce(
            (
              sum: number,
              item: any
            ) =>
              sum +
              Number(
                item?.price || 0
              ) *
                Number(
                  item?.quantity || 0
                ),
            0
          );

        const totalItems =
          formattedItems.reduce(
            (
              sum: number,
              item: any
            ) =>
              sum +
              Number(
                item?.quantity || 0
              ),
            0
          );

        setCart({
          ...rawCart,

          items:
            formattedItems,

          total,

          totalItems,
        });
      },
      [normalizeCartItems]
    );

  // ====================================================
  // GUEST CART SAVE
  // ====================================================

  const saveGuestCart =
    useCallback(
      (items: any[]) => {
        if (
          typeof window ===
          "undefined"
        ) {
          return;
        }

        localStorage.setItem(
          GUEST_CART_KEY,
          JSON.stringify(items)
        );
      },
      []
    );

  // ====================================================
  // GET GUEST CART
  // ====================================================

  const getGuestCart =
    useCallback(() => {
      if (
        typeof window ===
        "undefined"
      ) {
        return [];
      }

      try {
        const raw =
          JSON.parse(
            localStorage.getItem(
              GUEST_CART_KEY
            ) || "[]"
          );

        return normalizeCartItems(
          raw
        );
      } catch {
        return [];
      }
    }, [normalizeCartItems]);

  // ====================================================
  // REFRESH CART
  // ====================================================

  const refreshCart =
    useCallback(
      async () => {
        try {
          setLoading(true);

          const token =
            typeof window !==
            "undefined"
              ? localStorage.getItem(
                  "token"
                )
              : null;

          if (token) {
            const data =
              await getCart();

            updateCartState(
              data
            );

            const guestItems =
              getGuestCart();

            if (
              guestItems.length >
              0
            ) {
              try {
                const mergedData =
                  await mergeCartAPI(
                    guestItems
                  );

                if (
                  mergedData?.cart
                ) {
                  updateCartState(
                    mergedData
                  );
                }

                localStorage.removeItem(
                  GUEST_CART_KEY
                );
              } catch (
                mergeError
              ) {
                console.log(
                  "MERGE GUEST CART ERROR:",
                  mergeError
                );
              }
            }
          } else {
            const guestItems =
              getGuestCart();

            saveGuestCart(
              guestItems
            );

            updateCartState({
              items:
                guestItems,
            });
          }
        } catch (error) {
          console.log(
            "REFRESH CART ERROR:",
            error
          );

          setCart({
            items: [],
            total: 0,
            totalItems: 0,
          });
        } finally {
          setLoading(false);
        }
      },
      [
        updateCartState,
        getGuestCart,
        saveGuestCart,
      ]
    );

  // ====================================================
  // AUTH CHANGE
  // ====================================================

  useEffect(() => {
    refreshCart();
  }, [
    authToken,
    refreshCart,
  ]);

  useEffect(() => {
    const syncAuthToken =
      () => {
        const token =
          localStorage.getItem(
            "token"
          );

        setAuthToken(token);
      };

    window.addEventListener(
      "storage",
      syncAuthToken
    );

    window.addEventListener(
      "focus",
      syncAuthToken
    );

    window.addEventListener(
      "auth-change",
      syncAuthToken
    );

    syncAuthToken();

    return () => {
      window.removeEventListener(
        "storage",
        syncAuthToken
      );

      window.removeEventListener(
        "focus",
        syncAuthToken
      );

      window.removeEventListener(
        "auth-change",
        syncAuthToken
      );
    };
  }, []);

  // ====================================================
  // ADD ITEM
  // ====================================================

  const addItem =
    async (
      product: any,
      quantity: number = 1
    ) => {
      try {
        setCartLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        const productId =
          getProductId(product);

        if (!productId) {
          console.log(
            "ADD CART ERROR: Product ID missing"
          );

          return;
        }

        const selectedSize =
          cleanString(
            product?.selectedSize ||
              product?.size ||
              product?.capacity ||
              product?.storage ||
              product?.variant?.size ||
              product?.variant?.capacity ||
              product?.variant?.storage ||
              ""
          );

        const selectedColor =
          cleanString(
            product?.selectedColor ||
              product?.color ||
              product?.variant?.color ||
              ""
          );

        const selectedVariantSKU =
          cleanString(
            product?.selectedVariantSKU ||
              product?.variantSku ||
              product?.variantSKU ||
              product?.variant?.sku ||
              ""
          );

        const matchedVariant =
          findMatchedVariant(
            product,
            selectedSize,
            selectedColor,
            selectedVariantSKU
          );

        const finalVariant =
          product?.variant ||
          matchedVariant ||
          null;

        const itemPrice = getVariantPrice(product, finalVariant);

        const variantStock =
          getVariantStock(
            product,
            finalVariant
          );

        const variantId =
          product?.variantId ||
          product?.selectedVariantId ||
          finalVariant?._id ||
          finalVariant?.id ||
          "";

        saveVariantMetadata({
          productId:
            String(productId),

          selectedSize,

          selectedColor,

          selectedVariantSKU,

          variantId:
            String(
              variantId || ""
            ),

          price:
            itemPrice,

          stock:
            variantStock,

          variant:
            finalVariant,
        });

        if (token) {
          const variantData: CartItemVariant =
            {
              size:
                selectedSize,

              color:
                selectedColor,

              selectedSize,

              selectedColor,

              selectedVariantSKU,

              variant:
                finalVariant,
            };

          const data =
            await addCartAPI(
              productId,
              quantity,
              variantData
            );

          updateCartState(
            data
          );
        } else {
          const existingItems =
            getGuestCart();

          const newItem = {
            product:
              typeof product ===
              "object"
                ? product
                : {
                    _id:
                      productId,

                    name:
                      "Product",

                    images:
                      [],

                    price:
                      itemPrice,

                    stock:
                      variantStock,
                  },

            quantity,

            price:
              itemPrice,

            size:
              selectedSize,

            color:
              selectedColor,

            selectedSize,

            selectedColor,

            selectedVariantSKU,

            variant:
              finalVariant,

            variantId,

            stock:
              variantStock,
          };

          const newKey =
            getVariantKey(
              String(
                productId
              ),
              selectedSize,
              selectedColor,
              selectedVariantSKU
            );

          const existingIndex =
            existingItems.findIndex(
              (item: any) => {
                const itemProductId =
                  getProductId(
                    item?.product
                  );

                const itemSize =
                  cleanString(
                    item?.selectedSize
                  );

                const itemColor =
                  cleanString(
                    item?.selectedColor
                  );

                const itemSKU =
                  cleanString(
                    item?.selectedVariantSKU
                  );

                const itemKey =
                  getVariantKey(
                    String(
                      itemProductId
                    ),
                    itemSize,
                    itemColor,
                    itemSKU
                  );

                return (
                  itemKey ===
                  newKey
                );
              }
            );

          if (
            existingIndex >=
            0
          ) {
            existingItems[
              existingIndex
            ].quantity =
              Number(
                existingItems[
                  existingIndex
                ].quantity || 0
              ) + quantity;
          } else {
            existingItems.push(
              newItem
            );
          }

          saveGuestCart(
            existingItems
          );

          updateCartState({
            items:
              existingItems,
          });
        }

        window.dispatchEvent(
          new Event(
            "cart:updated"
          )
        );
      } catch (error) {
        console.log(
          "ADD CART ERROR:",
          error
        );
      } finally {
        setCartLoading(false);
      }
    };

  // ====================================================
  // UPDATE ITEM
  // ====================================================

  const updateItem =
    async (
      productId: string,
      quantity: number,
      variant: CartItemVariant = {}
    ) => {
      try {
        setCartLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        let selectedSize =
          cleanString(
            variant?.selectedSize ||
              variant?.size ||
              variant?.variant?.size ||
              variant?.variant?.capacity ||
              variant?.variant?.storage ||
              ""
          );

        let selectedColor =
          cleanString(
            variant?.selectedColor ||
              variant?.color ||
              variant?.variant?.color ||
              ""
          );

        let selectedSKU =
          cleanString(
            variant?.selectedVariantSKU ||
              variant?.variant?.sku ||
              ""
          );

        if (
          !selectedSize &&
          !selectedColor &&
          !selectedSKU
        ) {
          const currentItem =
            cart?.items?.find(
              (item: any) =>
                String(
                  getProductId(
                    item?.product
                  )
                ) ===
                String(
                  productId
                )
            );

          if (currentItem) {
            selectedSize =
              cleanString(
                currentItem?.selectedSize
              );

            selectedColor =
              cleanString(
                currentItem?.selectedColor
              );

            selectedSKU =
              cleanString(
                currentItem?.selectedVariantSKU
              );
          }
        }

        if (token) {
          const data =
            await updateCartAPI(
              productId,
              quantity,
              {
                size:
                  selectedSize,

                color:
                  selectedColor,

                selectedSize,

                selectedColor,

                selectedVariantSKU:
                  selectedSKU,
              }
            );

          updateCartState(
            data
          );
        } else {
          const items =
            getGuestCart();

          const targetKey =
            getVariantKey(
              String(
                productId
              ),
              selectedSize,
              selectedColor,
              selectedSKU
            );

          const updatedItems =
            items.map(
              (item: any) => {
                const itemProductId =
                  getProductId(
                    item?.product
                  );

                const itemKey =
                  getVariantKey(
                    String(
                      itemProductId
                    ),
                    cleanString(
                      item?.selectedSize
                    ),
                    cleanString(
                      item?.selectedColor
                    ),
                    cleanString(
                      item?.selectedVariantSKU
                    )
                  );

                if (
                  itemKey ===
                  targetKey
                ) {
                  return {
                    ...item,

                    quantity:
                      Math.max(
                        1,
                        Number(
                          quantity
                        )
                      ),
                  };
                }

                return item;
              }
            );

          saveGuestCart(
            updatedItems
          );

          updateCartState({
            items:
              updatedItems,
          });
        }

        window.dispatchEvent(
          new Event(
            "cart:updated"
          )
        );
      } catch (error) {
        console.log(
          "UPDATE CART ERROR:",
          error
        );
      } finally {
        setCartLoading(false);
      }
    };

  // ====================================================
  // REMOVE ITEM
  // ====================================================

  const removeItem =
    async (
      productId: string,
      variant: CartItemVariant = {}
    ) => {
      try {
        setCartLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        let selectedSize =
          cleanString(
            variant?.selectedSize ||
              variant?.size ||
              variant?.variant?.size ||
              variant?.variant?.capacity ||
              variant?.variant?.storage ||
              ""
          );

        let selectedColor =
          cleanString(
            variant?.selectedColor ||
              variant?.color ||
              variant?.variant?.color ||
              ""
          );

        let selectedSKU =
          cleanString(
            variant?.selectedVariantSKU ||
              variant?.variant?.sku ||
              ""
          );

        if (
          !selectedSize &&
          !selectedColor &&
          !selectedSKU
        ) {
          const currentItem =
            cart?.items?.find(
              (item: any) =>
                String(
                  getProductId(
                    item?.product
                  )
                ) ===
                String(
                  productId
                )
            );

          if (currentItem) {
            selectedSize =
              cleanString(
                currentItem?.selectedSize
              );

            selectedColor =
              cleanString(
                currentItem?.selectedColor
              );

            selectedSKU =
              cleanString(
                currentItem?.selectedVariantSKU
              );
          }
        }

        if (token) {
          const data =
            await removeCartAPI(
              productId,
              {
                size:
                  selectedSize,

                color:
                  selectedColor,

                selectedSize,

                selectedColor,

                selectedVariantSKU:
                  selectedSKU,
              }
            );

          updateCartState(
            data
          );

          const metadata =
            getVariantMetadata();

          const filtered =
            metadata.filter(
              (item) => {
                if (
                  String(
                    item.productId
                  ) !==
                  String(
                    productId
                  )
                ) {
                  return true;
                }

                const sameSKU =
                  selectedSKU &&
                  cleanString(
                    item.selectedVariantSKU
                  ).toLowerCase() ===
                    selectedSKU.toLowerCase();

                const sameSizeColor =
                  cleanString(
                    item.selectedSize
                  ).toLowerCase() ===
                    selectedSize.toLowerCase() &&
                  cleanString(
                    item.selectedColor
                  ).toLowerCase() ===
                    selectedColor.toLowerCase();

                return !(
                  sameSKU ||
                  sameSizeColor
                );
              }
            );

          localStorage.setItem(
            VARIANT_STORAGE_KEY,
            JSON.stringify(
              filtered
            )
          );
        } else {
          const items =
            getGuestCart();

          const targetKey =
            getVariantKey(
              String(
                productId
              ),
              selectedSize,
              selectedColor,
              selectedSKU
            );

          const filteredItems =
            items.filter(
              (item: any) => {
                const itemProductId =
                  getProductId(
                    item?.product
                  );

                const itemKey =
                  getVariantKey(
                    String(
                      itemProductId
                    ),
                    cleanString(
                      item?.selectedSize
                    ),
                    cleanString(
                      item?.selectedColor
                    ),
                    cleanString(
                      item?.selectedVariantSKU
                    )
                  );

                return (
                  itemKey !==
                  targetKey
                );
              }
            );

          saveGuestCart(
            filteredItems
          );

          updateCartState({
            items:
              filteredItems,
          });
        }

        window.dispatchEvent(
          new Event(
            "cart:updated"
          )
        );
      } catch (error) {
        console.log(
          "REMOVE CART ERROR:",
          error
        );
      } finally {
        setCartLoading(false);
      }
    };

  // ====================================================
  // CLEAR CART
  // ====================================================

  const clearCart =
    async () => {
      try {
        setCartLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        if (token) {
          await clearCartAPI();
        }

        localStorage.removeItem(
          GUEST_CART_KEY
        );

        localStorage.removeItem(
          VARIANT_STORAGE_KEY
        );

        setCart({
          items: [],
          total: 0,
          totalItems: 0,
        });

        window.dispatchEvent(
          new Event(
            "cart:updated"
          )
        );
      } catch (error) {
        console.log(
          "CLEAR CART ERROR:",
          error
        );
      } finally {
        setCartLoading(false);
      }
    };

  // ====================================================
  // TOTAL ITEMS
  // ====================================================

  const totalItems =
    cart?.items?.reduce(
      (
        total: number,
        item: any
      ) =>
        total +
        Number(
          item?.quantity || 0
        ),
      0
    ) || 0;

  // ====================================================
  // PROVIDER
  // ====================================================

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

// ======================================================
// HOOK
// ======================================================

export default function useCartContext() {
  const context =
    useContext(
      CartContext
    );

  if (!context) {
    throw new Error(
      "useCart must be inside CartProvider"
    );
  }

  return context;
}
