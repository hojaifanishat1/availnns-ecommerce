"use client";


import {

useProductFormContext

} from "@/context/ProductFormContext";


import generateSKU from "@/utils/generateSKU";


import FormInput from "../shared/FormInput";





export default function VariantStep(){



const {

form,

updateField

}=useProductFormContext();








const variants = form.variants || [];









const addVariant=()=>{


const newVariant:any = {


sku:generateSKU("VAR"),


size:"",


color:"",


colorHex:"",


stock:0,


price:0,


discountPrice:0,


image:"",


active:true,


};





updateField(

"variants",

[

...variants,

newVariant

]

);



};










const updateVariant=(

index:number,

field:string,

value:any

)=>{


const updated = [...variants];



updated[index] = {


...updated[index],


[field]:value,


};




updateField(

"variants",

updated

);



};









const removeVariant=(

index:number

)=>{


const updated = variants.filter(

(_,i)=>i!==index

);



updateField(

"variants",

updated

);



};









return (



<div className="space-y-6">





<div>


<h2 className="text-xl font-semibold">

Product Variants

</h2>



<p className="text-sm text-muted-foreground">

Add size, color and stock variations.

</p>


</div>









<button


type="button"


onClick={addVariant}


className="
px-4
py-2
rounded-md
bg-black
text-white
"


>

Add Variant

</button>









<div className="space-y-5">



{

variants.map(

(variant:any,index:number)=>(


<div


key={index}


className="
border
rounded-lg
p-4
space-y-4
"


>






<div className="grid grid-cols-1 md:grid-cols-2 gap-4">





<FormInput


label="SKU"


value={variant.sku}


onChange={(value)=>

updateVariant(

index,

"sku",

value

)

}


/>









<FormInput


label="Size"


value={variant.size}


onChange={(value)=>

updateVariant(

index,

"size",

value

)

}


/>









<FormInput


label="Color"


value={variant.color}


onChange={(value)=>

updateVariant(

index,

"color",

value

)

}


/>









<FormInput


label="Color Hex"


value={variant.colorHex}


onChange={(value)=>

updateVariant(

index,

"colorHex",

value

)

}


/>









<FormInput


label="Stock"


type="number"


value={variant.stock}


onChange={(value)=>

updateVariant(

index,

"stock",

Number(value)

)

}


/>









<FormInput


label="Price"


type="number"


value={variant.price}


onChange={(value)=>

updateVariant(

index,

"price",

Number(value)

)

}


/>









<FormInput


label="Discount Price"


type="number"


value={variant.discountPrice}


onChange={(value)=>

updateVariant(

index,

"discountPrice",

Number(value)

)

}


/>







</div>








<button


type="button"


onClick={()=>removeVariant(index)}


className="
text-red-500
text-sm
"


>

Remove Variant

</button>








</div>


)

)


}







</div>







</div>


);



}