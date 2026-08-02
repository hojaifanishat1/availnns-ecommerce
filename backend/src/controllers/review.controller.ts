import { Request, Response } from "express";
import Review from "../models/Review";
import Product from "../models/Product";
import { AuthRequest } from "../middleware/auth.middleware";

// ===============================
// CREATE REVIEW
// ===============================
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, rating, comment } = req.body;
    
    // Fixed: _id er jaigai id use kora holo jate middleware er sathe match kore
    const userId = req.user?.id || (req as any).user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
      return;
    }

    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
    });

    if (existingReview) {
      res.status(400).json({
        success: false,
        message: "You already reviewed this product",
      });
      return;
    }

    const review = await Review.create({
      user: userId,
      product: productId,
      rating,
      comment,
    });

    // Update product rating and numReviews
    const reviews = await Review.find({ product: productId });
    const averageRating = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Number(averageRating.toFixed(1)),
      numReviews: reviews.length,
    });

    const populatedReview = await Review.findById(review._id).populate("user", "name email");

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: populatedReview,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Review failed",
      error: error.message,
    });
  }
};

// ===============================
// GET PRODUCT REVIEWS
// ===============================
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to get reviews",
      error: error.message,
    });
  }
};

// ===============================
// DELETE REVIEW
// ===============================
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      res.status(404).json({
        success: false,
        message: "Review not found",
      });
      return;
    }

    const productId = review.product;
    const reviews = await Review.find({ product: productId });
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length 
      : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: Number(averageRating.toFixed(1)),
      numReviews: reviews.length,
    });

    res.status(200).json({
      success: true,
      message: "Review deleted",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};
