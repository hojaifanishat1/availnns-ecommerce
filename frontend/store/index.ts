import {
  configureStore,
} from "@reduxjs/toolkit";


// =========================
// EXISTING REDUCERS
// =========================

import productReducer 
from "./slices/productSlice";


import filterReducer 
from "./slices/filterSlice";


import categoryReducer 
from "./slices/categorySlice";



// =========================
// PRODUCT WIZARD REDUCERS
// =========================

import productFormReducer
from "./product/productFormSlice";


import productWizardReducer
from "./product/productWizardSlice";




// =========================
// STORE
// =========================

export const store = 
configureStore({

  reducer: {


    // PRODUCTS
    products: productReducer,


    // SHOP FILTER
    filter: filterReducer,


    // CATEGORIES
    category: categoryReducer,



    // ADMIN PRODUCT FORM
    productForm:
      productFormReducer,



    // ADMIN PRODUCT WIZARD
    productWizard:
      productWizardReducer,


  },


});




// =========================
// TYPES
// =========================

export type RootState =
ReturnType<
  typeof store.getState
>;



export type AppDispatch =
typeof store.dispatch;