"use client";


import {
  Trash2,
  Star,
} from "lucide-react";




interface Props {


images:any[];

onDelete:(index:number)=>void;


onPrimary:(index:number)=>void;


}





export default function MediaGallery({

images,

onDelete,

onPrimary

}:Props){



return (

<div

className="
grid
grid-cols-4
gap-4
"

>



{

images.map(

(image,index)=>(


<div

key={index}

className="
relative
border
rounded-xl
overflow-hidden
"

>


<img

src={image.url}

alt="product"

className="
w-full
h-36
object-cover
"

/>





<button

onClick={()=>onDelete(index)}

className="
absolute
top-2
right-2
bg-white
rounded-full
p-1
text-red-500
"

>

<Trash2 size={16}/>

</button>







<button

onClick={()=>onPrimary(index)}

className={`

absolute

bottom-2

left-2

text-xs

px-2

py-1

rounded

flex

items-center

gap-1

${

image.isPrimary

?

"bg-black text-white"

:

"bg-white"

}

`}


>


<Star size={12}/>


{

image.isPrimary

?

"Primary"

:

"Make Primary"

}


</button>




</div>


)

)


}



</div>

);


}