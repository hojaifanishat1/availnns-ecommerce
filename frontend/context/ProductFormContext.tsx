"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import {
  ProductForm
} from "@/types/productForm";

interface ContextType {
  form: ProductForm;
  updateField: (
    field: keyof ProductForm,
    value: unknown
  ) => void;
  updateNestedField: (
    parent: keyof ProductForm,
    field: string,
    value: unknown
  ) => void;
  setForm: (
    data: ProductForm
  ) => void;
  resetForm: () => void;
}

const ProductFormContext =
  createContext<ContextType | null>(null);

export function ProductFormProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: ProductForm;
}) {
  const [
    form,
    setFormState
  ] = useState<ProductForm>(
    initialData
  );

  useEffect(() => {
    setFormState(initialData);
  }, [initialData]);

  const updateField = useCallback((
    field: keyof ProductForm,
    value: unknown
  ) => {
    setFormState(
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
    setFormState(
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

  const setForm = useCallback((
    data: ProductForm
  ) => {
    setFormState(data);
  }, []);

  const resetForm = useCallback(() => {
    setFormState(initialData);
  }, [initialData]);

  const contextValue = useMemo(() => ({
    form,
    updateField,
    updateNestedField,
    setForm,
    resetForm
  }), [
    form,
    updateField,
    updateNestedField,
    setForm,
    resetForm
  ]);

  return (
    <ProductFormContext.Provider
      value={contextValue}
    >
      {children}
    </ProductFormContext.Provider>
  );
}

export function useProductFormContext() {
  const context = useContext(
    ProductFormContext
  );

  if (!context) {
    throw new Error(
      "useProductFormContext must be used inside ProductFormProvider"
    );
  }

  return context;
}
