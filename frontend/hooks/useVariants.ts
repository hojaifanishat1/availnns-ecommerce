"use client";

import {
  useState,
  useCallback
} from "react";

export interface ProductVariant {
  id?: string;
  sku?: string;
  price?: number;
  stock?: number;
  attributes?: Record<string, string>;
  [key: string]: unknown;
}

export default function useVariants(
  initial: ProductVariant[] = []
) {
  const [
    variants,
    setVariants
  ] = useState<ProductVariant[]>(initial);

  const addVariant = useCallback((
    variant: ProductVariant
  ) => {
    setVariants(
      prev => [
        ...prev,
        variant
      ]
    );
  }, []);

  const updateVariant = useCallback((
    index: number,
    key: string,
    value: unknown
  ) => {
    setVariants(
      prev =>
        prev.map(
          (item, i) =>
            i === index
              ? {
                  ...item,
                  [key]:
                    value
                }
              : item
        )
    );
  }, []);

  const removeVariant = useCallback((
    index: number
  ) => {
    setVariants(
      prev =>
        prev.filter(
          (_, i) =>
            i !== index
        )
    );
  }, []);

  const generateVariants = useCallback((
    items: ProductVariant[]
  ) => {
    setVariants(items);
  }, []);

  return {
    variants,
    setVariants,
    addVariant,
    updateVariant,
    removeVariant,
    generateVariants
  };
}
