"use client";


import {

useState

} from "react";



interface Props {


open:boolean;


image?:string;


onClose:()=>void;


onCrop:(

image:string

)=>void;


}





export default function ImageCropModal({

open,

image,

onClose,

onCrop

}:Props){



const [

zoom,

setZoom

]=useState(1);





if(!open || !image)

return null;





return (

<div

className="
fixed
inset-0
bg-black/50
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
max-w-lg
space-y-5
"

>



<h2

className="
font-bold
text-lg
"

>

Crop Image

</h2>







<div

className="
overflow-hidden
rounded-lg
border
"

>


<img

src={image}

alt="crop"

style={{

transform:`scale(${zoom})`

}}

className="
w-full
h-80
object-contain
transition
"

/>


</div>







<input

type="range"

min="1"

max="3"

step="0.1"

value={zoom}

onChange={(e)=>

setZoom(

Number(e.target.value)

)

}

className="
w-full
"

/>








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

onClick={()=>{

onCrop(image);

onClose();

}}

className="
bg-black
text-white
px-4
py-2
rounded-lg
"

>

Apply Crop

</button>




</div>



</div>



</div>


);


}