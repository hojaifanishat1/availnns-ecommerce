import {

createSlice,

PayloadAction

} from "@reduxjs/toolkit";



import {

ProductForm

} from "@/types/productForm";



import {

DEFAULT_PRODUCT_FORM

} from "@/constants/product";







interface ProductFormState {


data:ProductForm;


dirty:boolean;


}








const initialState:ProductFormState = {


data:{

...DEFAULT_PRODUCT_FORM

},


dirty:false,


};









const productFormSlice = createSlice({



name:"productForm",



initialState,



reducers:{







setProductForm:(

state,

action:PayloadAction<ProductForm>

)=>{


state.data = action.payload;


state.dirty = true;


},







updateProductField:(

state,

action:PayloadAction<{

field:keyof ProductForm;

value:any;

}>

)=>{



const {

field,

value

}=action.payload;







(state.data as any)[field] = value;






state.dirty = true;



},







updateNestedField:(

state,

action:PayloadAction<{

parent:keyof ProductForm;

field:string;

value:any;

}>

)=>{



const {

parent,

field,

value

}=action.payload;








if(

typeof state.data[parent] === "object"

&&

state.data[parent] !== null

){



(state.data[parent] as any)[field]

=

value;



}






state.dirty = true;



},







updateCategoryField:(

state,

action:PayloadAction<{

key:string;

value:any;

}>

)=>{



state.data.categoryFields[

action.payload.key

]

=

action.payload.value;






state.dirty = true;



},







updateArrayField:(

state,

action:PayloadAction<{

field:keyof ProductForm;

value:any[];

}>

)=>{



(state.data as any)[action.payload.field]

=

action.payload.value;






state.dirty = true;



},







resetProductForm:(state)=>{



state.data = {


...DEFAULT_PRODUCT_FORM,


categoryFields:{}


};



state.dirty = false;



},







markSaved:(state)=>{



state.dirty = false;



}







}



});









export const {



setProductForm,


updateProductField,


updateNestedField,


updateCategoryField,


updateArrayField,


resetProductForm,


markSaved



}=productFormSlice.actions;









export default productFormSlice.reducer;