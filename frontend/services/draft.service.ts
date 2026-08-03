import api from "./api";





export async function saveProductDraft(

data:any

){



const res = await api.post(

"/products/draft",

data

);



return res.data;


}








export async function getProductDraft(

id:string

){



const res = await api.get(

`/products/draft/${id}`

);



return res.data;


}








export async function updateProductDraft(

id:string,

data:any

){



const res = await api.put(

`/products/draft/${id}`,

data

);



return res.data;


}








export async function deleteProductDraft(

id:string

){



const res = await api.delete(

`/products/draft/${id}`

);



return res.data;


}