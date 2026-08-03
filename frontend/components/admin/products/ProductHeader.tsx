"use client";


import {
  Save,
  ArrowLeft,
} from "lucide-react";


import {
  useRouter,
} from "next/navigation";



interface Props {

  title?: string;

  onSave?:()=>void;

  saving?:boolean;

}




export default function ProductHeader({

  title="Add New Product",

  onSave,

  saving=false

}:Props){


const router =
useRouter();



return (

<div

className="
flex
items-center
justify-between
border-b
pb-5
mb-6
"

>


<div

className="
flex
items-center
gap-4
"

>


<button

onClick={()=>router.back()}

className="
p-2
rounded-lg
border
hover:bg-gray-100
"

>

<ArrowLeft size={20}/>

</button>




<div>


<h1

className="
text-2xl
font-bold
"

>

{title}

</h1>



<p

className="
text-sm
text-gray-500
"

>

Create and manage your product

</p>


</div>



</div>





<button

onClick={onSave}

disabled={saving}

className="
flex
items-center
gap-2
bg-black
text-white
px-5
py-2
rounded-lg
disabled:opacity-50
"

>


<Save size={18}/>



{

saving

?

"Saving..."

:

"Save Product"

}


</button>



</div>

);


}