import mongoose from "mongoose";

const deliveryZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    deliveryFee: {
      type: Number,
      required: true,
      default: 0,
    },

    expressFee: {
      type: Number,
      default: 0, // ৩ আওয়ার এক্সপ্রেস ডেলিভারির ফিক্সড চার্জ সংরক্ষণের জন্য
    },

    freeDeliveryAbove: {
      type: Number,
      default: 0,
    },

    estimatedDays: {
      type: String,
      default: "2-5 Days",
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DeliveryZone || mongoose.model(
  "DeliveryZone",
  deliveryZoneSchema
);
