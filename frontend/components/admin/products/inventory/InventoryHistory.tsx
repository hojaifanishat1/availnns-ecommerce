"use client";


import {
  History,
  ArrowUp,
  ArrowDown,
} from "lucide-react";




interface InventoryRecord {


_id?:string;


previousStock:number;


newStock:number;


change:number;


action?:string;


createdAt?:string;


user?:string;


}





interface Props {


history:InventoryRecord[];


}





export default function InventoryHistory({

history=[]

}:Props){





return (

<div

className="
border
rounded-xl
p-5
space-y-4
"

>



<div

className="
flex
items-center
gap-2
"

>


<History size={20}/>


<h3

className="
font-semibold
text-lg
"

>

Inventory History

</h3>


</div>








{

history.length===0

?


<p

className="
text-gray-500
text-sm
"

>

No inventory changes yet.

</p>



:

history.map(

(item,index)=>(



<div

key={item._id || index}

className="
border
rounded-lg
p-4
flex
items-center
justify-between
"

>





<div>


<p className="font-medium">


{

item.action ||

"Stock Updated"

}


</p>



<p

className="
text-sm
text-gray-500
"

>


{

item.createdAt

?

new Date(

item.createdAt

).toLocaleDateString()

:

""

}


</p>


</div>








<div

className="
flex
items-center
gap-3
"

>



<span>


{

item.previousStock

}

→

{

item.newStock

}


</span>





{

item.change >=0

?

(

<ArrowUp

className="
text-green-600
"

/>

)

:

(

<ArrowDown

className="
text-red-600
"

/>

)

}





</div>





</div>



)


)



}



</div>


);


}