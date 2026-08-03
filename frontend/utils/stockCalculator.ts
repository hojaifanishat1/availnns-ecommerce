export function calculateAvailableStock(

stock:number,

reserved:number

){



return Math.max(

0,

stock - reserved

);


}







export function calculateStockStatus(

stock:number,

threshold:number

){



if(stock<=0){


return "out-of-stock";


}





if(stock<=threshold){


return "low-stock";


}







return "in-stock";


}








export function calculateTotalVariantStock(

variants:any[]

){



return variants.reduce(

(total,item)=>

total + (

item.stock || 0

),

0

);


}