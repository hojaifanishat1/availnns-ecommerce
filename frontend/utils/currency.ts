export function formatCurrency(

amount:number,

currency:string="SAR"

){



return new Intl.NumberFormat(

"en-US",

{

style:"currency",

currency

}

).format(amount);



}







export function convertCurrency(

amount:number,

rate:number

){


return amount * rate;


}