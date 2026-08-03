"use client";


import {
  useProductFormContext
} from "@/context/ProductFormContext";


import FormInput from "../shared/FormInput";






export default function InventoryStep(){



const {

form,

updateField

}=useProductFormContext();







return (



<div className="space-y-6">





<div>

<h2 className="text-xl font-semibold">

Inventory

</h2>


<p className="text-sm text-muted-foreground">

Manage stock quantity and inventory settings.

</p>


</div>









<div className="grid grid-cols-1 md:grid-cols-2 gap-5">






<FormInput


label="Stock Quantity"


type="number"


value={form.stock}


onChange={(value)=>

updateField(

"stock",

Number(value)

)

}


/>









<FormInput


label="Low Stock Threshold"


type="number"


value={form.lowStockThreshold}


onChange={(value)=>

updateField(

"lowStockThreshold",

Number(value)

)

}


/>





</div>









<div className="border rounded-lg p-4 space-y-3">


<h3 className="font-semibold">

Inventory Summary

</h3>





<div className="text-sm">


<p>

Current Stock:

{" "}

<span className="font-medium">

{form.stock}

</span>

</p>





<p>

Low Stock Alert:

{" "}

<span className="font-medium">

{form.lowStockThreshold}

</span>

</p>







<p>

Status:

{" "}

<span className="font-medium">


{

form.stock === 0

?

"Out of Stock"

:

form.stock <= form.lowStockThreshold

?

"Low Stock"

:

"In Stock"

}


</span>

</p>




</div>



</div>







</div>


);



}