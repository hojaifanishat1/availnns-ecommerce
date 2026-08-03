"use client";


import {
  useEffect
} from "react";


import {
  useProductFormContext
} from "@/context/ProductFormContext";


import generateSlug from "@/utils/generateSlug";

import generateSKU from "@/utils/generateSKU";


import FormInput from "../shared/FormInput";







export default function BasicInfoStep(){



const {

form,

updateField

}=useProductFormContext();








useEffect(()=>{


if(

form.name && !form.slug

){


updateField(

"slug",

generateSlug(form.name)

);


}



},[

form.name,

form.slug

]);









const handleGenerateSKU=()=>{


const sku = generateSKU("PRD");


updateField(

"sku",

sku

);


};









return (



<div className="space-y-6">





<div>

<h2 className="text-xl font-semibold">

Basic Information

</h2>


<p className="text-sm text-muted-foreground">

Add product basic details.

</p>


</div>









<FormInput


label="Product Name"


placeholder="Enter product name"


value={form.name}


onChange={(value)=>

updateField(

"name",

value

)

}


/>









<FormInput


label="Brand"


placeholder="Enter brand name"


value={form.brand}


onChange={(value)=>

updateField(

"brand",

value

)

}


/>









<FormInput


label="Description"


placeholder="Enter product description"


value={form.description}


onChange={(value)=>

updateField(

"description",

value

)

}


/>









<div className="flex gap-3 items-end">


<div className="flex-1">


<FormInput


label="SKU"


placeholder="Generate or enter SKU"


value={form.sku}


onChange={(value)=>

updateField(

"sku",

value

)

}


/>


</div>





<button

type="button"

onClick={handleGenerateSKU}

className="
px-4
py-2
rounded-md
bg-black
text-white
"

>

Generate SKU

</button>



</div>









<FormInput


label="Slug"


placeholder="product-slug"


value={form.slug}


onChange={(value)=>

updateField(

"slug",

value

)

}


/>









<FormInput


label="Category"


placeholder="Category"


value={form.category}


onChange={(value)=>

updateField(

"category",

value

)

}


/>









<FormInput


label="Sub Category"


placeholder="Sub Category"


value={form.subCategory}


onChange={(value)=>

updateField(

"subCategory",

value

)

}


/>








</div>



);



}