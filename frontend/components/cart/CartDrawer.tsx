"use client";


import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";


import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";


import useCart from "@/hooks/useCart";
import { useCurrency } from "@/context/CurrencyContext";



type Props = {

  open:boolean;

  onClose:()=>void;

};





export default function CartDrawer({

open,

onClose,

}:Props){



useEffect(() => {
  if (!open) return;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  document.body.style.overflow = "hidden";
  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.body.style.overflow = "";
    document.removeEventListener("keydown", handleKeyDown);
  };
}, [open, onClose]);


const {
 cart,
 totalItems,
 updateItem,
 removeItem

}=useCart();



const {
 formatPrice

}=useCurrency();





if(!open)
return null;





const subtotal =

cart?.items?.reduce(

(
sum:number,
item:any

)=>

sum +

Number(item.price || 0) *

Number(item.quantity || 0)

,0)

||0;








return (

<>


{/* OVERLAY */}

<div

onClick={onClose}

className="
fixed
inset-0
z-[60]
bg-black/40
backdrop-blur-sm
transition-opacity
duration-300
"

/>








{/* DRAWER */}

<div

className="
fixed
right-0
top-0
z-[70]
flex
h-[100dvh]
w-full
max-w-md
flex-col
bg-white
shadow-2xl
transition-transform
duration-300
translate-x-0
overflow-hidden
pb-20
"

>





{/* HEADER */}

<div

className="
flex
items-center
justify-between
border-b
p-5
"

>


<div>

<h2 className="
text-xl
font-black
">

Shopping Cart

</h2>


<p className="
mt-1
text-sm
text-gray-500
">

{totalItems} items

</p>


</div>





<button

onClick={onClose}

className="
rounded-full
p-2
hover:bg-gray-100
"

>

<X size={22}/>

</button>



</div>









{/* ITEMS */}

<div

className="
flex-1
space-y-4
overflow-y-auto
overflow-x-hidden
p-5
min-h-0
"

>


{

!cart?.items ||
cart.items.length===0

?

<div

className="
flex
h-full
flex-col
items-center
justify-center
text-center
"

>


<div

className="
flex
h-24
w-24
items-center
justify-center
rounded-full
bg-gray-100
"

>

<ShoppingBag
size={40}
className="text-gray-400"
/>

</div>



<h3

className="
mt-5
text-xl
font-bold
"

>

Your cart is empty

</h3>





<Link

href="/shop"

onClick={onClose}

className="
mt-5
rounded-xl
bg-black
px-6
py-3
text-white
"

>

Shop Now

</Link>



</div>



:

cart.items.map(

(item:any)=>{


const product =

item.product || item;



const productId =

(typeof product === "string"
  ? product
  : product?._id || product?.id || item?.productId || item?.product?.toString?.()) ||

null;





return (

<div

key={productId}

className="
flex
gap-4
rounded-xl
border
p-4
"

>





{/* IMAGE */}

<div

className="
relative
h-20
w-20
shrink-0
overflow-hidden
rounded-lg
bg-gray-100
"

>


<Image

src={

product?.images?.[0]?.url ||

item.image ||

"/placeholder.png"

}

alt={

product?.name ||

"Product"

}

fill

className="
object-cover
"

/>



</div>









{/* INFO */}

<div

className="
flex-1
"

>


<h3

className="
line-clamp-2
text-sm
font-semibold
"

>

{

product?.name ||

"Product"

}

</h3>





<p

className="
mt-1
font-bold
"

>

{

formatPrice(

item.price ||

product.price ||

0

)

}

</p>








<div

className="
mt-3
flex
items-center
justify-between
"

>


<div

className="
flex
items-center
overflow-hidden
rounded-full
border
"

>


<button

onClick={() => {
  if (!productId) return;

  if (item.quantity <= 1) {
    removeItem(productId);
    return;
  }

  updateItem(productId, item.quantity - 1);
}}

className="
flex
h-8
w-8
items-center
justify-center
"

>

<Minus size={14}/>

</button>





<span

className="
px-3
text-sm
font-bold
"

>

{item.quantity}

</span>





<button

onClick={()=>


updateItem(

productId,

item.quantity+1

)


}

className="
flex
h-8
w-8
items-center
justify-center
"

>

<Plus size={14}/>

</button>



</div>







<button

onClick={()=>removeItem(productId)}

className="
text-red-500
"

>

<Trash2 size={18}/>

</button>



</div>





</div>





</div>


);



}

)


}



</div>









{/* FOOTER */}

<div

className="
border-t
bg-white
p-5
shrink-0
"

>


<div

className="
mb-5
rounded-xl
bg-gray-50
p-4
"

>


<p

className="
text-sm
text-gray-500
"

>

Free Shipping on orders over 100

</p>




<div

className="
mt-3
h-2
overflow-hidden
rounded-full
bg-gray-200
"

>


<div

className="
h-full
bg-black
transition-all
"

style={{

width:

`${Math.min(

(subtotal/100)*100,

100

)}%`

}}

/>


</div>



</div>








<div

className="
mb-5
flex
justify-between
"

>


<span className="font-medium">

Subtotal

</span>



<span

className="
text-xl
font-black
"

>

{formatPrice(subtotal)}

</span>



</div>








<Link

href="/cart"

onClick={onClose}

className="
flex
w-full
items-center
justify-center
gap-2
rounded-xl
bg-black
py-4
font-bold
text-white
hover:bg-gray-800
"

>

View Cart

<ArrowRight size={18}/>

</Link>




</div>





</div>



</>

);



}