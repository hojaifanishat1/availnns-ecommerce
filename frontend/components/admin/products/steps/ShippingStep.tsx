"use client";


import {
  useProductFormContext
} from "@/context/ProductFormContext";


import FormInput from "../shared/FormInput";







export default function ShippingStep(){



const {

form,

updateNestedField

}=useProductFormContext();





const shipping = form.shipping;






return (



<div className="space-y-6">






<div>

<h2 className="text-xl font-semibold">

Shipping Information

</h2>


<p className="text-sm text-muted-foreground">

Manage package weight and dimensions.

</p>


</div>









{/* Weight */}


<div className="space-y-4">


<h3 className="font-medium">

Package Weight

</h3>





<FormInput


label="Weight"


type="number"


value={shipping.weight.value}


onChange={(value)=>

updateNestedField(

"shipping",

"weight",

{

...shipping.weight,

value:Number(value)

}

)

}


/>





</div>









{/* Dimensions */}


<div className="space-y-4">


<h3 className="font-medium">

Package Dimensions

</h3>






<FormInput


label="Length (cm)"


type="number"


value={shipping.dimensions.length}


onChange={(value)=>

updateNestedField(

"shipping",

"dimensions",

{

...shipping.dimensions,

length:Number(value)

}

)

}


/>







<FormInput


label="Width (cm)"


type="number"


value={shipping.dimensions.width}


onChange={(value)=>

updateNestedField(

"shipping",

"dimensions",

{

...shipping.dimensions,

width:Number(value)

}

)

}


/>







<FormInput


label="Height (cm)"


type="number"


value={shipping.dimensions.height}


onChange={(value)=>

updateNestedField(

"shipping",

"dimensions",

{

...shipping.dimensions,

height:Number(value)

}

)

}


/>







</div>









{/* Free Shipping */}


<div className="flex items-center gap-3">



<input


type="checkbox"


checked={shipping.freeShipping}


onChange={(e)=>

updateNestedField(

"shipping",

"freeShipping",

e.target.checked

)

}


/>



<label>

Free Shipping

</label>



</div>









</div>


);



}