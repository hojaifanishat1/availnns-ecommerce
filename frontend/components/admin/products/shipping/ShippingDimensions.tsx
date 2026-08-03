"use client";


import {
  useMemo,
} from "react";


interface Props {


weight?:number;


length?:number;


width?:number;


height?:number;


onChange?:(

key:string,

value:number

)=>void;


}





export default function ShippingDimensions({

weight=0,

length=0,

width=0,

height=0,

onChange

}:Props){





const volumetricWeight =

useMemo(()=>{


return (

length *

width *

height

)

/

5000;


},[

length,

width,

height

]);






return (

<div

className="
border
rounded-xl
p-5
space-y-5
"

>



<h3

className="
font-semibold
text-lg
"

>

Package Dimensions

</h3>






<div

className="
grid
grid-cols-2
gap-4
"

>



<div>

<label className="text-sm">

Weight (kg)

</label>


<input

type="number"

value={weight}

onChange={(e)=>

onChange?.(

"weight",

Number(e.target.value)

)

}

className="
border
rounded-lg
w-full
px-3
py-2
"

/>


</div>






<div>

<label className="text-sm">

Length (cm)

</label>


<input

type="number"

value={length}

onChange={(e)=>

onChange?.(

"length",

Number(e.target.value)

)

}

className="
border
rounded-lg
w-full
px-3
py-2
"

/>


</div>







<div>

<label className="text-sm">

Width (cm)

</label>


<input

type="number"

value={width}

onChange={(e)=>

onChange?.(

"width",

Number(e.target.value)

)

}

className="
border
rounded-lg
w-full
px-3
py-2
"

/>


</div>







<div>

<label className="text-sm">

Height (cm)

</label>


<input

type="number"

value={height}

onChange={(e)=>

onChange?.(

"height",

Number(e.target.value)

)

}

className="
border
rounded-lg
w-full
px-3
py-2
"

/>


</div>




</div>







<div

className="
bg-gray-100
rounded-lg
p-3
"

>


<p>

Volumetric Weight:

<strong>

{" "}

{

volumetricWeight.toFixed(2)

}

kg

</strong>


</p>



</div>





</div>

);


}