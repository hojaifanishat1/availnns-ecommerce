"use client";

import { useEffect } from "react";

import SectionCard
from "../shared/SectionCard";

import FormInput
from "../shared/FormInput";

import FormSelect
from "../shared/FormSelect";

import {
  useProductFormContext,
} from "@/context/ProductFormContext";

import {
  useCurrency,
} from "@/context/CurrencyContext";

import {
  calculateDiscount,
} from "@/utils/productCalculator";

interface PricingData {
  price?: number;
  discountPrice?: number;
  currency?: string;
  discountStartDate?: string;
  discountEndDate?: string;
}

export default function PricingStep() {
  const {
    form,
    updateField
  } = useProductFormContext();
  const { currency: currencySettings } = useCurrency();

  const pricing: PricingData =
    form.pricing || {
      price: 0,
      discountPrice: 0,
      currency: "SAR",
      discountStartDate: "",
      discountEndDate: ""
    };

  const discountPercentage =
    pricing.discountPrice && pricing.price && pricing.discountPrice < pricing.price
      ? calculateDiscount(
          pricing.price,
          pricing.discountPrice
        )
      : 0;

  useEffect(() => {
    if (!pricing.currency && currencySettings.currency) {
      updateField("pricing", {
        ...pricing,
        currency: currencySettings.currency,
      });
    }
  }, [currencySettings.currency, pricing.currency]);

  const currencyOptions = [
    {
      label: `${currencySettings.currency} (${currencySettings.symbol})`,
      value: currencySettings.currency,
    },
    { label: "USD ($)", value: "USD" },
    { label: "EUR (€)", value: "EUR" },
    { label: "GBP (£)", value: "GBP" },
    { label: "SAR (﷼)", value: "SAR" },
    { label: "BDT (৳)", value: "BDT" },
  ].filter(
    (option, index, self) =>
      index === self.findIndex((item) => item.value === option.value)
  );

  const updatePricing = (
    key: keyof PricingData,
    value: unknown
  ) => {
    updateField(
      "pricing",
      {
        ...pricing,
        [key]: value
      }
    );
  };

  return (
    <div
      className="
        space-y-6
      "
    >
      <SectionCard
        title="Product Pricing"
        description="Set your product price, currency, and promotional discounts."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Regular Price"
              type="number"
              placeholder="0.00"
              value={
                pricing.price === 0 || pricing.price === undefined ? "" : pricing.price
              }
              onChange={(value) =>
                updatePricing(
                  "price",
                  value === "" ? 0 : Number(value)
                )
              }
            />

            <FormInput
              label="Discount Price"
              type="number"
              placeholder="0.00"
              value={
                pricing.discountPrice === 0 || pricing.discountPrice === undefined ? "" : pricing.discountPrice
              }
              onChange={(value) =>
                updatePricing(
                  "discountPrice",
                  value === "" ? 0 : Number(value)
                )
              }
            />
          </div>

          <FormSelect
            label="Currency"
            value={pricing.currency || currencySettings.currency || "USD"}
            options={currencyOptions}
            onChange={(value) =>
              updatePricing(
                "currency",
                value
              )
            }
          />

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            "
          >
            <FormInput
              label="Discount Start Date"
              type="date"
              value={
                pricing.discountStartDate || ""
              }
              onChange={(value) =>
                updatePricing(
                  "discountStartDate",
                  value
                )
              }
            />

            <FormInput
              label="Discount End Date"
              type="date"
              value={
                pricing.discountEndDate || ""
              }
              onChange={(value) =>
                updatePricing(
                  "discountEndDate",
                  value
                )
              }
            />
          </div>

          {
            discountPercentage > 0 && (
              <div
                className="
                  bg-green-50
                  border
                  border-green-200
                  p-4
                  rounded-xl
                  text-green-800
                  flex
                  items-center
                  justify-between
                "
              >
                <span className="text-sm font-medium">Applied Promotional Discount</span>
                <strong className="text-base">
                  {discountPercentage}% OFF
                </strong>
              </div>
            )
          }
        </div>
      </SectionCard>
    </div>
  );
}
