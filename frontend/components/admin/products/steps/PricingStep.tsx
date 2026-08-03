"use client";


import SectionCard
from "../shared/SectionCard";


import FormInput
from "../shared/FormInput";


import FormSelect
from "../shared/FormSelect";


import {
  useProductFormContext,
} from "@/context/ProductFormContext";


import {
  calculateDiscount,
} from "@/utils/productCalculator";





export default function PricingStep(){


const {

form,

updateField

}=useProductFormContext();




const pricing =
form.pricing;



const discountPercentage =

pricing.discountPrice

?

calculateDiscount(

pricing.price,

pricing.discountPrice

)

:

0;





const updatePricing=(

key:string,

value:any

)=>{


updateField(

"pricing",

{

...pricing,

[key]:

value

}

);



};







return (

<div

className="
space-y-6
"

>


<SectionCard


title="Product Pricing"


description="Set your product price and discount"

>



<FormInput


label="Regular Price"


type="number"


value={

pricing.price || ""

}


onChange={(value)=>

updatePricing(

"price",

Number(value)

)

}


/>





<FormInput


label="Discount Price"


type="number"


value={

pricing.discountPrice || ""

}


onChange={(value)=>

updatePricing(

"discountPrice",

Number(value)

)

}


/>







<FormSelect


label="Currency"


value={

pricing.currency || "USD"

}


options={[


{

label:"USD ($)",

value:"USD"

},


{

label:"SAR (﷼)",

value:"SAR"

},


{

label:"BDT (৳)",

value:"BDT"

}


]}



onChange={(value)=>

updatePricing(

"currency",

value

)

}


/>








<div

className="
grid
grid-cols-2
gap-4

"

>


<FormInput


label="Discount Start Date"


type="date"


value={

pricing.discountStartDate || ""

}


onChange={(value)=>

updatePricing(

"discountStartDate",

value

)

}


/>




<FormInput


label="Discount End Date"


type="date"


value={

pricing.discountEndDate || ""

}


onChange={(value)=>

updatePricing(

"discountEndDate",

value

)

}


/>



</div>







{

discountPercentage > 0 && (

<div

className="
bg-green-50
p-3
rounded-lg
text-green-700
"

>


Discount:

<strong>

{discountPercentage}%

</strong>



</div>

)

}



</SectionCard>



</div>

);


}