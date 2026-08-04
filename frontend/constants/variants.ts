// constants/variants.ts

export const DEFAULT_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "4XL",
  "Free Size",
];

export const SHOE_SIZES = [
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "UK 6",
  "UK 7",
  "UK 8",
  "UK 9",
  "UK 10",
];

export const PANT_SIZES = [
  "28",
  "30",
  "32",
  "34",
  "36",
  "38",
  "40",
  "42",
  "44",
];

export const UNDERWEAR_SIZES = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
];

export const CAP_SIZES = [
  "Small",
  "Medium",
  "Large",
  "Adjustable",
  "Free Size",
];

export interface ProductColor {
  name: string;
  hex: string;
}

export const DEFAULT_COLORS: ProductColor[] = [
  {
    name: "Black",
    hex: "#000000",
  },
  {
    name: "White",
    hex: "#FFFFFF",
  },
  {
    name: "Red",
    hex: "#EF4444",
  },
  {
    name: "Blue",
    hex: "#3B82F6",
  },
  {
    name: "Green",
    hex: "#10B981",
  },
  {
    name: "Yellow",
    hex: "#F59E0B",
  },
  {
    name: "Gray",
    hex: "#6B7280",
  },
  {
    name: "Navy",
    hex: "#1E3A8A",
  },
];

export const STOCK_LIMITS = {
  MIN: 0,
  LOW_STOCK: 5,
  MAX: 999999,
};

export const SKU_PREFIX = {
  SHIRT: "SHT",
  TSHIRT: "TSH",
  PANT: "PNT",
  SHOE: "SHO",
  WATCH: "WAT",
  MOBILE: "MOB",
  TABLET: "TAB",
  LAPTOP: "LAP",
  ACCESSORY: "ACC",
  DEFAULT: "PRD",
};

export const VARIANT_OPTIONS = {
  enableColor: true,
  enableSize: true,
  enableImage: true,
  enableSku: true,
};

export interface DefaultVariant {
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  price: number;
  discountPrice: number;
  image: string;
  active: boolean;
}

export const DEFAULT_VARIANT: DefaultVariant = {
  sku: "",
  size: "",
  color: "",
  colorHex: "",
  stock: 0,
  price: 0,
  discountPrice: 0,
  image: "",
  active: true,
};
