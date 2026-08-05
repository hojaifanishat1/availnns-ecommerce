import api from "@/services/api";
import { Product } from "@/types/product";

// =========================
// PUBLIC PRODUCTS
// =========================

export const getProducts = async (): Promise<Product[]> => {
  const res = await api.get("/products");
  return res.data.products || [];
};

// =========================
// FEATURED
// =========================

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const res = await api.get("/products/featured");
  return res.data.products || [];
};

// =========================
// BEST SELLERS
// =========================

export const getBestSellerProducts = async (): Promise<Product[]> => {
  const res = await api.get("/products/best-sellers");
  return res.data.products || [];
};

// =========================
// TOP PICKS
// =========================

export const getTopPickProducts = async (): Promise<Product[]> => {
  const res = await api.get("/products/top-picks");
  return res.data.products || [];
};

// =========================
// NEW ARRIVALS
// =========================

export const getNewArrivalProducts = async (): Promise<Product[]> => {
  const res = await api.get("/products/new-arrivals");
  return res.data.products || [];
};

// =========================
// DEAL PRODUCTS
// =========================

export const getDealProducts = async (): Promise<Product[]> => {
  const res = await api.get("/products/deals");
  return res.data.products || [];
};

// =========================
// FUTURE PRODUCTS
// =========================

export const getFutureProducts = async (): Promise<Product[]> => {
  const res = await api.get("/products/future-products");
  return res.data.products || [];
};

// =========================
// RELATED PRODUCTS
// =========================

export const getRelatedProducts = async (id: string): Promise<Product[]> => {
  const res = await api.get(`/products/${id}/related`);
  return res.data.products || [];
};

// =========================
// SINGLE PRODUCT
// =========================

export const getProductById = async (id: string) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

// =========================
// SEARCH
// =========================

export const searchProducts = async (search: string): Promise<Product[]> => {
  const res = await api.get(`/products?search=${encodeURIComponent(search)}`);
  return res.data.products || [];
};

// =========================
// ADMIN PRODUCTS
// =========================

export const getAdminProducts = async (token: string): Promise<Product[]> => {
  const res = await api.get("/products", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.products || [];
};

// =========================
// CREATE PRODUCT
// =========================

export const createProduct = async (productData: FormData, token: string) => {
  const res = await api.post("/products", productData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// =========================
// UPDATE PRODUCT
// =========================

export const updateProduct = async (
  id: string,
  productData: FormData,
  token: string
) => {
  const res = await api.put(`/products/${id}`, productData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// =========================
// DELETE PRODUCT
// =========================

export const removeProduct = async (id: string, token: string) => {
  const res = await api.delete(`/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// =========================
// UPDATE STOCK
// =========================

export const updateStock = async (id: string, stock: number, token: string) => {
  const res = await api.put(
    `/products/${id}/stock`,
    { stock },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

// =========================
// CATEGORY PRODUCTS (FIXED)
// =========================

export const getCategoryProducts = async (slug: string): Promise<Product[]> => {
  const res = await api.get(`/products/category/${slug}`);
  return res.data.products || res.data.data || res.data || [];
};

// =========================
// UPDATE DEAL STATUS
// =========================

export const updateDealStatus = async (
  id: string,
  isDeal: boolean,
  token: string
) => {
  const res = await api.put(
    `/products/${id}/deal`,
    { isDeal },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
