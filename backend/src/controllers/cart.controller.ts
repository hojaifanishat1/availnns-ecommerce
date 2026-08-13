import { Request, Response } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";

// ======================================================
// TYPES
// ======================================================

type VariantData = {
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

// ======================================================
// HELPERS
// ======================================================

const getProductId = (product: any): string | null => {
  if (!product) return null;

  if (typeof product === "string") {
    return product;
  }

  if (product?._id) {
    return product._id.toString();
  }

  if (product?.id) {
    return product.id.toString();
  }

  return null;
};

const cleanString = (value: any): string => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const getSelectedSize = (item: any): string => {
  return cleanString(
    item?.selectedSize ??
      item?.size ??
      item?.variant?.size ??
      item?.variant?.capacity ??
      item?.variant?.storage ??
      ""
  );
};

const getSelectedColor = (item: any): string => {
  return cleanString(
    item?.selectedColor ??
      item?.color ??
      item?.variant?.color ??
      ""
  );
};

const getSelectedSKU = (item: any): string => {
  return cleanString(
    item?.selectedVariantSKU ??
      item?.variant?.sku ??
      item?.sku ??
      ""
  );
};

// ======================================================
// FIND VARIANT
// ======================================================

const findVariant = (
  product: any,
  selectedSize: string,
  selectedColor: string,
  selectedSKU: string
): VariantData | null => {
  const rawVariants =
    product?.variants ||
    product?.itemVariants ||
    product?.productVariants ||
    [];

  const variants: any[] = Array.isArray(rawVariants)
    ? rawVariants
    : rawVariants && typeof rawVariants === "object"
      ? Object.values(rawVariants)
      : [];

  if (!variants.length) {
    return null;
  }

  const size = cleanString(selectedSize).toLowerCase();
  const color = cleanString(selectedColor).toLowerCase();
  const sku = cleanString(selectedSKU).toLowerCase();

  // -----------------------------------------------
  // 1. SKU MATCH - highest priority
  // -----------------------------------------------

  if (sku) {
    const skuMatch = variants.find((variant: any) => {
      const variantSKU = cleanString(
        variant?.sku ||
          variant?.SKU ||
          variant?.variantSKU ||
          ""
      ).toLowerCase();

      return variantSKU === sku;
    });

    if (skuMatch) {
      return skuMatch;
    }
  }

  // -----------------------------------------------
  // 2. SIZE + COLOR MATCH
  // -----------------------------------------------

  if (size || color) {
    const exactMatch = variants.find((variant: any) => {
      const variantSize = cleanString(
        variant?.size ||
          variant?.capacity ||
          variant?.storage ||
          variant?.attributes?.size ||
          ""
      ).toLowerCase();

      const variantColor = cleanString(
        variant?.color ||
          variant?.attributes?.color ||
          ""
      ).toLowerCase();

      const sizeMatch =
        !size || variantSize === size;

      const colorMatch =
        !color || variantColor === color;

      return sizeMatch && colorMatch;
    });

    if (exactMatch) {
      return exactMatch;
    }
  }

  return null;
};

// ======================================================
// GET VARIANT PRICE
// ======================================================

const getVariantPrice = (
  product: any,
  variant: VariantData | null
): number => {
  if (variant) {
    const variantDiscount = Number(
      variant.discountPrice || 0
    );

    if (variantDiscount > 0) {
      return variantDiscount;
    }

    const variantPrice = Number(
      variant.price || 0
    );

    if (variantPrice > 0) {
      return variantPrice;
    }
  }

  const discountPrice = Number(
    product?.discountPrice || 0
  );

  if (discountPrice > 0) {
    return discountPrice;
  }

  return Number(product?.price || 0);
};

// ======================================================
// GET VARIANT STOCK
// ======================================================

const getVariantStock = (
  product: any,
  variant: VariantData | null
): number => {
  if (
    variant &&
    variant.stock !== undefined &&
    variant.stock !== null
  ) {
    return Number(variant.stock);
  }

  return Number(product?.stock || 0);
};

// ======================================================
// CREATE UNIQUE VARIANT KEY
// ======================================================

const getCartItemKey = (item: any): string => {
  const productId =
    getProductId(item?.product) || "";

  const size =
    getSelectedSize(item).toLowerCase();

  const color =
    getSelectedColor(item).toLowerCase();

  const sku =
    getSelectedSKU(item).toLowerCase();

  // SKU থাকলে SKU-কে primary identity হিসেবে ব্যবহার
  if (sku) {
    return `${productId}__sku_${sku}`;
  }

  return `${productId}__size_${size}__color_${color}`;
};

// ======================================================
// NORMALIZE CART
// ======================================================

const normalizeCartItems = (
  items: any[] = []
) => {
  const mergedMap = new Map<string, any>();

  for (const item of items) {
    const productId = getProductId(
      item?.product
    );

    if (!productId) {
      continue;
    }

    const selectedSize =
      getSelectedSize(item);

    const selectedColor =
      getSelectedColor(item);

    const selectedVariantSKU =
      getSelectedSKU(item);

    const variant =
      item?.variant || null;

    const key = getCartItemKey({
      ...item,
      product: productId,
      selectedSize,
      selectedColor,
      selectedVariantSKU,
      variant,
    });

    const quantity =
      Number(item?.quantity || 1);

    if (mergedMap.has(key)) {
      const existing =
        mergedMap.get(key);

      existing.quantity += quantity;
    } else {
      mergedMap.set(key, {
        ...item,

        product: item.product,

        quantity,

        size: selectedSize,

        color: selectedColor,

        selectedSize,

        selectedColor,

        selectedVariantSKU,

        variant,
      });
    }
  }

  return Array.from(
    mergedMap.values()
  );
};

// ======================================================
// CALCULATE TOTAL
// ======================================================

const calculateCartTotal = (
  items: any[]
): number => {
  return items.reduce(
    (
      total: number,
      item: any
    ) => {
      return (
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0)
      );
    },
    0
  );
};

// ======================================================
// GET USER CART
// ======================================================

export const getCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId =
      (req as any).user.id;

    let cart =
      await Cart.findOne({
        user: userId,
      }).populate(
        "items.product"
      );

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        total: 0,
      });
    }

    cart.items =
      normalizeCartItems(
        cart.items
      ) as any;

    cart.total =
      calculateCartTotal(
        cart.items
      );

    await cart.save();

    // Populate again after save
    await cart.populate(
      "items.product"
    );

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error: any) {
    console.log(
      "GET CART ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get cart",
      error: error.message,
    });
  }
};

// ======================================================
// ADD TO CART
// ======================================================

export const addToCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId =
      (req as any).user.id;

    const {
      productId,
      quantity,
      size,
      color,
      selectedSize,
      selectedColor,
      selectedVariantSKU,
      variant,
    } = req.body;

    const addQuantity =
      Number(quantity || 1);

    if (!productId) {
      res.status(400).json({
        success: false,
        message:
          "Product ID is required",
      });

      return;
    }

    if (addQuantity < 1) {
      res.status(400).json({
        success: false,
        message:
          "Invalid quantity",
      });

      return;
    }

    const product =
      await Product.findById(
        productId
      );

    if (!product) {
      res.status(404).json({
        success: false,
        message:
          "Product not found",
      });

      return;
    }

    // --------------------------------------------------
    // FINAL VARIANT VALUES
    // --------------------------------------------------

    const finalSize =
      cleanString(
        selectedSize ??
          size ??
          variant?.size ??
          variant?.capacity ??
          variant?.storage ??
          ""
      );

    const finalColor =
      cleanString(
        selectedColor ??
          color ??
          variant?.color ??
          ""
      );

    const finalSKU =
      cleanString(
        selectedVariantSKU ??
          variant?.sku ??
          ""
      );

    // --------------------------------------------------
    // FIND ACTUAL PRODUCT VARIANT
    // --------------------------------------------------

    const matchedVariant =
      findVariant(
        product,
        finalSize,
        finalColor,
        finalSKU
      );

    // If frontend sent variant, keep it.
    // Otherwise use matched database variant.
    const finalVariant =
      variant ||
      matchedVariant ||
      null;

    // --------------------------------------------------
    // STOCK
    // --------------------------------------------------

    const availableStock =
      getVariantStock(
        product,
        matchedVariant ||
          finalVariant
      );

    if (
      availableStock > 0 &&
      addQuantity > availableStock
    ) {
      res.status(400).json({
        success: false,
        message:
          "Not enough stock",
        availableStock,
      });

      return;
    }

    // --------------------------------------------------
    // PRICE
    // --------------------------------------------------

    const price =
      getVariantPrice(
        product,
        matchedVariant ||
          finalVariant
      );

    // --------------------------------------------------
    // CART
    // --------------------------------------------------

    let cart =
      await Cart.findOne({
        user: userId,
      });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        total: 0,
      });
    }

    // --------------------------------------------------
    // FIND SAME VARIANT
    // --------------------------------------------------

    const existingItem: any =
      cart.items.find(
        (item: any) => {
          const itemProductId =
            getProductId(
              item.product
            );

          if (
            itemProductId !==
            String(productId)
          ) {
            return false;
          }

          const itemSKU =
            getSelectedSKU(item)
              .toLowerCase();

          const currentSKU =
            finalSKU.toLowerCase();

          // SKU based match
          if (
            itemSKU &&
            currentSKU
          ) {
            return (
              itemSKU ===
              currentSKU
            );
          }

          const itemSize =
            getSelectedSize(
              item
            ).toLowerCase();

          const itemColor =
            getSelectedColor(
              item
            ).toLowerCase();

          return (
            itemSize ===
              finalSize.toLowerCase() &&
            itemColor ===
              finalColor.toLowerCase()
          );
        }
      );

    // --------------------------------------------------
    // UPDATE EXISTING
    // --------------------------------------------------

    if (existingItem) {
      existingItem.quantity =
        Number(
          existingItem.quantity ||
            0
        ) + addQuantity;

      existingItem.price =
        price;

      existingItem.size =
        finalSize;

      existingItem.color =
        finalColor;

      existingItem.selectedSize =
        finalSize;

      existingItem.selectedColor =
        finalColor;

      existingItem.selectedVariantSKU =
        finalSKU;

      existingItem.variant =
        finalVariant;
    }

    // --------------------------------------------------
    // ADD NEW
    // --------------------------------------------------

    else {
      cart.items.push({
        product:
          product._id,

        quantity:
          addQuantity,

        price,

        size:
          finalSize,

        color:
          finalColor,

        selectedSize:
          finalSize,

        selectedColor:
          finalColor,

        selectedVariantSKU:
          finalSKU,

        variant:
          finalVariant,
      } as any);
    }

    // --------------------------------------------------
    // NORMALIZE
    // --------------------------------------------------

    cart.items =
      normalizeCartItems(
        cart.items
      ) as any;

    cart.total =
      calculateCartTotal(
        cart.items
      );

    await cart.save();

    await cart.populate(
      "items.product"
    );

    res.status(200).json({
      success: true,
      message:
        "Added to cart",
      cart,
    });
  } catch (error: any) {
    console.log(
      "ADD CART ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Add cart failed",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE CART ITEM
// ======================================================

export const updateCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId =
      (req as any).user.id;

    const {
      productId,
      quantity,
      size,
      color,
      selectedSize,
      selectedColor,
      selectedVariantSKU,
    } = req.body;

    const cart =
      await Cart.findOne({
        user: userId,
      });

    if (!cart) {
      res.status(404).json({
        success: false,
        message:
          "Cart not found",
      });

      return;
    }

    const finalSize =
      cleanString(
        selectedSize ??
          size ??
          ""
      );

    const finalColor =
      cleanString(
        selectedColor ??
          color ??
          ""
      );

    const finalSKU =
      cleanString(
        selectedVariantSKU ??
          ""
      );

    const item: any =
      cart.items.find(
        (cartItem: any) => {
          const cartProductId =
            getProductId(
              cartItem.product
            );

          if (
            cartProductId !==
            String(productId)
          ) {
            return false;
          }

          const itemSKU =
            getSelectedSKU(
              cartItem
            ).toLowerCase();

          if (
            itemSKU &&
            finalSKU
          ) {
            return (
              itemSKU ===
              finalSKU.toLowerCase()
            );
          }

          return (
            getSelectedSize(
              cartItem
            ).toLowerCase() ===
              finalSize.toLowerCase() &&
            getSelectedColor(
              cartItem
            ).toLowerCase() ===
              finalColor.toLowerCase()
          );
        }
      );

    if (!item) {
      res.status(404).json({
        success: false,
        message:
          "Item not found",
      });

      return;
    }

    const newQuantity =
      Number(quantity);

    if (
      !Number.isFinite(
        newQuantity
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invalid quantity",
      });

      return;
    }

    if (
      newQuantity <= 0
    ) {
      cart.items =
        cart.items.filter(
          (cartItem: any) =>
            cartItem !== item
        );
    } else {
      item.quantity =
        newQuantity;
    }

    cart.items =
      normalizeCartItems(
        cart.items
      ) as any;

    cart.total =
      calculateCartTotal(
        cart.items
      );

    await cart.save();

    await cart.populate(
      "items.product"
    );

    res.status(200).json({
      success: true,
      message:
        "Cart updated",
      cart,
    });
  } catch (error: any) {
    console.log(
      "UPDATE CART ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Update failed",
      error: error.message,
    });
  }
};

// ======================================================
// REMOVE CART ITEM
// ======================================================

export const removeCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId =
      (req as any).user.id;

    const {
      productId,
      size,
      color,
      selectedSize,
      selectedColor,
      selectedVariantSKU,
    } = req.body;

    const cart =
      await Cart.findOne({
        user: userId,
      });

    if (!cart) {
      res.status(404).json({
        success: false,
        message:
          "Cart not found",
      });

      return;
    }

    const finalSize =
      cleanString(
        selectedSize ??
          size ??
          ""
      );

    const finalColor =
      cleanString(
        selectedColor ??
          color ??
          ""
      );

    const finalSKU =
      cleanString(
        selectedVariantSKU ??
          ""
      );

    cart.items =
      cart.items.filter(
        (item: any) => {
          const itemProductId =
            getProductId(
              item.product
            );

          if (
            itemProductId !==
            String(productId)
          ) {
            return true;
          }

          const itemSKU =
            getSelectedSKU(
              item
            ).toLowerCase();

          if (
            itemSKU &&
            finalSKU
          ) {
            return (
              itemSKU !==
              finalSKU.toLowerCase()
            );
          }

          const sameSize =
            getSelectedSize(
              item
            ).toLowerCase() ===
            finalSize.toLowerCase();

          const sameColor =
            getSelectedColor(
              item
            ).toLowerCase() ===
            finalColor.toLowerCase();

          return !(
            sameSize &&
            sameColor
          );
        }
      );

    cart.items =
      normalizeCartItems(
        cart.items
      ) as any;

    cart.total =
      calculateCartTotal(
        cart.items
      );

    await cart.save();

    await cart.populate(
      "items.product"
    );

    res.status(200).json({
      success: true,
      message:
        "Removed",
      cart,
    });
  } catch (error: any) {
    console.log(
      "REMOVE CART ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Remove failed",
      error: error.message,
    });
  }
};

// ======================================================
// CLEAR CART
// ======================================================

export const clearCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId =
      (req as any).user.id;

    const cart =
      await Cart.findOne({
        user: userId,
      });

    if (cart) {
      cart.items = [];
      cart.total = 0;

      await cart.save();
    }

    res.status(200).json({
      success: true,
      message:
        "Cart cleared",
    });
  } catch (error: any) {
    console.log(
      "CLEAR CART ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Clear cart failed",
    });
  }
};

// ======================================================
// MERGE GUEST CART
// ======================================================

export const mergeCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId =
      (req as any).user.id;

    const {
      items,
    } = req.body;

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      res.status(200).json({
        success: true,
        message:
          "No guest cart items",
      });

      return;
    }

    let cart =
      await Cart.findOne({
        user: userId,
      });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        total: 0,
      });
    }

    // ==================================================
    // LOOP GUEST ITEMS
    // ==================================================

    for (
      const guestItem of items
    ) {
      const guestProductId =
        getProductId(
          guestItem?.product
        );

      if (!guestProductId) {
        continue;
      }

      const product =
        await Product.findById(
          guestProductId
        );

      if (!product) {
        continue;
      }

      const finalSize =
        getSelectedSize(
          guestItem
        );

      const finalColor =
        getSelectedColor(
          guestItem
        );

      const finalSKU =
        getSelectedSKU(
          guestItem
        );

      const matchedVariant =
        findVariant(
          product,
          finalSize,
          finalColor,
          finalSKU
        );

      const finalVariant =
        guestItem?.variant ||
        matchedVariant ||
        null;

      const price =
        getVariantPrice(
          product,
          matchedVariant ||
            finalVariant
        );

      const guestQuantity =
        Number(
          guestItem?.quantity ||
            1
        );

      // ----------------------------------------------
      // FIND EXISTING SAME VARIANT
      // ----------------------------------------------

      const existingItem: any =
        cart.items.find(
          (item: any) => {
            const itemProductId =
              getProductId(
                item.product
              );

            if (
              itemProductId !==
              guestProductId
            ) {
              return false;
            }

            const itemSKU =
              getSelectedSKU(
                item
              ).toLowerCase();

            if (
              itemSKU &&
              finalSKU
            ) {
              return (
                itemSKU ===
                finalSKU.toLowerCase()
              );
            }

            return (
              getSelectedSize(
                item
              ).toLowerCase() ===
                finalSize.toLowerCase() &&
              getSelectedColor(
                item
              ).toLowerCase() ===
                finalColor.toLowerCase()
            );
          }
        );

      // ----------------------------------------------
      // UPDATE
      // ----------------------------------------------

      if (existingItem) {
        existingItem.quantity +=
          guestQuantity;

        existingItem.price =
          price;

        existingItem.size =
          finalSize;

        existingItem.color =
          finalColor;

        existingItem.selectedSize =
          finalSize;

        existingItem.selectedColor =
          finalColor;

        existingItem.selectedVariantSKU =
          finalSKU;

        existingItem.variant =
          finalVariant;
      }

      // ----------------------------------------------
      // ADD
      // ----------------------------------------------

      else {
        cart.items.push({
          product:
            product._id,

          quantity:
            guestQuantity,

          price,

          size:
            finalSize,

          color:
            finalColor,

          selectedSize:
            finalSize,

          selectedColor:
            finalColor,

          selectedVariantSKU:
            finalSKU,

          variant:
            finalVariant,
        } as any);
      }
    }

    cart.items =
      normalizeCartItems(
        cart.items
      ) as any;

    cart.total =
      calculateCartTotal(
        cart.items
      );

    await cart.save();

    await cart.populate(
      "items.product"
    );

    res.status(200).json({
      success: true,
      message:
        "Guest cart merged",
      cart,
    });
  } catch (error: any) {
    console.log(
      "MERGE CART ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Merge cart failed",
      error: error.message,
    });
  }
};