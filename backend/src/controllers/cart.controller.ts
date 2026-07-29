import { Request, Response } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";

const normalizeCartItems = (items: any[] = []) => {
  const mergedMap = new Map();

  (items || []).forEach((item: any) => {
    const rawProduct = item.product;
    const productId = rawProduct?._id
      ? rawProduct._id.toString()
      : rawProduct?.toString();

    if (!productId) return;

    const quantity = Number(item.quantity || 1);

    if (mergedMap.has(productId)) {
      const existing = mergedMap.get(productId);
      existing.quantity += quantity;
    } else {
      mergedMap.set(productId, {
        ...item,
        product: rawProduct,
        quantity,
      });
    }
  });

  return Array.from(mergedMap.values());
};

// ===============================
// GET USER CART
// ===============================
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        total: 0,
      });
    }

    cart.items = normalizeCartItems(cart.items) as any;
    cart.total = cart.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error: any) {
    console.log("GET CART ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cart",
    });
  }
};

// ===============================
// ADD TO CART
// ===============================
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { productId, quantity } = req.body;

    const addQuantity = Number(quantity || 1);

    if (addQuantity < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
      return;
    }

    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    if (product.stock < addQuantity) {
      res.status(400).json({
        success: false,
        message: "Not enough stock",
      });
      return;
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        total: 0,
      });
    }

    const price = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;

    // Fixed: Checking both populated product object and raw id string
    const existingItem: any = cart.items.find((item: any) => {
      const itemProdId = item.product?._id ? item.product._id.toString() : item.product?.toString();
      return itemProdId === String(productId);
    });

    if (existingItem) {
      existingItem.quantity += addQuantity;
      existingItem.price = price;
    } else {
      cart.items.push({
        product: product._id,
        quantity: addQuantity,
        price,
      } as any);
    }

    cart.items = normalizeCartItems(cart.items) as any;

    cart.total = cart.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    await cart.save();
    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      message: "Added to cart",
      cart,
    });
  } catch (error: any) {
    console.log("ADD CART ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Add cart failed",
      error: error.message,
    });
  }
};

// ===============================
// UPDATE CART ITEM
// ===============================
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      res.status(404).json({
        success: false,
        message: "Cart not found",
      });
      return;
    }

    const item: any = cart.items.find((item: any) => {
      const itemProdId = item.product?._id ? item.product._id.toString() : item.product?.toString();
      return itemProdId === String(productId);
    });

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Item not found",
      });
      return;
    }

    item.quantity = Number(quantity);

    if (item.quantity <= 0) {
      cart.items = cart.items.filter((item: any) => {
        const itemProdId = item.product?._id ? item.product._id.toString() : item.product?.toString();
        return itemProdId !== String(productId);
      });
    }

    cart.items = normalizeCartItems(cart.items) as any;

    cart.total = cart.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    await cart.save();
    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

// ===============================
// REMOVE ITEM
// ===============================
export const removeCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      res.status(404).json({
        success: false,
        message: "Cart not found",
      });
      return;
    }

    cart.items = cart.items.filter((item: any) => {
      const itemProdId = item.product?._id ? item.product._id.toString() : item.product?.toString();
      return itemProdId !== String(productId);
    });

    cart.items = normalizeCartItems(cart.items) as any;

    cart.total = cart.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    await cart.save();
    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      message: "Removed",
      cart,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Remove failed",
      error: error.message,
    });
  }
};

// ===============================
// CLEAR CART
// ===============================
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const cart = await Cart.findOne({ user: userId });

    if (cart) {
      cart.items = [];
      cart.total = 0;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Clear cart failed",
    });
  }
};

// ===============================
// MERGE GUEST CART
// ===============================
export const mergeCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { items } = req.body;

    if (!items || items.length === 0) {
      res.status(200).json({
        success: true,
        message: "No guest cart items",
      });
      return;
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        total: 0,
      });
    }

    for (const guestItem of items) {
      const product = await Product.findById(guestItem.product);

      if (!product) {
        continue;
      }

      const price =
        product.discountPrice && product.discountPrice > 0
          ? product.discountPrice
          : product.price;

      const existingItem: any = cart.items.find((item: any) => {
        const itemProdId = item.product?._id ? item.product._id.toString() : item.product?.toString();
        return itemProdId === String(guestItem.product);
      });

      if (existingItem) {
        existingItem.quantity += Number(guestItem.quantity || 1);
        existingItem.price = price;
      } else {
        cart.items.push({
          product: product._id,
          quantity: Number(guestItem.quantity || 1),
          price,
        } as any);
      }
    }

    cart.total = cart.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    await cart.save();
    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      message: "Guest cart merged",
      cart,
    });
  } catch (error: any) {
    console.log("MERGE CART ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Merge cart failed",
      error: error.message,
    });
  }
};
