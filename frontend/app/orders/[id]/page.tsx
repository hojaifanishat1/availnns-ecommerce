"use client";


import {
  useEffect,
  useState,
} from "react";


import {
  useParams,
  useRouter,
} from "next/navigation";


import Link from "next/link";


import {
  getOrderById,
} from "@/services/order.service";


import {
  Loader2,
  ArrowLeft,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function OrderDetailsPage(){


const params = useParams<{ id?: string | string[] }>();


const router = useRouter();



const rawId = params?.id;
const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : undefined;





const [order,setOrder]
=
useState<any>(null);



const [loading,setLoading]
=
useState(true);



const [error,setError]
=
useState("");







useEffect(()=>{


const fetchOrder = async()=>{


try{


setLoading(true);



const data =
await getOrderById(id);



setOrder(
data
);



}


catch(err:any){


setError(
"Failed to load order"
);


}


finally{


setLoading(false);


}



};



if(id){

fetchOrder();

}



},[id]);








if(loading){


return (

<div className="
min-h-screen
flex
items-center
justify-center
">


<Loader2

size={35}

className="
animate-spin
"

/>


</div>

);


}







if(error || !order){


return (

<div className="
min-h-screen
flex
flex-col
items-center
justify-center
gap-5
">


<h1 className="
text-2xl
font-bold
">

Order Not Found

</h1>



<Link

href="/orders"

className="
rounded-xl
bg-black
px-6
py-3
text-white
"

>

Back To Orders

</Link>


</div>

);


}






return (

<main className="
min-h-screen
bg-zinc-50
py-10
">


<div className="
max-w-6xl
mx-auto
px-5
">


<Link

href="/orders"

className="
inline-flex
items-center
gap-2
mb-6
text-zinc-600
"

>

<ArrowLeft size={18}/>

Back

</Link>

<div className="
rounded-3xl
border
bg-white
p-6
shadow-sm
">


<div className="
flex
flex-col
gap-5
md:flex-row
md:items-center
md:justify-between
">


<div>


<p className="
text-sm
text-zinc-500
">

Order ID

</p>


<h1 className="
mt-1
text-2xl
font-bold
break-all
">

#{order._id}

</h1>


</div>






<div className={`

rounded-full

px-5

py-2

font-semibold

text-sm


${
order.orderStatus==="delivered"

?

"bg-green-100 text-green-700"

:

order.orderStatus==="cancelled"

?

"bg-red-100 text-red-700"

:

"bg-yellow-100 text-yellow-700"

}

`}>

{order.orderStatus}

</div>



</div>





<div className="
mt-6
grid
gap-5
md:grid-cols-2
">



<div className="
rounded-2xl
bg-zinc-50
p-5
">


<h3 className="
font-bold
mb-3
">

Payment Information

</h3>



<p className="
text-sm
text-zinc-600
">

Method:

<span className="
font-semibold
text-zinc-900
">

{" "}
{order.paymentMethod}

</span>

</p>




{
order.transactionId &&

<p className="
mt-2
text-sm
text-zinc-600
">

Transaction:

<span className="
font-semibold
text-zinc-900
">

{" "}
{order.transactionId}

</span>

</p>

}



</div>








<div className="
rounded-2xl
bg-zinc-50
p-5
">


<h3 className="
font-bold
mb-3
">

Order Summary

</h3>



<p className="
text-sm
text-zinc-600
">

Items:

<span className="
font-semibold
text-zinc-900
">

{" "}
{order.items.length}

</span>

</p>




<p className="
mt-2
text-sm
text-zinc-600
">

Total:

<span className="
font-bold
text-zinc-900
">

{" "}
${order.totalPrice.toFixed(2)}

</span>

</p>


</div>



</div>



</div>








<div className="
mt-6
rounded-3xl
border
bg-white
p-6
shadow-sm
">


<h2 className="
mb-6
text-xl
font-bold
">

Products

</h2>





<div className="
space-y-4
">


{
order.items.map((item:any)=>(


<div

key={item._id}

className="
flex
items-center
gap-4
rounded-2xl
bg-zinc-50
p-4
"

>


<div className="
h-20
w-20
overflow-hidden
rounded-xl
bg-white
">


{
item.image &&

<img

src={item.image}

alt={item.name}

className="
h-full
w-full
object-cover
"

/>

}


</div>





<div className="
flex-1
">


<h3 className="
font-semibold
">

{item.name}

</h3>


<p className="
text-sm
text-zinc-500
">

Quantity: {item.quantity}

</p>


</div>





<div className="
font-bold
">

${(
item.price *
item.quantity
).toFixed(2)}

</div>



</div>


))

}


</div>


</div>

<div className="
mt-6
grid
gap-6
lg:grid-cols-2
">





{/* SHIPPING ADDRESS */}

<div className="
rounded-3xl
border
bg-white
p-6
shadow-sm
">


<h2 className="
mb-5
text-xl
font-bold
">

Shipping Address

</h2>




<div className="
space-y-2
text-zinc-600
">


<p>

<span className="font-semibold text-zinc-900">
Name:
</span>

{" "}
{order.shippingAddress?.fullName}

</p>





<p>

<span className="font-semibold text-zinc-900">
Phone:
</span>

{" "}
{order.shippingAddress?.phone}

</p>





<p>

<span className="font-semibold text-zinc-900">
Address:
</span>

{" "}
{order.shippingAddress?.address}

</p>





<p>

<span className="font-semibold text-zinc-900">
City:
</span>

{" "}
{order.shippingAddress?.city}

</p>





<p>

<span className="font-semibold text-zinc-900">
Country:
</span>

{" "}
{order.shippingAddress?.country}

</p>



</div>



</div>









{/* ORDER TIMELINE */}

<div className="
rounded-3xl
border
bg-white
p-6
shadow-sm
">


<h2 className="
mb-5
text-xl
font-bold
">

Order Timeline

</h2>





<div className="
space-y-5
">


<div className="
flex
gap-4
">

<div className="
h-9
w-9
rounded-full
bg-green-100
flex
items-center
justify-center
">

✓

</div>


<div>

<h3 className="font-semibold">

Order Placed

</h3>

<p className="
text-sm
text-zinc-500
">

Your order has been received

</p>


</div>


</div>







<div className="
flex
gap-4
">

<div className="
h-9
w-9
rounded-full
bg-blue-100
flex
items-center
justify-center
">

2

</div>


<div>

<h3 className="font-semibold">

Processing

</h3>


<p className="
text-sm
text-zinc-500
">

Preparing your package

</p>


</div>


</div>







<div className="
flex
gap-4
">

<div className="
h-9
w-9
rounded-full
bg-orange-100
flex
items-center
justify-center
">

3

</div>


<div>

<h3 className="font-semibold">

Delivered

</h3>


<p className="
text-sm
text-zinc-500
">

Waiting for shipment

</p>


</div>


</div>



</div>



</div>



</div>








{/* ACTIONS */}


<div className="
mt-8
flex
flex-col
gap-4
sm:flex-row
">


{
order.orderStatus==="pending" &&

<button

className="
rounded-2xl
bg-red-600
px-6
py-4
font-semibold
text-white
hover:bg-red-700
"

>

Cancel Order

</button>

}





<Link

href="/shop"

className="
rounded-2xl
border
px-6
py-4
text-center
font-semibold
hover:bg-zinc-100
"

>

Continue Shopping

</Link>



</div>





</div>


</main>


);


}