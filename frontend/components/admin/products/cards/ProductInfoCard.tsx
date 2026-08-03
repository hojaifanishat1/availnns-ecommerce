"use client";


import {

Package,

Tag,

Layers

} from "lucide-react";




interface Props {


product:any;


}




export default function ProductInfoCard({

product

}:Props){



return (

<div

className="
border
rounded-xl
p-5
space-y-4
bg-white
"

>



<h3

className="
font-semibold
text-lg
"

>

Product Information

</h3>





<div

className="
space-y-3
"

>



<div className="flex gap-2">

<Package size={18}/>

<span>

{

product.name ||

"Product Name"

}

</span>

</div>






<div className="flex gap-2">

<Tag size={18}/>

<span>

SKU:

{

product.sku || "-"

}

</span>

</div>







<div className="flex gap-2">

<Layers size={18}/>

<span>

Category:

{

product.category || "-"

}

</span>

</div>




</div>




</div>


);


}