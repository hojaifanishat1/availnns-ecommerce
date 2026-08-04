"use client";

import {
  useState,
  useCallback
} from "react";

import {
  ProductSeo
} from "@/types/seo";

const DEFAULT_SEO: ProductSeo = {
  metaTitle: "",
  metaDescription: "",
  slug: "",
  keywords: []
};

export default function useSeo(
  initialData?: ProductSeo
) {
  const [
    seo,
    setSeo
  ] = useState<ProductSeo>(
    initialData || DEFAULT_SEO
  );

  const updateSeo = useCallback((
    field: keyof ProductSeo,
    value: unknown
  ) => {
    setSeo(
      prev => (
        {
          ...prev,
          [field]:
            value
        }
      )
    );
  }, []);

  const resetSeo = useCallback(() => {
    setSeo(DEFAULT_SEO);
  }, []);

  return {
    seo,
    setSeo,
    updateSeo,
    resetSeo
  };
}
