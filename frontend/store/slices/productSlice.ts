import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  getProducts,
  getBestSellerProducts,
  getNewArrivalProducts,
  getDealProducts,
} from "@/services/product.service";


// ===============================
// FETCH ALL PRODUCTS
// ===============================

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",

  async () => {
    const data =
      await getProducts();

    return data;
  }
);


// ===============================
// FETCH BEST SELLERS
// ===============================

export const fetchBestSellerProducts =
  createAsyncThunk(
    "products/fetchBestSellerProducts",

    async () => {
      const data =
        await getBestSellerProducts();

      return data;
    }
  );


// ===============================
// FETCH NEW ARRIVALS
// ===============================

export const fetchNewArrivalProducts =
  createAsyncThunk(
    "products/fetchNewArrivalProducts",

    async () => {
      const data =
        await getNewArrivalProducts();

      return data;
    }
  );


// ===============================
// FETCH DEAL PRODUCTS
// ===============================

export const fetchDealProducts =
  createAsyncThunk(
    "products/fetchDealProducts",

    async () => {
      const data =
        await getDealProducts();

      return data;
    }
  );


// ===============================
// TYPES
// ===============================

interface ProductState {
  products: any[];

  bestSellers: any[];

  newArrivals: any[];

  deals: any[];

  loading: boolean;

  error: string | null;
}


// ===============================
// INITIAL STATE
// ===============================

const initialState: ProductState = {
  products: [],

  bestSellers: [],

  newArrivals: [],

  deals: [],

  loading: false,

  error: null,
};


// ===============================
// SLICE
// ===============================

const productSlice = createSlice({
  name: "products",

  initialState,

  reducers: {
    clearProducts: (state) => {
      state.products = [];

      state.bestSellers = [];

      state.newArrivals = [];

      state.deals = [];

      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =========================
      // ALL PRODUCTS
      // =========================

      .addCase(
        fetchProducts.pending,

        (state) => {
          state.loading = true;

          state.error = null;
        }
      )

      .addCase(
        fetchProducts.fulfilled,

        (state, action: any) => {
          state.loading = false;

          state.products =
            action.payload || [];
        }
      )

      .addCase(
        fetchProducts.rejected,

        (state) => {
          state.loading = false;

          state.error =
            "Failed to load products";
        }
      )


      // =========================
      // BEST SELLERS
      // =========================

      .addCase(
        fetchBestSellerProducts.pending,

        (state) => {
          state.loading = true;

          state.error = null;
        }
      )

      .addCase(
        fetchBestSellerProducts.fulfilled,

        (state, action: any) => {
          state.loading = false;

          state.bestSellers =
            action.payload || [];
        }
      )

      .addCase(
        fetchBestSellerProducts.rejected,

        (state) => {
          state.loading = false;

          state.error =
            "Failed to load best seller products";
        }
      )


      // =========================
      // NEW ARRIVALS
      // =========================

      .addCase(
        fetchNewArrivalProducts.pending,

        (state) => {
          state.loading = true;

          state.error = null;
        }
      )

      .addCase(
        fetchNewArrivalProducts.fulfilled,

        (state, action: any) => {
          state.loading = false;

          state.newArrivals =
            action.payload || [];
        }
      )

      .addCase(
        fetchNewArrivalProducts.rejected,

        (state) => {
          state.loading = false;

          state.error =
            "Failed to load new arrival products";
        }
      )


      // =========================
      // DEAL PRODUCTS
      // =========================

      .addCase(
        fetchDealProducts.pending,

        (state) => {
          state.loading = true;

          state.error = null;
        }
      )

      .addCase(
        fetchDealProducts.fulfilled,

        (state, action: any) => {
          state.loading = false;

          state.deals =
            action.payload || [];
        }
      )

      .addCase(
        fetchDealProducts.rejected,

        (state) => {
          state.loading = false;

          state.error =
            "Failed to load deal products";
        }
      );
  },
});


// ===============================
// ACTIONS
// ===============================

export const {
  clearProducts,
} = productSlice.actions;


// ===============================
// REDUCER
// ===============================

export default productSlice.reducer;