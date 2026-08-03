"use client";


interface Props {


open:boolean;


onDelete:()=>void;


onClose:()=>void;


}





export default function DeleteImageDialog({

open,

onDelete,

onClose

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
"

>


<h2

className="
font-bold
text-lg
"

>

Delete Image?

</h2>



<p

className="
text-gray-500
my-4
"

>

This image will be removed permanently.

</p>





<div

className="
flex
justify-end
gap-3
"

>



<button

onClick={onClose}

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

onClick={onDelete}

className="
bg-red-600
text-white
px-4
py-2
rounded-lg
"

>

Delete

</button>



</div>



</div>



</div>


);


}