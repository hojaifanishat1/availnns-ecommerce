export function getPrimaryImage(

images:any[]

){



if(!images || images.length===0)

return "";





const primary =

images.find(

img=>img.isPrimary

);





return primary?.url || images[0].url;



}








export function getDiscountPercentage(

price:number,

discountPrice:number

){



if(!price || !discountPrice)

return 0;





return Math.round(

(

price -

discountPrice

)

/

price *

100

);



}








export function generateProductTitle(

brand:string,

name:string

){



if(!brand)

return name;



return `${brand} ${name}`;



}