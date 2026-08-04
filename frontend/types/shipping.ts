export type WeightUnit = "kg" | "g" | "lb" | "oz";
export type DimensionUnit = "cm" | "m" | "in";

export interface ProductWeight {
  value: number;
  unit: WeightUnit;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit?: DimensionUnit; // ডাইমেনশনের একক (যেমন: সেন্টিমিটার বা ইঞ্চি)
}

export interface ProductShipping {
  weight: ProductWeight;
  dimensions: ProductDimensions;
  freeShipping: boolean;
  shippingFee?: number;         // ফিক্সড শিপিং চার্জ (যদি ফ্রি না হয়)
  isFragile?: boolean;          // ভঙ্গুর পণ্য কি না (হ্যান্ডলিংয়ের জন্য)
  estimatedDeliveryDays?: number; // আনুমানিক ডেলিভারির সময়
}
