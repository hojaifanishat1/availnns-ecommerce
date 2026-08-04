"use client";

import SectionCard
from "../shared/SectionCard";

import FormInput
from "../shared/FormInput";

import FormTextarea
from "../shared/FormTextarea";

import {
  useProductFormContext
} from "@/context/ProductFormContext";

interface SeoData {
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  keywords?: string[];
}

export default function SeoStep() {
  const {
    form,
    updateField
  } = useProductFormContext();

  const seo: SeoData = form.seo || {
    metaTitle: "",
    metaDescription: "",
    slug: "",
    keywords: []
  };

  const updateSeo = (
    key: keyof SeoData,
    value: unknown
  ) => {
    updateField(
      "seo",
      {
        ...seo,
        [key]: value
      }
    );
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="SEO Settings"
        description="Optimize product for search engines to improve visibility and discoverability."
      >
        <div className="space-y-4">
          <FormInput
            label="Meta Title"
            placeholder="e.g. Premium Leather Jacket | Noptrix"
            value={seo.metaTitle || ""}
            onChange={(value) =>
              updateSeo(
                "metaTitle",
                value
              )
            }
          />

          <FormTextarea
            label="Meta Description"
            placeholder="Write a brief summary of the product for search engine result pages..."
            value={seo.metaDescription || ""}
            onChange={(value) =>
              updateSeo(
                "metaDescription",
                value
              )
            }
          />

          <FormInput
            label="URL Slug"
            placeholder="e.g. premium-leather-jacket"
            value={seo.slug || ""}
            onChange={(value) =>
              updateSeo(
                "slug",
                value
              )
            }
          />

          <FormInput
            label="Keywords"
            placeholder="jacket, leather, apparel, fashion (comma-separated)"
            value={
              Array.isArray(seo.keywords)
                ? seo.keywords.join(", ")
                : ""
            }
            onChange={(value) =>
              updateSeo(
                "keywords",
                typeof value === "string"
                  ? value.split(",").map(k => k.trim()).filter(Boolean)
                  : []
              )
            }
          />
        </div>
      </SectionCard>
    </div>
  );
}
