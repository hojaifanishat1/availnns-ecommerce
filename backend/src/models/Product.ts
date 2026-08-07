import mongoose, { Schema, model } from "mongoose";
import { IProduct } from "../types/product.types";

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    // ✅ Added shortDescription
    shortDescription: {
      type: String,
      default: "",
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // ✅ Added subCategory
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    brand: {
      type: String,
      default: "",
    },

    sku: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
    },

    discountStartDate: {
      type: Date,
      default: null,
    },

    discountEndDate: {
      type: Date,
      default: null,
    },

    stock: {
      type: Number,
      default: 0,
      required: true,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
    },

    weight: {
      type: Number,
      default: 0,
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          default: "",
        },
        alt: {
          type: String,
          default: "",
        },
      },
    ],

    sizes: {
      type: [String],
      default: [],
    },

    colors: {
      type: [String],
      default: [],
    },

    // =========================
    // PRODUCT VARIANTS
    // =========================
    variants: [
      {
        sku: { type: String, default: "" },
        size: { type: String, default: "" },
        color: { type: String, default: "" },
        colorHex: { type: String, default: "#000000" },
        stock: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
        discountPrice: { type: Number, default: 0 },
        image: { type: String, default: "" },
        active: { type: Boolean, default: true },
      },
    ],

    specifications: [
      {
        key: {
          type: String,
          default: "",
        },
        value: {
          type: String,
          default: "",
        },
      },
    ],

    // ✅ Added attributes
    attributes: [
      {
        key: { type: String, default: "" },
        value: { type: Schema.Types.Mixed, default: "" },
      },
    ],

    tags: {
      type: [String],
      default: [],
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },

    isFuture: {
      type: Boolean,
      default: false,
    },

    // =========================
    // STATUS & DRAFT (Frontend sync)
    // =========================
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    isDraft: {
      type: Boolean,
      default: true,
    },

    // =========================
    // SHIPPING & SEO
    // =========================
    shippingClass: {
      type: String,
      enum: ["standard", "express", "free"],
      default: "standard",
    },

    shipping: {
      type: Object,
      default: {},
    },

    seo: {
      type: Object,
      default: {},
    },

    // =========================
    // DYNAMIC CATEGORY FIELDS
    // =========================
    categoryFields: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },

    // =========================
    // DEAL PRODUCT
    // =========================
    isDeal: {
      type: Boolean,
      default: false,
    },

    // =========================
    // TOTAL SOLD (AUTO TRACKING)
    // =========================
    totalSold: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    isDigital: {
      type: Boolean,
      default: false,
    },

    freeShipping: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    metaTitle: {
      type: String,
      default: "",
    },

    metaDescription: {
      type: String,
      default: "",
    },

    // =========================
    // ELECTRONICS
    // =========================
    warrantyPeriod: {
      type: String,
      default: "",
    },

    storageCapacity: {
      type: String,
      default: "",
    },

    ramSize: {
      type: String,
      default: "",
    },

    screenSize: {
      type: String,
      default: "",
    },

    processorType: {
      type: String,
      default: "",
    },

    // =========================
    // FASHION
    // =========================
    fabricType: {
      type: String,
      default: "",
    },

    fitType: {
      type: String,
      default: "",
    },

    waistRise: {
      type: String,
      default: "",
    },

    material: {
      type: String,
      default: "",
    },

    strapType: {
      type: String,
      default: "",
    },

    soleMaterial: {
      type: String,
      default: "",
    },

    capStyle: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default (
  mongoose.models.Product ||
  model<IProduct>("Product", productSchema)
);
