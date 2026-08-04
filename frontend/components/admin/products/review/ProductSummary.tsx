"use client";

import {
  Package,
  Image as ImageIcon,
  Boxes,
  Tag,
  Search,
} from "lucide-react";

interface ProductImage {
  url?: string;
  [key: string]: unknown;
}

interface ProductPricing {
  price?: number;
  discountPrice?: number;
  currency?: string;
  [key: string]: unknown;
}

interface ProductSeo {
  metaTitle?: string;
  [key: string]: unknown;
}

interface Product {
  name?: string;
  description?: string;
  images?: ProductImage[];
  pricing?: ProductPricing;
  stock?: number;
  variants?: unknown[];
  attributes?: unknown[];
  seo?: ProductSeo;
  [key: string]: unknown;
}

interface Props {
  product: Product;
}

export default function ProductSummary({
  product
}: Props) {
  const {
    name,
    description,
    images = [],
    pricing = {},
    stock = 0,
    variants = [],
    attributes = [],
    seo = {}
  } = product || {};

  const currencySymbol = pricing.currency || "SAR";

  const items = [
    {
      label: "Images",
      value: images.length,
      icon: ImageIcon,
    },
    {
      label: "Variants",
      value: variants.length,
      icon: Boxes,
    },
    {
      label: "Stock",
      value: stock,
      icon: Package,
    },
    {
      label: "Attributes",
      value: attributes.length,
      icon: Tag,
    },
    {
      label: "SEO Status",
      value: seo.metaTitle ? "Ready" : "Missing",
      icon: Search,
    }
  ];

  return (
    <div
      className="
        border
        rounded-2xl
        p-6
        space-y-6
        bg-white
        shadow-sm
      "
    >
      <div className="space-y-1">
        <h2
          className="
            text-xl
            font-bold
            text-gray-900
          "
        >
          {
            name ||
            "Untitled Product"
          }
        </h2>

        <p
          className="
            text-sm
            text-gray-500
            line-clamp-2
          "
        >
          {
            description ||
            "No description provided for this product."
          }
        </p>
      </div>

      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-3
          md:grid-cols-5
          gap-4
        "
      >
        {
          items.map(
            (item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="
                    border
                    border-gray-100
                    bg-gray-50/50
                    rounded-xl
                    p-4
                    text-center
                    flex
                    flex-col
                    items-center
                    justify-center
                    space-y-2
                  "
                >
                  <div className="p-2 bg-white rounded-lg shadow-xs border">
                    <Icon
                      size={18}
                      className="text-gray-700"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <p
                      className="
                        text-xs
                        text-gray-500
                        font-medium
                      "
                    >
                      {item.label}
                    </p>

                    <p
                      className="
                        text-sm
                        font-bold
                        text-gray-900
                      "
                    >
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            }
          )
        }
      </div>

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-4
        "
      >
        <div
          className="
            border
            border-gray-200
            rounded-xl
            p-4
            bg-white
            shadow-xs
            flex
            justify-between
            items-center
          "
        >
          <div>
            <p className="text-xs text-gray-500 font-medium">Regular Price</p>
            <h3 className="text-lg font-bold text-gray-900 mt-0.5">
              {pricing.price !== undefined && pricing.price !== null ? pricing.price : 0} {currencySymbol}
            </h3>
          </div>
          <div className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">
            Standard
          </div>
        </div>

        <div
          className="
            border
            border-gray-200
            rounded-xl
            p-4
            bg-white
            shadow-xs
            flex
            justify-between
            items-center
          "
        >
          <div>
            <p className="text-xs text-gray-500 font-medium">Discount Price</p>
            <h3 className="text-lg font-bold text-gray-900 mt-0.5">
              {pricing.discountPrice !== undefined && pricing.discountPrice !== null && pricing.discountPrice > 0
                ? `${pricing.discountPrice} ${currencySymbol}`
                : "None"}
            </h3>
          </div>
          {pricing.discountPrice !== undefined && pricing.discountPrice !== null && pricing.discountPrice > 0 && (
            <div className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">
              On Sale
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
