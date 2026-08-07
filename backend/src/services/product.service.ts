import Product from "../models/Product";
import { IProduct } from "../types/product.types";
import { generateSlug } from "../utils/slug";

export const createProductService = async (productData: any) => {
  let slug = generateSlug(productData.name || "");
  const exists = await Product.findOne({ slug });

  if (exists) {
    slug = `${slug}-${Date.now()}`;
  }

  return await Product.create({
    ...productData,
    slug,
  });
};

export const getProductsService = async (query: any) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    sort = "-createdAt",
  } = query;

  const filter: any = {};

  // Search
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }

  // Category
  if (category) {
    filter.category = category;
  }

  // Price
  if (minPrice || maxPrice) {
    filter.price = {};

    if (minPrice) {
      filter.price.$gte = Number(minPrice);
    }

    if (maxPrice) {
      filter.price.$lte = Number(maxPrice);
    }
  }

  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("category")
    .sort(sort)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  return {
    products,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  };
};

export const getProductByIdService = async (id: string) => {
  return await Product.findById(id).populate("category");
};

export const updateProductService = async (
  id: string,
  productData: Partial<IProduct>
) => {
  if (productData.name) {
    productData.slug = generateSlug(productData.name);
  }

  return await Product.findByIdAndUpdate(id, productData, {
    new: true,
    runValidators: true,
  }).populate("category");
};

export const deleteProductService = async (id: string) => {
  return await Product.findByIdAndDelete(id);
};
