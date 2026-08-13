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

const VARIANT_STORAGE_KEY = "cart_variant_metadata";

/* =========================================================
   SAFE STRING HELPER
========================================================= */

const cleanString = (value: any): string => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

/* =========================================================
   VARIANT METADATA TYPE
========================================================= */

type VariantMetadata = {
  productId: string;
  selectedSize?: string;
  selectedColor?: string;
  selectedVariantSKU?: string;
  variantId?: string;
  price?: number;
  stock?: number;
};

/* =========================================================
   PROVIDER
========================================================= */

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<any>({
    items: [],
  });

  const [loading, setLoading] = useState(true);

  const [cartLoading, setCartLoading] =
    useState(false);

  const [authToken, setAuthToken] =
    useState<string | null>(
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null
    );

  /* =======================================================
     PRODUCT ID
  ======================================================= */

  const getProductId = useCallback((value: any) => {
    if (!value) {
      return null;
    }

    if (typeof value === "string") {
      return value;
    }

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

  /* =======================================================
     GET VARIANT LIST
  ======================================================= */

  const getVariantsList = useCallback((prod: any) => {
    const rawVariants =
      prod?.variants ||
      prod?.itemVariants ||
      prod?.productVariants ||
      prod?.options ||
      prod?.attributes ||
      prod?.sizes ||
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

  /* =======================================================
     FIND MATCHED VARIANT
  ======================================================= */

  const findMatchedVariant = useCallback(
    (
      prod: any,
      size: string = "",
      color: string = "",
      sku: string = ""
    ) => {
      const variantsList =
        getVariantsList(prod);

      if (!variantsList.length) {
        return null;
      }

      const cleanSize =
        cleanString(size).toLowerCase();

      const cleanColor =
        cleanString(color).toLowerCase();

      const cleanSku =
        cleanString(sku).toLowerCase();

      /* -----------------------------------------------
         FIRST TRY SKU
      ------------------------------------------------ */

      if (cleanSku) {
        const skuMatch = variantsList.find(
          (v: any) => {
            if (!v || typeof v === "string") {
              return false;
            }

            const variantSku =
              cleanString(
                v.sku ||
                  v.variantSku ||
                  v.code
              ).toLowerCase();

            return (
              variantSku &&
              variantSku === cleanSku
            );
          }
        );

        if (skuMatch) {
          return skuMatch;
        }
      }

      /* -----------------------------------------------
         SIZE + COLOR
      ------------------------------------------------ */

      return (
        variantsList.find((v: any) => {
          if (!v) {
            return false;
          }

          if (typeof v === "string") {
            return (
              !cleanColor &&
              cleanString(v)
                .toLowerCase() === cleanSize
            );
          }

          const vSize =
            cleanString(
              v.size ||
                v.capacity ||
                v.storage ||
                v.ram ||
                v.attributes?.size ||
                v.attributes?.capacity ||
                v.attributes?.storage ||
                v.options?.find?.(
                  (o: any) =>
                    ["size", "storage", "capacity"]
                      .includes(
                        cleanString(
                          o?.name
                        ).toLowerCase()
                      )
                )?.value
            ).toLowerCase();

          const vColor =
            cleanString(
              v.color ||
                v.attributes?.color ||
                v.options?.find?.(
                  (o: any) =>
                    cleanString(
                      o?.name
                    ).toLowerCase() ===
                    "color"
                )?.value
            ).toLowerCase();

          const sizeMatch =
            !cleanSize ||
            vSize === cleanSize;

          const colorMatch =
            !cleanColor ||
            vColor === cleanColor;

          return (
            sizeMatch &&
            colorMatch
          );
        }) || null
      );
    },
    [getVariantsList]
  );

  /* =======================================================
     VARIANT STOCK
  ======================================================= */

  const getVariantStock = useCallback(
    (
      prod: any,
      size: string = "",
      color: string = "",
      sku: string = ""
    ) => {
      const matched =
        findMatchedVariant(
          prod,
          size,
          color,
          sku
        );

      if (
        matched &&
        (
          matched.stock !== undefined ||
          matched.quantity !== undefined
        )
      ) {
        return Number(
          matched.stock !== undefined
            ? matched.stock
            : matched.quantity
        );
      }

      if (
        prod?.stock !== undefined
      ) {
        return Number(prod.stock);
      }

      if (
        prod?.inventory?.stock !== undefined
      ) {
        return Number(
          prod.inventory.stock
        );
      }

      return 10;
    },
    [findMatchedVariant]
  );

  /* =======================================================
     VARIANT PRICE
  ======================================================= */

  const getVariantPrice = useCallback(
    (
      prod: any,
      size: string = "",
      color: string = "",
      sku: string = ""
    ) => {
      const matched =
        findMatchedVariant(
          prod,
          size,
          color,
          sku
        );

      if (matched) {
        const discountPrice =
          Number(
            matched.discountPrice || 0
          );

        const variantPrice =
          Number(
            matched.price || 0
          );

        if (discountPrice > 0) {
          return discountPrice;
        }

        if (variantPrice > 0) {
          return variantPrice;
        }
      }

      const productDiscount =
        Number(
          prod?.discountPrice || 0
        );

      if (productDiscount > 0) {
        return productDiscount;
      }

      return Number(
        prod?.price ||
          prod?.pricing?.price ||
          0
      );
    },
    [findMatchedVariant]
  );

  /* =======================================================
     LOCAL VARIANT METADATA
  ======================================================= */

  const getVariantMetadata =
    useCallback((): VariantMetadata[] => {
      if (
        typeof window === "undefined"
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
    }, []);

  const saveVariantMetadata =
    useCallback(
      (
        metadata: VariantMetadata
      ) => {
        if (
          typeof window === "undefined"
        ) {
          return;
        }

        try {
          const existing =
            getVariantMetadata();

          const key =
            `${metadata.productId}-${metadata.selectedSize || ""}-${metadata.selectedColor || ""}-${metadata.selectedVariantSKU || ""}`;

          const filtered =
            existing.filter(
              (item) => {
                const itemKey =
                  `${item.productId}-${item.selectedSize || ""}-${item.selectedColor || ""}-${item.selectedVariantSKU || ""}`;

                return (
                  itemKey !== key
                );
              }
            );

          filtered.push(metadata);

          localStorage.setItem(
            VARIANT_STORAGE_KEY,
            JSON.stringify(filtered)
          );
        } catch (error) {
          console.log(
            "SAVE VARIANT METADATA ERROR",
            error
          );
        }
      },
      [getVariantMetadata]
    );

  /* =======================================================
     FIND LOCAL VARIANT METADATA
  ======================================================= */

  const findLocalVariantMetadata =
    useCallback(
      (
        productId: string,
        item: any
      ) => {
        const metadata =
          getVariantMetadata();

        if (!metadata.length) {
          return null;
        }

        const selectedSize =
          cleanString(
            item?.selectedSize ||
              item?.size ||
              item?.variantSize
          );

        const selectedColor =
          cleanString(
            item?.selectedColor ||
              item?.color ||
              item?.variantColor
          );

        const selectedSKU =
          cleanString(
            item?.selectedVariantSKU ||
              item?.variantSku ||
              item?.sku
          );

        /* SKU first */

        if (selectedSKU) {
          const skuMatch =
            metadata.find(
              (m) =>
                m.productId ===
                  productId &&
                m.selectedVariantSKU &&
                m.selectedVariantSKU
                  .toLowerCase() ===
                  selectedSKU.toLowerCase()
            );

          if (skuMatch) {
            return skuMatch;
          }
        }

        /* Size + Color */

        return (
          metadata.find(
            (m) =>
              m.productId ===
                productId &&
              cleanString(
                m.selectedSize
              ).toLowerCase() ===
                selectedSize.toLowerCase() &&
              cleanString(
                m.selectedColor
              ).toLowerCase() ===
                selectedColor.toLowerCase()
          ) || null
        );
      },
      [getVariantMetadata]
    );

  /* =======================================================
     GET ITEM VARIANT DATA
  ======================================================= */

  const extractVariantData =
    useCallback(
      (
        item: any,
        prod: any
      ) => {
        const productId =
          getProductId(prod) ||
          getProductId(item?.product);

        const localMetadata =
          productId
            ? findLocalVariantMetadata(
                productId,
                item
              )
            : null;

        const selectedSize =
          cleanString(
            item?.selectedSize ||
              item?.size ||
              item?.variantSize ||
              item?.capacity ||
              item?.storage ||
              item?.attributes?.size ||
              prod?.selectedSize ||
              prod?.size ||
              prod?.capacity ||
              prod?.storage ||
              prod?.attributes?.size ||
              localMetadata?.selectedSize ||
              ""
          );

        const selectedColor =
          cleanString(
            item?.selectedColor ||
              item?.color ||
              item?.variantColor ||
              item?.attributes?.color ||
              prod?.selectedColor ||
              prod?.color ||
              prod?.attributes?.color ||
              localMetadata?.selectedColor ||
              ""
          );

        const selectedVariantSKU =
          cleanString(
            item?.selectedVariantSKU ||
              item?.variantSku ||
              item?.variantSKU ||
              item?.sku ||
              localMetadata?.selectedVariantSKU ||
              ""
          );

        return {
          selectedSize,
          selectedColor,
          selectedVariantSKU,
          localMetadata,
        };
      },
      [
        getProductId,
        findLocalVariantMetadata,
      ]
    );

  /* =======================================================
     NORMALIZE CART ITEMS
  ======================================================= */

  const normalizeCartItems =
    useCallback(
      (items: any[] = []) => {
        const mergedMap =
          new Map();

        (items || []).forEach(
          (item: any) => {
            const prod =
              typeof item?.product ===
                "object" &&
              item?.product !== null
                ? item.product
                : {};

            const prodId =
              getProductId(
                item?.product
              );

            if (!prodId) {
              return;
            }

            const {
              selectedSize,
              selectedColor,
              selectedVariantSKU,
            } =
              extractVariantData(
                item,
                prod
              );

            const matchedVariant =
              findMatchedVariant(
                prod,
                selectedSize,
                selectedColor,
                selectedVariantSKU
              );

            const variantStock =
              getVariantStock(
                prod,
                selectedSize,
                selectedColor,
                selectedVariantSKU
              );

            const variantPrice =
              getVariantPrice(
                prod,
                selectedSize,
                selectedColor,
                selectedVariantSKU
              );

            const itemStock =
              item?.stock !== undefined
                ? Number(item.stock)
                : variantStock;

            const itemPrice =
              Number(
                item?.price ||
                  variantPrice ||
                  prod?.discountPrice ||
                  prod?.price ||
                  0
              );

            const itemQty =
              Number(
                item?.quantity || 1
              );

            const formattedProduct =
              {
                ...prod,

                _id:
                  prod?._id ||
                  prodId,

                name:
                  prod?.name ||
                  "Product",

                images:
                  prod?.images || [],

                price:
                  itemPrice,

                stock:
                  itemStock,

                /* Keep selected variant inside product too */

                selectedSize,

                selectedColor,

                selectedVariantSKU,

                variantId:
                  matchedVariant?._id ||
                  matchedVariant?.id ||
                  null,
              };

            /*
             * IMPORTANT:
             *
             * Same product + different variant
             * should be different cart entries.
             */

            const uniqueKey =
              [
                prodId,
                selectedSize
                  .toLowerCase(),
                selectedColor
                  .toLowerCase(),
                selectedVariantSKU
                  .toLowerCase(),
              ].join("-");

            if (
              mergedMap.has(
                uniqueKey
              )
            ) {
              const existing =
                mergedMap.get(
                  uniqueKey
                );

              existing.quantity +=
                itemQty;
            } else {
              mergedMap.set(
                uniqueKey,
                {
                  ...item,

                  product:
                    formattedProduct,

                  selectedSize,

                  selectedColor,

                  selectedVariantSKU,

                  stock:
                    itemStock,

                  price:
                    itemPrice,

                  quantity:
                    itemQty,

                  variantId:
                    matchedVariant?._id ||
                    matchedVariant?.id ||
                    null,
                }
              );
            }
          }
        );

        return Array.from(
          mergedMap.values()
        ).map(
          (entry: any) => ({
            ...entry,

            quantity:
              Number(
                entry.quantity || 1
              ),

            price:
              Number(
                entry.price || 0
              ),
          })
        );
      },
      [
        getProductId,
        extractVariantData,
        findMatchedVariant,
        getVariantStock,
        getVariantPrice,
      ]
    );

  /* =======================================================
     UPDATE CART STATE
  ======================================================= */

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
            rawCart.items || []
          );

        const total =
          formattedItems.reduce(
            (
              sum: number,
              item: any
            ) =>
              sum +
              Number(
                item.price || 0
              ) *
                Number(
                  item.quantity || 0
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
                item.quantity || 0
              ),
            0
          );

        setCart(
          (prev: any) => ({
            ...prev,

            ...rawCart,

            items:
              formattedItems,

            total,

            totalItems,
          })
        );
      },
      [normalizeCartItems]
    );

  /* =======================================================
     GUEST CART
  ======================================================= */

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
          "guestCart",
          JSON.stringify(items)
        );
      },
      []
    );

  const normalizeGuestCartItems =
    useCallback(
      (items: any[] = []) => {
        const mergedMap =
          new Map();

        (items || []).forEach(
          (item: any) => {
            const product =
              item?.product || {};

            const productId =
              getProductId(
                product
              );

            if (!productId) {
              return;
            }

            const {
              selectedSize,
              selectedColor,
              selectedVariantSKU,
            } =
              extractVariantData(
                item,
                product
              );

            const quantity =
              Number(
                item.quantity || 1
              );

            const variantStock =
              item?.stock !== undefined
                ? Number(item.stock)
                : getVariantStock(
                    product,
                    selectedSize,
                    selectedColor,
                    selectedVariantSKU
                  );

            const variantPrice =
              getVariantPrice(
                product,
                selectedSize,
                selectedColor,
                selectedVariantSKU
              );

            const price =
              Number(
                item?.price ||
                  variantPrice ||
                  0
              );

            const uniqueKey =
              [
                productId,
                selectedSize
                  .toLowerCase(),
                selectedColor
                  .toLowerCase(),
                selectedVariantSKU
                  .toLowerCase(),
              ].join("-");

            if (
              mergedMap.has(
                uniqueKey
              )
            ) {
              const existing =
                mergedMap.get(
                  uniqueKey
                );

              existing.quantity +=
                quantity;
            } else {
              mergedMap.set(
                uniqueKey,
                {
                  ...item,

                  product,

                  selectedSize,

                  selectedColor,

                  selectedVariantSKU,

                  stock:
                    variantStock,

                  price,

                  quantity,
                }
              );
            }
          }
        );

        return Array.from(
          mergedMap.values()
        );
      },
      [
        getProductId,
        extractVariantData,
        getVariantStock,
        getVariantPrice,
      ]
    );

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
              "guestCart"
            ) || "[]"
          );

        return normalizeGuestCartItems(
          raw
        );
      } catch {
        return [];
      }
    }, [
      normalizeGuestCartItems,
    ]);

  /* =======================================================
     REFRESH CART
  ======================================================= */

  const refreshCart =
    useCallback(
      async () => {
        try {
          const token =
            localStorage.getItem(
              "token"
            );

          if (token) {
            const data =
              await getCart();

            updateCartState(
              data
            );

            /*
             * Merge guest cart
             */

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
                    mergedData.cart
                  );
                }

                localStorage.removeItem(
                  "guestCart"
                );

                window.dispatchEvent(
                  new Event(
                    "cart:updated"
                  )
                );
              } catch (
                mergeError
              ) {
                console.log(
                  "MERGE GUEST CART ERROR",
                  mergeError
                );
              }
            }
          } else {
            const items =
              getGuestCart();

            saveGuestCart(
              items
            );

            updateCartState({
              items,
            });
          }
        } catch (error) {
          console.log(
            "GET CART ERROR",
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

  /* =======================================================
     AUTH CHANGE
  ======================================================= */

  useEffect(() => {
    refreshCart();
  }, [
    authToken,
    refreshCart,
  ]);

  useEffect(() => {
    const syncAuthToken =
      () => {
        setAuthToken(
          localStorage.getItem(
            "token"
          )
        );
      };

    const handleAuthChange =
      () => {
        syncAuthToken();
      };

    syncAuthToken();

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
      handleAuthChange
    );

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
        handleAuthChange
      );
    };
  }, []);

  /* =======================================================
     ADD ITEM
  ======================================================= */

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
          typeof product ===
          "string"
            ? product
            : product?._id ||
              product?.productId;

        if (!productId) {
          console.log(
            "ADD CART ERROR: Product ID missing"
          );
          return;
        }

        /* -----------------------------------------------
           SELECTED VARIANT
        ------------------------------------------------ */

        const selectedSize =
          cleanString(
            product?.selectedSize ||
              product?.size ||
              product?.capacity ||
              product?.storage ||
              ""
          );

        const selectedColor =
          cleanString(
            product?.selectedColor ||
              product?.color ||
              ""
          );

        const selectedVariantSKU =
          cleanString(
            product?.selectedVariantSKU ||
              product?.variantSku ||
              product?.variantSKU ||
              ""
          );

        const variantId =
          product?.variantId ||
          product?.selectedVariantId ||
          "";

        /* -----------------------------------------------
           VARIANT
        ------------------------------------------------ */

        const matchedVariant =
          findMatchedVariant(
            product,
            selectedSize,
            selectedColor,
            selectedVariantSKU
          );

        const variantStock =
          getVariantStock(
            product,
            selectedSize,
            selectedColor,
            selectedVariantSKU
          );

        const itemPrice =
          Number(
            product?.price ||
              matchedVariant?.discountPrice ||
              matchedVariant?.price ||
              getVariantPrice(
                product,
                selectedSize,
                selectedColor,
                selectedVariantSKU
              ) ||
              0
          );

        /* -----------------------------------------------
           SAVE VARIANT METADATA LOCALLY
        ------------------------------------------------ */

        saveVariantMetadata({
          productId:
            String(productId),

          selectedSize,

          selectedColor,

          selectedVariantSKU,

          variantId:
            String(variantId || ""),

          price:
            itemPrice,

          stock:
            variantStock,
        });

        /* =================================================
           LOGGED IN USER
        ================================================= */

        if (token) {
          /*
           * Existing API is still:
           *
           * addCartAPI(productId, quantity)
           *
           * So we keep it unchanged here.
           *
           * Variant metadata is stored locally and merged
           * with the API cart response.
           */

          const data =
            await addCartAPI(
              productId,
              quantity
            );

          /*
           * Before updating cart state,
           * inject selected variant into returned item.
           */

          if (
            data?.cart?.items
          ) {
            const updatedItems =
              data.cart.items.map(
                (item: any) => {
                  const itemProductId =
                    getProductId(
                      item?.product
                    );

                  if (
                    String(
                      itemProductId
                    ) ===
                    String(
                      productId
                    )
                  ) {
                    return {
                      ...item,

                      selectedSize,

                      selectedColor,

                      selectedVariantSKU,

                      variantId,

                      price:
                        itemPrice ||
                        item.price,
                    };
                  }

                  return item;
                }
              );

            updateCartState({
              ...data,

              cart: {
                ...data.cart,

                items:
                  updatedItems,
              },
            });
          } else {
            updateCartState(
              data
            );
          }
        }

        /* =================================================
           GUEST USER
        ================================================= */

        else {
          const items =
            getGuestCart();

          const normalizedItems =
            [...items];

          const existingIndex =
            normalizedItems.findIndex(
              (item: any) => {
                const id =
                  getProductId(
                    item?.product
                  );

                return (
                  String(id) ===
                    String(
                      productId
                    ) &&
                  cleanString(
                    item?.selectedSize
                  ).toLowerCase() ===
                    selectedSize.toLowerCase() &&
                  cleanString(
                    item?.selectedColor
                  ).toLowerCase() ===
                    selectedColor.toLowerCase() &&
                  cleanString(
                    item?.selectedVariantSKU
                  ).toLowerCase() ===
                    selectedVariantSKU.toLowerCase()
                );
              }
            );

          if (
            existingIndex >=
            0
          ) {
            normalizedItems[
              existingIndex
            ].quantity +=
              quantity;
          } else {
            normalizedItems.push({
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

              selectedSize,

              selectedColor,

              selectedVariantSKU,

              variantId,

              stock:
                variantStock,

              price:
                itemPrice,

              quantity,
            });
          }

          saveGuestCart(
            normalizedItems
          );

          updateCartState({
            items:
              normalizedItems,
          });
        }

        window.dispatchEvent(
          new Event(
            "cart:updated"
          )
        );
      } catch (error) {
        console.log(
          "ADD CART ERROR",
          error
        );
      } finally {
        setCartLoading(false);
      }
    };

  /* =======================================================
     UPDATE ITEM
  ======================================================= */

  const updateItem =
    async (
      productId: string,
      quantity: number
    ) => {
      try {
        setCartLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        if (token) {
          const data =
            await updateCartAPI(
              productId,
              quantity
            );

          updateCartState(
            data
          );
        } else {
          const items =
            getGuestCart();

          const normalizedItems =
            [...items];

          /*
           * Update matching product.
           */

          const item =
            normalizedItems.find(
              (i: any) =>
                String(
                  getProductId(
                    i?.product
                  )
                ) ===
                String(
                  productId
                )
            );

          if (item) {
            item.quantity =
              quantity;
          }

          saveGuestCart(
            normalizedItems
          );

          updateCartState({
            items:
              normalizedItems,
          });
        }

        window.dispatchEvent(
          new Event(
            "cart:updated"
          )
        );
      } catch (error) {
        console.log(
          "UPDATE CART ERROR",
          error
        );
      } finally {
        setCartLoading(false);
      }
    };

  /* =======================================================
     REMOVE ITEM
  ======================================================= */

  const removeItem =
    async (
      productId: string
    ) => {
      try {
        setCartLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        if (token) {
          const data =
            await removeCartAPI(
              productId
            );

          updateCartState(
            data
          );

          /*
           * Remove local variant metadata
           * for this product.
           */

          const metadata =
            getVariantMetadata();

          const filtered =
            metadata.filter(
              (item) =>
                String(
                  item.productId
                ) !==
                String(
                  productId
                )
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

          const normalizedItems =
            items.filter(
              (item: any) =>
                String(
                  getProductId(
                    item?.product
                  )
                ) !==
                String(
                  productId
                )
            );

          saveGuestCart(
            normalizedItems
          );

          updateCartState({
            items:
              normalizedItems,
          });
        }

        window.dispatchEvent(
          new Event(
            "cart:updated"
          )
        );
      } catch (error) {
        console.log(
          "REMOVE CART ERROR",
          error
        );
      } finally {
        setCartLoading(false);
      }
    };

  /* =======================================================
     CLEAR CART
  ======================================================= */

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
          "guestCart"
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
          "CLEAR CART ERROR",
          error
        );
      } finally {
        setCartLoading(false);
      }
    };

  /* =======================================================
     TOTAL ITEMS
  ======================================================= */

  const totalItems =
    cart?.items?.reduce(
      (
        total: number,
        item: any
      ) =>
        total +
        Number(
          item.quantity || 0
        ),
      0
    ) || 0;

  /* =======================================================
     PROVIDER
  ======================================================= */

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

/* =========================================================
   HOOK
========================================================= */

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