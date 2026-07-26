import { Router } from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts,
  getFeaturedProducts,
  getBestSellerProducts,
  getTopPickProducts,
  getNewArrivalProducts,
  getDealProducts,
  getRelatedProducts,
  updateDealStatus,
} from "../controllers/product.controller";

import upload from "../middleware/upload.middleware";

import validate from "../middleware/validate";

import { createProductSchema } from "../validators/product.validator";

import authMiddleware from "../middleware/auth.middleware";

import authorize from "../middleware/role.middleware";

const router = Router();

// =================================
// PUBLIC PRODUCTS
// =================================

router.get(
  "/featured",
  getFeaturedProducts
);

router.get(
  "/best-sellers",
  getBestSellerProducts
);

router.get(
  "/top-picks",
  getTopPickProducts
);

router.get(
  "/new-arrivals",
  getNewArrivalProducts
);

router.get(
  "/deals",
  getDealProducts
);

router.get(
  "/:id/related",
  getRelatedProducts
);

router.get(
  "/",
  getProducts
);

router.get(
  "/:id",
  getProductById
);

// =================================
// ADMIN CREATE PRODUCT
// =================================

router.post(
  "/",
  authMiddleware,
  authorize("admin"),
  upload.array("images", 10),
  validate(createProductSchema),
  createProduct
);

// =================================
// ADMIN UPDATE PRODUCT
// =================================

router.put(
  "/:id",
  authMiddleware,
  authorize("admin"),
  upload.array("images", 10),
  updateProduct
);

// =================================
// ADMIN DELETE PRODUCT
// =================================

router.delete(
  "/:id",
  authMiddleware,
  authorize("admin"),
  deleteProduct
);

// =================================
// ADMIN UPDATE STOCK
// =================================

router.put(
  "/:id/stock",
  authMiddleware,
  authorize("admin"),
  updateStock
);

// =================================
// ADMIN UPDATE DEAL STATUS
// =================================

router.put(
  "/:id/deal",
  authMiddleware,
  authorize("admin"),
  updateDealStatus
);

// =================================
// ADMIN LOW STOCK
// =================================

router.get(
  "/admin/low-stock",
  authMiddleware,
  authorize("admin"),
  getLowStockProducts
);

export default router;
