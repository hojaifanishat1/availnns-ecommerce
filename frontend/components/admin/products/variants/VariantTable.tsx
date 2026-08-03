"use client";


import VariantRow
from "./VariantRow";




interface Props {


variants:any[];

onChange:(

index:number,

key:string,

value:any

)=>void;


onDelete:(index:number)=>void;


}




export default function VariantTable({

variants,

onChange,

onDelete

}:Props){



return (

<div className="space-y-3">


{

variants.map(

(variant,index)=>(


<VariantRow

key={index}

variant={variant}

index={index}

onChange={onChange}

onDelete={onDelete}

/>


)

)

}


</div>

);


}