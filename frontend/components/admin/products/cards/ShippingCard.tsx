"use client";


import {

Truck

} from "lucide-react";




interface Props {


shipping:any;


}





export default function ShippingCard({

shipping

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




<div

className="
flex
items-center
gap-2
"

>


<Truck size={18}/>


<h3 className="font-semibold">

Shipping

</h3>


</div>






<div className="grid grid-cols-2 gap-3 text-sm">



<div>

Weight

<p className="font-semibold">

{

shipping?.weight || 0

}

kg

</p>


</div>






<div>

Length

<p className="font-semibold">

{

shipping?.length || 0

}

cm

</p>


</div>







<div>

Width

<p className="font-semibold">

{

shipping?.width || 0

}

cm

</p>


</div>







<div>

Height

<p className="font-semibold">

{

shipping?.height || 0

}

cm

</p>


</div>




</div>






</div>


);


}