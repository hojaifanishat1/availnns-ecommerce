"use client";

import {
  useState,
  useCallback
} from "react";

import {
  ProductForm
} from "@/types/productForm";

export default function useProductForm(
  initialData: ProductForm
) {
  const [
    form,
    setForm
  ] = useState<ProductForm>(
    initialData
  );

  const updateField = useCallback((
    field: keyof ProductForm,
    value: unknown
  ) => {
    setForm(
      prev => (
        {
          ...prev,
          [field]:
            value
        }
      )
    );
  }, []);

  const updateNestedField = useCallback((
    parent: keyof ProductForm,
    field: string,
    value: unknown
  ) => {
    setForm(
      prev => (
        {
          ...prev,
          [parent]:
            {
              ...(typeof prev[parent] === "object" && prev[parent] !== null
                ? (prev[parent] as Record<string, unknown>)
                : {}),
              [field]:
                value
            }
        }
      )
    );
  }, []);

  const resetForm = useCallback(() => {
    setForm(initialData);
  }, [initialData]);

  const setFormData = useCallback((
    data: ProductForm
  ) => {
    setForm(data);
  }, []);

  return {
    form,
    setFormData,
    updateField,
    updateNestedField,
    resetForm
  };
}
