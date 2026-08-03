"use client";


interface Props {


open:boolean;


onConfirm:()=>void;


onCancel:()=>void;


}





export default function DiscardChangesDialog({

open,

onConfirm,

onCancel

}:Props){



if(!open)

return null;



return (

<div

className="
fixed
inset-0
bg-black/40
flex
items-center
justify-center
z-50
"

>



<div

className="
bg-white
rounded-xl
p-6
w-full
max-w-md
space-y-5
"

>



<h2

className="
text-lg
font-bold
"

>

Discard Changes?

</h2>




<p

className="
text-gray-600
"

>

All unsaved product changes will be lost.

</p>





<div

className="
flex
justify-end
gap-3
"

>


<button

onClick={onCancel}

className="
border
px-4
py-2
rounded-lg
"

>

Cancel

</button>




<button

onClick={onConfirm}

className="
bg-red-600
text-white
px-4
py-2
rounded-lg
"

>

Discard

</button>



</div>




</div>


</div>

);


}