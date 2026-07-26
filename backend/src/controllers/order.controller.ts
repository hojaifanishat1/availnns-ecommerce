import { Request, Response } from "express";
import mongoose from "mongoose";

import Order from "../models/Order";
import Cart from "../models/Cart";
import Product from "../models/Product";
import Coupon from "../models/Coupon";
import DeliveryZone from "../models/DeliveryZone";
import { sendOrderStatusEmail } from "../services/notification.service";

// =====================================================
// CREATE ORDER
// =====================================================
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const userId = (req as any).user.id;

    const {
      shippingAddress,
      paymentMethod,
      transactionId,
      couponCode,
      deliveryZone
    } = req.body;

    // ===============================
    // PAYMENT VALIDATION
    // ===============================
    const allowedPayment = ["COD", "CARD", "BKASH", "NAGAD", "SSLCOMMERZ"];
    if (paymentMethod && !allowedPayment.includes(paymentMethod)) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
      return;
    }

    // ===============================
    // CART
    // ===============================
    const cart = await Cart.findOne({ user: userId })
      .populate("items.product")
      .session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
      return;
    }

    // ===============================
    // STOCK CHECK
    // ===============================
    const orderItems: any[] = [];

    for (const item of cart.items) {
      const product: any = item.product;

      if (!product) {
        await session.abortTransaction();
        res.status(404).json({
          success: false,
          message: "Product not found"
        });
        return;
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        res.status(400).json({
          success: false,
          message: `${product.name} is out of stock`
        });
        return;
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0]?.url || "",
        quantity: item.quantity,
        price: item.price
      });
    }

    // ===============================
    // PRICE
    // ===============================
    const subtotal = orderItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // ===============================
    // DELIVERY ZONE
    // ===============================
    let deliveryFee = 0;
    let deliveryZoneName = "Standard Delivery";
    let zoneId: any = null;

    if (deliveryZone) {
      const zone = await DeliveryZone.findById(deliveryZone).session(session);

      if (zone) {
        zoneId = zone._id;
        deliveryZoneName = zone.name;
        deliveryFee = zone.deliveryFee;
      }
    }

    // ===============================
    // COUPON
    // ===============================
    let discountAmount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        status: "active"
      }).session(session);

      if (!coupon) {
        await session.abortTransaction();
        res.status(400).json({
          success: false,
          message: "Invalid coupon"
        });
        return;
      }

      if (new Date() > coupon.expiryDate) {
        await session.abortTransaction();
        res.status(400).json({
          success: false,
          message: "Coupon expired"
        });
        return;
      }

      if (subtotal < coupon.minimumAmount) {
        await session.abortTransaction();
        res.status(400).json({
          success: false,
          message: `Minimum amount ${coupon.minimumAmount}`
        });
        return;
      }

      if (coupon.discountType === "percentage") {
        discountAmount = (subtotal * coupon.discountValue) / 100;
        if ((coupon as any).maxDiscount && discountAmount > (coupon as any).maxDiscount) {
          discountAmount = (coupon as any).maxDiscount;
        }
      } else {
        discountAmount = coupon.discountValue;
      }
    }

    // ===============================
    // TAX + TOTAL
    // ===============================
    const tax = subtotal * 0.05;
    const totalPrice = Math.max(0, subtotal + deliveryFee + tax - discountAmount);

    // ===============================
    // CREATE ORDER
    // ===============================
    const order = await Order.create(
      [
        {
          user: userId,
          items: orderItems,
          shippingAddress,
          deliveryZone: zoneId,
          deliveryZoneName,
          deliveryFee,
          paymentMethod: paymentMethod || "COD",
          paymentStatus: "pending",
          paymentInfo: {
            transactionId: transactionId || ""
          },
          orderStatus: "pending",
          subtotal,
          tax,
          discountAmount,
          totalPrice,
          couponCode: couponCode ? couponCode.toUpperCase() : ""
        }
      ],
      { session }
    );

    const createdOrder = order[0];

    // ===============================
    // STOCK REDUCE & TOTAL SOLD UPDATE
    // ===============================
    await Product.bulkWrite(
      cart.items.map((item: any) => ({
        updateOne: {
          filter: { _id: item.product._id },
          update: { 
            $inc: { 
              stock: -item.quantity,
              totalSold: item.quantity 
            } 
          }
        }
      })),
      { session }
    );

    // ===============================
    // CLEAR CART
    // ===============================
    cart.items = [];
    cart.total = 0;
    await cart.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: createdOrder
    });

  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Order creation failed",
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// =====================================================
// GET MY ORDERS
// =====================================================
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const orders = await Order.find({ user: userId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error: any) {
    console.error("GET MY ORDERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get orders",
      error: error.message
    });
  }
};

// =====================================================
// GET SINGLE ORDER
// =====================================================
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.product");

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error: any) {
    console.error("GET ORDER BY ID ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get order",
      error: error.message
    });
  }
};

// =====================================================
// ADMIN UPDATE ORDER STATUS
// =====================================================
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];

    if (!status || !allowed.includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid status"
      });
      return;
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found"
      });
      return;
    }

    if (order.orderStatus === "delivered" || order.orderStatus === "cancelled") {
      res.status(400).json({
        success: false,
        message: `Cannot change status of a ${order.orderStatus} order`
      });
      return;
    }

    order.orderStatus = status;

    if (status === "delivered") {
      order.paymentStatus = "paid";
      order.paymentInfo = {
        ...order.paymentInfo,
        paidAt: new Date()
      };
    }

    await order.save();


// ===============================
// SEND ORDER STATUS EMAIL
// ===============================

const populatedOrder =
await Order.findById(order._id)
.populate(
  "user",
  "name email phone"
);


if(
  populatedOrder &&
  populatedOrder.user
){

  await sendOrderStatusEmail(
    populatedOrder.user,
    populatedOrder
  );

}

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order
    });
  } catch (error: any) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message
    });
  }
};

// =====================================================
// CANCEL ORDER + RESTOCK
// =====================================================
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const userId = (req as any).user.id;

    const order = await Order.findOne({ _id: req.params.id, user: userId }).session(session);

    if (!order) {
      await session.abortTransaction();
      res.status(404).json({
        success: false,
        message: "Order not found"
      });
      return;
    }

    if (order.orderStatus !== "pending") {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        message: `Cannot cancel order because it is already ${order.orderStatus}`
      });
      return;
    }

    order.orderStatus = "cancelled";
    await order.save({ session });

    await Product.bulkWrite(
      order.items.map((item: any) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { 
            $inc: { 
              stock: item.quantity,
              totalSold: -item.quantity // ক্যানসেল হলে totalSold কমিয়ে দেওয়া হলো
            } 
          }
        }
      })),
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order
    });

  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("CANCEL ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Cancel failed",
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// =====================================================
// ADMIN GET ALL ORDERS
// =====================================================
export const getAdminOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error: any) {
    console.error("GET ADMIN ORDERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get admin orders",
      error: error.message
    });
  }
};
