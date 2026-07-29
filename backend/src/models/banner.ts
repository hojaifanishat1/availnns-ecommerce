import { Schema, model } from "mongoose";

const bannerSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      required: true, // ব্যানার ইমেজ ইউআরএল
    },
    link: {
      type: String,
      default: "", // ব্যানারে ক্লিক করলে কোথায় যাবে (যেমন: /shop)
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Banner", bannerSchema);
