import { Request, Response } from "express";
import Product from "../models/Product";
import { generateSlug } from "../utils/slug";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary";
import {
  addDiscountPercentage,
  addDiscountPercentageToProducts,
} from "../utils/product";

// ===============================
// PARSE FORM DATA JSON
// ===============================
const parseJSON = (value: any) => {
  if (!value) return undefined;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

// ===============================
// CREATE PRODUCT
// ===============================
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    let slug = generateSlug(req.body.name || "");
    const existProduct = await Product.findOne({ slug });
    if (existProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    const uploadedFiles = Array.isArray(req.files) ? (req.files as Express.Multer.File[]) : [];
    const images: { url: string; public_id: string }[] = [];

    for (const file of uploadedFiles) {
      const result: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

      images.push({ url: result.secure_url, public_id: result.public_id });
    }

    const productData: any = {
      ...req.body,
      slug,
      images,
      isPublished: true,
      isFeatured: req.body.isFeatured === "true",
      isBestSeller: req.body.isBestSeller === "true",
      isNewArrival: req.body.isNewArrival === "true",
      isDeal: req.body.isDeal === "true",
    };

    // FIX ARRAYS
    productData.specifications = parseJSON(req.body.specifications) || [];
    productData.sizes = parseJSON(req.body.sizes) || [];
    productData.colors = parseJSON(req.body.colors) || [];

    // FIX NUMBER
    if (req.body.price) productData.price = Number(req.body.price);
    if (req.body.discountPrice) productData.discountPrice = Number(req.body.discountPrice);
    if (req.body.stock) productData.stock = Number(req.body.stock);

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: addDiscountPercentage(product),
    });
  } catch (error: any) {
    console.log("CREATE PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Product create failed",
      error: error.message,
    });
  }
};

// ===============================
// GET ALL PRODUCTS
// ===============================
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, category, minPrice, maxPrice, sort } = req.query;
    const filter: any = {};

    if (search) filter.name = { $regex: search, $options: "i" };
    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "name_asc") sortOption = { name: 1 };
    if (sort === "name_desc") sortOption = { name: -1 };

    const products = await Product.find(filter)
      .populate("category")
      .skip(skip)
      .limit(limit)
      .sort(sortOption);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      products: addDiscountPercentageToProducts(products),
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to get products",
      error: error.message,
    });
  }
};

// ===============================
// GET PRODUCT BY ID
// ===============================
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.status(200).json({
      success: true,
      product: addDiscountPercentage(product),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// ===============================
// UPDATE PRODUCT
// ===============================
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    const data: any = { ...req.body };

    if (req.body.oldImages) {
      data.images = JSON.parse(req.body.oldImages);
    }

    const files = req.files as Express.Multer.File[];
    if (files && files.length) {
      const newImages: any[] = [];
      for (const file of files) {
        const result: any = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
        newImages.push({ url: result.secure_url, public_id: result.public_id });
      }
      data.images = [...(data.images || []), ...newImages];
    }

    // FIX ARRAYS
    if (req.body.specifications !== undefined) {
      data.specifications = parseJSON(req.body.specifications) || [];
    }
    if (req.body.sizes !== undefined) {
      data.sizes = parseJSON(req.body.sizes) || [];
    }
    if (req.body.colors !== undefined) {
      data.colors = parseJSON(req.body.colors) || [];
    }

    // FIX NUMBERS & BOOLEANS
    if (req.body.price !== undefined) data.price = Number(req.body.price);
    if (req.body.discountPrice !== undefined) data.discountPrice = Number(req.body.discountPrice);
    if (req.body.stock !== undefined) data.stock = Number(req.body.stock);
    
    if (req.body.isFeatured !== undefined) data.isFeatured = req.body.isFeatured === "true";
    if (req.body.isBestSeller !== undefined) data.isBestSeller = req.body.isBestSeller === "true";
    if (req.body.isNewArrival !== undefined) data.isNewArrival = req.body.isNewArrival === "true";
    if (req.body.isDeal !== undefined) data.isDeal = req.body.isDeal === "true";
    if (req.body.isPublished !== undefined) data.isPublished = req.body.isPublished === "true";

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, data, { new: true });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: addDiscountPercentage(updatedProduct),
    });
  } catch (error: any) {
    console.log("UPDATE PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

// ===============================
// DELETE PRODUCT
// ===============================
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};

// ===============================
// ADDITIONAL PRODUCT GETTERS
// ===============================
export const getFeaturedProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await Product.find({
      isFeatured: true,
      isPublished: true,
    })
      .populate("category")
      .sort({
        createdAt: -1,
      })
      .limit(10);

    res.status(200).json({
      success: true,
      products: addDiscountPercentageToProducts(products),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to get featured products",
      error: error.message,
    });
  }
};

export const getBestSellerProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await Product.find({
      isPublished: true,
      $or: [
        { isBestSeller: true },
        { totalSold: { $gt: 5 } }
      ]
    })
      .populate("category")
      .sort({
        totalSold: -1,
        createdAt: -1,
      })
      .limit(10);

    res.status(200).json({
      success: true,
      products: addDiscountPercentageToProducts(products),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch best seller products",
      error: error.message,
    });
  }
};

export const getTopPickProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await Product.find({
      isPublished: true,
      totalSold: { $gt: 0 }
    })
      .populate("category")
      .sort({
        totalSold: -1,
      })
      .limit(8);

    res.status(200).json({
      success: true,
      products: addDiscountPercentageToProducts(products),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch top pick products",
      error: error.message,
    });
  }
};

export const getNewArrivalProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await Product.find({
      isNewArrival: true,
      isPublished: true,
    })
      .populate("category")
      .sort({
        createdAt: -1,
      })
      .limit(10);

    res.status(200).json({
      success: true,
      products: addDiscountPercentageToProducts(products),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch new arrivals",
      error: error.message,
    });
  }
};

export const getDealProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await Product.find({
      isDeal: true,
      isPublished: true,
    })
      .populate("category")
      .sort({
        createdAt: -1,
      })
      .limit(10);

    res.status(200).json({
      success: true,
      products: addDiscountPercentageToProducts(products),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch deal products",
      error: error.message,
    });
  }
};

export const getRelatedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    const products = await Product.find({
      category: product.category,
      _id: { $ne: req.params.id },
      isPublished: true,
    })
      .populate("category")
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      products: addDiscountPercentageToProducts(products),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to get related products",
      error: error.message,
    });
  }
};

export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: Number(req.body.stock) },
      { new: true }
    );
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      product: addDiscountPercentage(product),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Stock update failed",
      error: error.message,
    });
  }
};

export const getLowStockProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ stock: { $lte: 5 } }).populate("category");
    res.status(200).json({
      success: true,
      products: addDiscountPercentageToProducts(products),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to get low stock products",
      error: error.message,
    });
  }
};

// ===============================
// ADMIN UPDATE DEAL STATUS
// ===============================
export const updateDealStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeal: req.body.isDeal },
      { new: true }
    ).populate("category");

    if (!updatedProduct) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Deal status updated successfully",
      product: addDiscountPercentage(updatedProduct),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update deal status",
      error: error.message,
    });
  }
};
