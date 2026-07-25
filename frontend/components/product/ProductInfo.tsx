"use client";


import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  ShieldCheck,
  BadgeCheck,
  Sparkles,
  Heart,
  Share2,
} from "lucide-react";


import {
  useState,
} from "react";


import {
  useRouter,
} from "next/navigation";


import {
  Product,
} from "@/types/product";


import useCart
from "@/hooks/useCart";


import {
  useCurrency,
} from "@/context/CurrencyContext";





export default function ProductInfo({

product,

}:{
product:Product;

}){


const router =
useRouter();



const {
addItem
}=useCart();




const {
formatPrice
}=useCurrency();





const [
quantity,
setQuantity
]=useState(1);



const [
adding,
setAdding
]=useState(false);




const [
selectedSize,
setSelectedSize
]=useState("");



const [
selectedColor,
setSelectedColor
]=useState("");








const discountPercentage =

product.discountPrice &&
product.discountPrice < product.price

?

Math.round(

(
(product.price-product.discountPrice)
/
product.price
)
*
100

)

:0;








const handleAddToCart = async()=>{


try{


setAdding(true);


await addItem(

product._id,

quantity

);



router.push("/cart");



}
catch(error){

console.log(error);

}
finally{

setAdding(false);

}


};







const buyNow = async()=>{


try{


await addItem(

product._id,

quantity

);



router.push("/checkout");


}
catch(error){

console.log(error);

}


};







return (

<div
className="
space-y-6
"
>





{/* BADGES */}

<div
className="
flex
gap-3
flex-wrap
"
>


{
product.isBestSeller &&

<span
className="
bg-black
text-white
px-4
py-2
rounded-full
flex
items-center
gap-2
text-sm
"
>

<BadgeCheck size={16}/>

Best Seller

</span>

}



{
product.isNewArrival &&

<span
className="
bg-green-600
text-white
px-4
py-2
rounded-full
flex
items-center
gap-2
text-sm
"
>

<Sparkles size={16}/>

New Arrival

</span>

}


</div>







<h1
className="
text-4xl
font-bold
"
>

{product.name}

</h1>







<div
className="
flex
gap-3
"
>


<button
className="
border
rounded-full
p-3
"
>

<Heart/>

</button>



<button
className="
border
rounded-full
p-3
"
>

<Share2/>

</button>


</div>







{/* RATING */}

<div
className="
flex
items-center
gap-3
"
>


<div
className="
flex
text-yellow-500
"
>


{
[1,2,3,4,5]
.map(i=>(


<Star

key={i}

size={18}

fill={
i <= Math.round(product.rating)
?
"currentColor"
:
"none"
}

/>


))
}


</div>



<span
className="
text-gray-500
"
>

{product.rating || 0}

({product.numReviews || 0} Reviews)

</span>


</div>








{/* PRICE */}


<div
className="
flex
items-center
gap-4
"
>


<h2
className="
text-4xl
font-bold
"
>


{
formatPrice(

product.discountPrice &&
product.discountPrice > 0

?

product.discountPrice

:

product.price

)

}


</h2>




{
product.discountPrice > 0 &&


<>


<span
className="
line-through
text-gray-400
text-xl
"
>

{
formatPrice(product.price)

}

</span>



<span
className="
bg-red-100
text-red-600
px-3
py-1
rounded-full
"
>

-{discountPercentage}%

</span>


</>


}



</div>







{/* DESCRIPTION */}


<div
className="
bg-white
rounded-2xl
p-6
"
>


<h3
className="
font-bold
text-xl
mb-3
"
>

Description

</h3>



<p
className="
text-gray-600
leading-8
"
>

{product.description}

</p>


</div>









{/* SIZE */}


{
product.sizes &&
product.sizes.length > 0 &&


<div>


<h3
className="
font-bold
mb-3
"
>

Select Size

</h3>


<div
className="
flex
gap-3
flex-wrap
"
>


{
product.sizes.map(size=>(


<button

key={size}

onClick={()=>setSelectedSize(size)}

className={`
border
px-4
py-2
rounded-lg

${
selectedSize===size
?
"bg-black text-white"
:
""
}

`}

>

{size}

</button>


))

}


</div>


</div>

}








{/* COLOR */}


{
product.colors &&
product.colors.length >0 &&


<div>


<h3
className="
font-bold
mb-3
"
>

Select Color

</h3>


<div
className="
flex
gap-3
flex-wrap
"
>


{
product.colors.map(color=>(


<button

key={color}

onClick={()=>setSelectedColor(color)}

className={`
border
px-4
py-2
rounded-lg

${
selectedColor===color
?
"bg-black text-white"
:
""
}

`}

>

{color}

</button>


))

}


</div>


</div>

}








{/* SPECIFICATIONS */}


{
product.specifications &&
product.specifications.length>0 &&


<div
className="
bg-white
rounded-2xl
p-6
"
>


<h3
className="
font-bold
text-xl
mb-4
"
>

Specifications

</h3>



{

product.specifications.map(
(item,index)=>(


<div
key={index}
className="
flex
justify-between
border-b
py-2
"
>

<span
className="
text-gray-500
"
>

{item.key}

</span>



<span
className="
font-semibold
"
>

{item.value}

</span>


</div>


)

)

}



</div>

}







{/* PRODUCT INFO */}

<div
className="
grid
md:grid-cols-2
gap-4
"
>


<Info

title="Stock"

value={String(product.stock)}

/>



<Info

title="Category"

value={
typeof product.category==="object"
?
product.category.name
:
""
}

/>



{
product.warrantyPeriod &&

<Info

title="Warranty"

value={product.warrantyPeriod}

/>

}


</div>







{/* QUANTITY */}


<div
className="
flex
items-center
gap-5
"
>


<button

disabled={quantity<=1}

onClick={()=>setQuantity(q=>Math.max(1,q-1))}

className="
border
rounded-xl
p-3
"

>

<Minus/>

</button>




<span
className="
font-bold
text-xl
"
>

{quantity}

</span>




<button

disabled={quantity>=product.stock}

onClick={()=>setQuantity(q=>q+1)}

className="
border
rounded-xl
p-3
"

>

<Plus/>

</button>


</div>








{/* BUTTONS */}


<div
className="
flex
gap-4
"
>


<button

disabled={
adding ||
product.stock===0
}

onClick={handleAddToCart}

className="
flex-1
bg-black
text-white
rounded-xl
py-4
font-bold
"

>


<ShoppingCart
className="inline mr-2"
/>



{
product.stock===0

?

"Out Of Stock"

:

adding

?

"Adding..."

:

"Add To Cart"

}



</button>






<button

onClick={buyNow}

className="
flex-1
border
border-black
rounded-xl
font-bold
"

>

Buy Now

</button>


</div>







{/* SERVICE */}


<div
className="
bg-white
rounded-2xl
p-6
space-y-4
"
>


<div
className="
flex
gap-3
"
>

<Truck/>

Fast Delivery

</div>



<div
className="
flex
gap-3
"
>

<ShieldCheck/>

Secure Payment

</div>



{
product.freeShipping &&

<div>

🚚 Free Shipping Available

</div>

}


</div>





</div>


);

}







function Info({

title,

value,

}:{

title:string;

value:string;

}){


return (

<div
className="
bg-white
rounded-xl
p-4
"
>

<p
className="
text-gray-500
text-sm
"
>

{title}

</p>


<p
className="
font-bold
"
>

{value}

</p>


</div>

);

}