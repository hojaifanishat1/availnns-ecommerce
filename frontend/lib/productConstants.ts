export const PRODUCT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type ProductStatusType = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

export const SHIPPING_CLASSES = [
  {
    label: "Standard",
    value: "standard",
  },
  {
    label: "Express",
    value: "express",
  },
  {
    label: "Free Shipping",
    value: "free",
  },
] as const;

export type ShippingClassType = (typeof SHIPPING_CLASSES)[number]["value"];

export const PRODUCT_STEPS = [
  "Basic Info",
  "Media",
  "Pricing",
  "Variants",
  "Inventory",
  "Shipping",
  "Attributes",
  "Specification",
  "SEO",
  "Review",
] as const;

export type ProductStepType = (typeof PRODUCT_STEPS)[number];
