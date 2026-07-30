import mongoose, { Schema, Document } from "mongoose";

// ===============================
// ORDER ITEM INTERFACE
// ===============================
export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

// ===============================
// LOCATION INTERFACE
// ===============================
export interface ILocation {
  formattedAddress?: string;
  division?: string;
  district?: string;
  area?: string;
  road?: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
  googleMapLink?: string;
}

// ===============================
// SHIPPING ADDRESS INTERFACE
// ===============================
export interface IShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  country: string;
  location?: ILocation;
}

// ===============================
// ORDER INTERFACE
// ===============================
export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  deliveryZone?: mongoose.Types.ObjectId;
  deliveryZoneName: string;
  deliveryFee: number;
  expressFee: number; // ৩ আওয়ার এক্সপ্রেস ডেলিভারির ফিক্সড চার্জ
  paymentMethod: "COD" | "SSLCOMMERZ" | "BKASH" | "NAGAD" | "CARD";
  paymentInfo?: {
    transactionId?: string;
    paidAt?: Date;
    gatewayResponse?: any;
  };
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  tax: number;
  discountAmount: number;
  totalPrice: number;
  couponCode?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    // ===============================
    // USER
    // ===============================
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ===============================
    // ITEMS
    // ===============================
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          default: "",
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity cannot be less than 1"],
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    // ===============================
    // SHIPPING ADDRESS
    // ===============================
    shippingAddress: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        default: "Bangladesh",
      },
      location: {
        formattedAddress: { type: String, default: "" },
        division: { type: String, default: "" },
        district: { type: String, default: "" },
        area: { type: String, default: "" },
        road: { type: String, default: "" },
        postalCode: { type: String, default: "" },
        latitude: { type: String, default: "" },
        longitude: { type: String, default: "" },
        googleMapLink: { type: String, default: "" },
      },
    },

    // ===============================
    // DELIVERY ZONE / FEE
    // ===============================
    deliveryZone: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryZone",
    },
    deliveryZoneName: {
      type: String,
      default: "",
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    expressFee: {
      type: Number,
      default: 0, // ফিক্সড এক্সপ্রেস চার্জ সংরক্ষণের জন্য
    },

    // ===============================
    // PAYMENT
    // ===============================
    paymentMethod: {
      type: String,
      enum: ["COD", "SSLCOMMERZ", "BKASH", "NAGAD", "CARD"],
      default: "COD",
    },
    paymentInfo: {
      transactionId: {
        type: String,
        default: "",
        trim: true,
      },
      paidAt: {
        type: Date,
      },
      gatewayResponse: {
        type: Schema.Types.Mixed,
      },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // ===============================
    // ORDER STATUS
    // ===============================
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // ===============================
    // PRICE BREAKDOWN
    // ===============================
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    couponCode: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ইডেক্সিং (Indexing)
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ "paymentInfo.transactionId": 1 });

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
