export function calculateDiscount(

price:number,

discountPrice:number

){



if(

!price ||

!discountPrice

)

return 0;





const discount =

(

price -

discountPrice

)

/

price

*

100;





return Math.round(discount);


}







export function calculateTax(

price:number,

taxRate:number=5

){



return (

price *

taxRate

)

/

100;


}







export function calculateFinalPrice(

price:number,

discountPrice?:number

){



return (

discountPrice &&

discountPrice < price

)

?

discountPrice

:

price;


}