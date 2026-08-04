import { configureStore } from "@reduxjs/toolkit";

// =========================
// EXISTING REDUCERS
// =========================
import productReducer from "./slices/productSlice";
import filterReducer from "./slices/filterSlice";
import categoryReducer from "./slices/categorySlice";

// =========================
// PRODUCT WIZARD REDUCERS
// =========================
import productFormReducer from "./product/productFormSlice";
import productWizardReducer from "./product/productWizardSlice";

// =========================
// STORE
// =========================
export const store = configureStore({
  reducer: {
    // PRODUCTS
    products: productReducer,

    // SHOP FILTER
    filter: filterReducer,

    // CATEGORIES
    category: categoryReducer,

    // ADMIN PRODUCT FORM
    productForm: productFormReducer,

    // ADMIN PRODUCT WIZARD
    productWizard: productWizardReducer,
  },
  // মিডলওয়্যার কনফিগারেশন (ডিফল্ট সিরিয়ালাইজেবল চেক অপ্টিমাইজ করার জন্য যদি প্রয়োজন হয়)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // বড় ফাইল অবজেক্ট বা ইমেজ হ্যান্ডেল করার সময় রেডক্স ওয়ার্নিং এড়াতে সহায়তা করে
    }),
});

// =========================
// TYPES
// =========================
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
