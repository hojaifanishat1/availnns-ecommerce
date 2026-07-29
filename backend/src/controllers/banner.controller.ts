import { Request, Response } from "express";
import * as bannerService from "../services/banner.service"; // অথবা আপনার সার্ভিস ফাইলের পাথ

// Create Banner
export const create = async (req: Request, res: Response) => {
  try {
    const bannerData = { ...req.body };

    // যদি ফাইল আপলোড করা হয়ে থাকে, তবে তার পাথ বা URL টি ইমেজ ফিল্ডে যুক্ত করা হবে
    if (req.file) {
      bannerData.image = `/uploads/${req.file.filename}`; // আপনার আপলোড ফোল্ডার পাথ অনুযায়ী এটি হতে পারে
    }

    const banner = await bannerService.createBanner(bannerData);
    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create banner",
    });
  }
};

// Get All Banners (Admin)
export const getAll = async (_req: Request, res: Response) => {
  try {
    const banners = await bannerService.getBanners();
    res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch banners",
    });
  }
};

// Get Active Banners (Public)
export const getActive = async (_req: Request, res: Response) => {
  try {
    const banners = await bannerService.getActiveBanners();
    res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch active banners",
    });
  }
};

// Update Banner
export const update = async (req: Request, res: Response) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const banner = await bannerService.updateBanner(req.params.id, updateData);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update banner",
    });
  }
};

// Remove Banner
export const remove = async (req: Request, res: Response) => {
  try {
    const banner = await bannerService.deleteBanner(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete banner",
    });
  }
};
