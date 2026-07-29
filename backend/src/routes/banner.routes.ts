import { Router } from "express";
import { create, getAll, getActive, update, remove } from "../controllers/banner.controller";
import authMiddleware from "../middleware/auth.middleware";
import authorize from "../middleware/role.middleware";
import upload from "../middleware/upload.middleware"; // আপনার আপলোড মিডলওয়্যার ইমপোর্ট করুন

const router = Router();

// Public route to show on frontend home page
router.get("/active", getActive);

// Admin routes
router.get("/", authMiddleware, authorize("admin"), getAll);
router.post("/", authMiddleware, authorize("admin"), upload.single("image"), create); // upload মিডলওয়্যার যুক্ত করা হলো
router.put("/:id", authMiddleware, authorize("admin"), upload.single("image"), update);
router.delete("/:id", authMiddleware, authorize("admin"), remove);

export default router;
