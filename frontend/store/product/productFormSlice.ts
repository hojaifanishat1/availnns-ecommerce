import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductForm } from "@/types/productForm";
import { DEFAULT_PRODUCT_FORM } from "@/constants/product";

interface ProductFormState {
  data: ProductForm;
  dirty: boolean;
}

const initialState: ProductFormState = {
  data: {
    ...DEFAULT_PRODUCT_FORM,
  },
  dirty: false,
};

const productFormSlice = createSlice({
  name: "productForm",
  initialState,
  reducers: {
    setProductForm: (state, action: PayloadAction<ProductForm>) => {
      state.data = action.payload;
      state.dirty = true;
    },

    updateProductField: <K extends keyof ProductForm>(
      state: state,
      action: PayloadAction<{
        field: K;
        value: ProductForm[K];
      }>
    ) => {
      const { field, value } = action.payload;
      state.data[field] = value;
      state.dirty = true;
    },

    updateNestedField: <K extends keyof ProductForm>(
      state: ProductFormState,
      action: PayloadAction<{
        parent: K;
        field: string;
        value: any;
      }>
    ) => {
      const { parent, field, value } = action.payload;

      if (
        state.data[parent] &&
        typeof state.data[parent] === "object" &&
        state.data[parent] !== null
      ) {
        (state.data[parent] as Record<string, any>)[field] = value;
      }

      state.dirty = true;
    },

    updateCategoryField: (
      state,
      action: PayloadAction<{
        key: string;
        value: any;
      }>
    ) => {
      if (!state.data.categoryFields) {
        state.data.categoryFields = {};
      }
      state.data.categoryFields[action.payload.key] = action.payload.value;
      state.dirty = true;
    },

    updateArrayField: <K extends keyof ProductForm>(
      state: ProductFormState,
      action: PayloadAction<{
        field: K;
        value: ProductForm[K];
      }>
    ) => {
      const { field, value } = action.payload;
      state.data[field] = value;
      state.dirty = true;
    },

    resetProductForm: (state) => {
      state.data = {
        ...DEFAULT_PRODUCT_FORM,
        categoryFields: {},
      };
      state.dirty = false;
    },

    markSaved: (state) => {
      state.dirty = false;
    },
  },
});

export const {
  setProductForm,
  updateProductField,
  updateNestedField,
  updateCategoryField,
  updateArrayField,
  resetProductForm,
  markSaved,
} = productFormSlice.actions;

export default productFormSlice.reducer;
