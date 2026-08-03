"use client";



import {

Trash2

} from "lucide-react";




interface Props {


variant:any;


index:number;


onChange:(

index:number,

key:string,

value:any

)=>void;


onDelete:(

index:number

)=>void;


}




export default function VariantTableRow({

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
border-b
py-3
"

>




<input

value={variant.sku || ""}

onChange={(e)=>

onChange(

index,

"sku",

e.target.value

)

}

className="
border
rounded
px-2
py-1
"

/>





<input

value={variant.size || ""}

onChange={(e)=>

onChange(

index,

"size",

e.target.value

)

}

className="
border
rounded
px-2
py-1
"

/>





<input

value={variant.color || ""}

onChange={(e)=>

onChange(

index,

"color",

e.target.value

)

}

className="
border
rounded
px-2
py-1
"

/>






<input

type="number"

value={variant.stock || 0}

onChange={(e)=>

onChange(

index,

"stock",

Number(e.target.value)

)

}

className="
border
rounded
px-2
py-1
"

/>





<input

type="number"

value={variant.price || 0}

onChange={(e)=>

onChange(

index,

"price",

Number(e.target.value)

)

}

className="
border
rounded
px-2
py-1
"

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