import mongoose, { Schema, Document } from "mongoose";

// =========================
// CART ITEM
// =========================

export interface ICartItem {
  product: mongoose.Types.ObjectId;

  quantity: number;

  price: number;

  // Variant selections
  size?: string;

  color?: string;

  selectedSize?: string;

  selectedColor?: string;

  selectedVariantSKU?: string;

  // Optional complete variant information
  variant?: {
    sku?: string;
    size?: string;
    color?: string;
    capacity?: string;
    storage?: string;
    price?: number;
    discountPrice?: number;
    stock?: number;
    [key: string]: any;
  };
}

// =========================
// CART
// =========================

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;

  items: ICartItem[];

  total: number;
}

// =========================
// CART SCHEMA
// =========================

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        // =========================
        // OLD VARIANT FIELDS
        // =========================

        size: {
          type: String,
          default: "",
        },

        color: {
          type: String,
          default: "",
        },

        // =========================
        // SELECTED VARIANT
        // =========================

        selectedSize: {
          type: String,
          default: "",
        },

        selectedColor: {
          type: String,
          default: "",
        },

        selectedVariantSKU: {
          type: String,
          default: "",
        },

        // =========================
        // FULL VARIANT
        // =========================

        variant: {
          type: Schema.Types.Mixed,
          default: null,
        },
      },
    ],

    total: {
      type: Number,
      default: 0,
      min: 0,
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model<ICart>(
  "Cart",
  CartSchema
);