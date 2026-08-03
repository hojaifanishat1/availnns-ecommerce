"use client";


import SectionCard
from "../shared/SectionCard";


import {
useProductFormContext
} from "@/context/ProductFormContext";





export default function ReviewStep(){


const {

form

}=useProductFormContext();





return (

<div className="space-y-6">


<SectionCard

title="Product Review"

description="Check details before saving"

>




<div className="space-y-3">


<h3 className="font-semibold">

{form.name || "Product Name"}

</h3>




<p>

{form.description}

</p>




<div>

Category:

<strong>

{form.category}

</strong>

</div>




<div>

Price:

<strong>

{form.pricing.price}

</strong>

</div>




<div>

Images:

<strong>

{form.images.length}

</strong>

</div>




<div>

Variants:

<strong>

{form.variants.length}

</strong>

</div>




<div>

Stock:

<strong>

{form.stock}

</strong>

</div>




</div>




</SectionCard>


</div>


);


}