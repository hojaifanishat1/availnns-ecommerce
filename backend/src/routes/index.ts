import { Router } from "express";

import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import adminRoutes from "./admin.routes";

import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";

import reviewRoutes from "./review.routes";
import wishlistRoutes from "./wishlist.routes";
import cartRoutes from "./cart.routes";

import orderRoutes from "./order.routes";
import paymentRoutes from "./payment.routes";
import couponRoutes from "./coupon.routes";

import adminOrderRoutes from "./admin.order.routes";
import adminDashboardRoutes from "./admin.dashboard.routes";
import adminNotificationRoutes from "./admin.notification.routes";

import settingsRoutes from "./settings.route";
import deliveryZoneRoutes from "./deliveryZone.routes";
import dashboardRoutes from "./dashboard.routes";
import uploadRoutes from "./upload.routes";
import notificationRoutes from "./notification.routes";

import phoneOtpRoutes from "./phoneOtp.routes";
import bannerRoutes from "./banner.routes"; // ব্যানার রাউট ইমপোর্ট করা হলো

const router = Router();

// AUTH
router.use("/auth", authRoutes);

//PHONE OTP
router.use("/phone-otp", phoneOtpRoutes);

// USERS
router.use("/users", userRoutes);

// ADMIN
router.use("/admin", adminRoutes);
router.use("/admin/dashboard", adminDashboardRoutes);
router.use("/admin/orders", adminOrderRoutes);
router.use("/admin/notifications", adminNotificationRoutes);

// BANNERS (পাবলিক এবং অ্যাডমিন ব্যানার রুট)
router.use("/banners", bannerRoutes);

// SETTINGS
router.use("/settings", settingsRoutes);

// CATEGORY
router.use("/categories", categoryRoutes);
// যদি admin category CRUD আলাদা middleware সহ দরকার হয়
router.use("/admin/categories", categoryRoutes);

// PRODUCTS
router.use("/products", productRoutes);
// যদি admin product CRUD আলাদা middleware সহ দরকার হয়
router.use("/admin/products", productRoutes);

// CUSTOMER
router.use("/reviews", reviewRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/cart", cartRoutes);

// USER DASHBOARD
router.use("/dashboard", dashboardRoutes);
router.use("/notifications", notificationRoutes);

// ORDERS & PAYMENTS
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/coupons", couponRoutes);

// DELIVERY
router.use("/delivery-zones", deliveryZoneRoutes);

// UPLOAD
router.use("/upload", uploadRoutes);

// API CHECK
router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "AvailNNS API v1 🚀",
  });
});

export default router;
