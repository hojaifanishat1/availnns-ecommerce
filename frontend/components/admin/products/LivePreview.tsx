"use client";


import {

useProductFormContext

} from "@/context/ProductFormContext";



export default function LivePreview(){


const {

form

}=useProductFormContext();




return (

<div

className="
border
rounded-xl
p-5
space-y-3
"

>


<h2

className="
font-semibold
"

>

Live Preview

</h2>



{

form.images?.[0] && (

<img

src={
form.images[0].url
}

alt="preview"

className="
w-full
h-48
object-cover
rounded-lg
"

/>

)

}



<h3

className="
text-lg
font-bold
"

>

{form.name || "Product Name"}

</h3>



<p>

{

form.description ||

"Product description"

}

</p>



<p

className="
font-semibold
"

>

Price:

{form.pricing.price}

</p>



</div>

);


}