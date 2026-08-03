"use client";



export default function VariantTableHeader(){


const headers=[

"SKU",

"Size",

"Color",

"Stock",

"Price",

"Action"

];




return (

<div

className="
grid
grid-cols-6
gap-3
border-b
pb-3
font-semibold
text-sm
"

>


{

headers.map(

(header,index)=>(


<div

key={index}

>

{header}

</div>


)

)


}



</div>

);


}