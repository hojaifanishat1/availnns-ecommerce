export const formErrors={



required:(field:string)=>

`${field} is required`,




invalid:(field:string)=>

`${field} is invalid`,




min:(field:string,value:number)=>

`${field} minimum value is ${value}`,




max:(field:string,value:number)=>

`${field} maximum value is ${value}`



};






export function hasErrors(

errors:any

){



return Object.keys(errors).length>0;


}