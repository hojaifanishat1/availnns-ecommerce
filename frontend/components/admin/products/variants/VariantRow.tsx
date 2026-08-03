"use client";


import {
  Trash2,
} from "lucide-react";


interface Props {

variant:any;

index:number;

onChange:(

index:number,

key:string,

value:any

)=>void;


onDelete:(index:number)=>void;


}



export default function VariantRow({

variant,

index,

onChange,

onDelete

}:Props){



return (

<div

className="
grid
grid-cols-6
gap-3
items-center
border
rounded-lg
p-3
"

>



<input

className="
border
rounded
px-3
py-2
"

placeholder="SKU"

value={variant.sku}

onChange={(e)=>

onChange(

index,

"sku",

e.target.value

)

}

/>





<input

className="
border
rounded
px-3
py-2
"

placeholder="Size"

value={variant.size || ""}

onChange={(e)=>

onChange(

index,

"size",

e.target.value

)

}

/>





<input

className="
border
rounded
px-3
py-2
"

placeholder="Color"

value={variant.color || ""}

onChange={(e)=>

onChange(

index,

"color",

e.target.value

)

}

/>






<input

type="number"

className="
border
rounded
px-3
py-2
"

placeholder="Stock"

value={variant.stock}

onChange={(e)=>

onChange(

index,

"stock",

Number(e.target.value)

)

}

/>






<input

type="number"

className="
border
rounded
px-3
py-2
"

placeholder="Price"

value={variant.price || ""}

onChange={(e)=>

onChange(

index,

"price",

Number(e.target.value)

)

}

/>





<button

onClick={()=>onDelete(index)}

className="
text-red-500
"

>

<Trash2 size={18}/>

</button>




</div>

);


}