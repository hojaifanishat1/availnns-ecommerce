"use client";


interface Props {


open:boolean;


image?:string;


onClose:()=>void;


}





export default function ImagePreviewModal({

open,

image,

onClose

}:Props){



if(!open || !image)

return null;



return (

<div

className="
fixed
inset-0
bg-black/70
flex
items-center
justify-center
z-50
"

onClick={onClose}

>



<div

className="
bg-white
p-4
rounded-xl
max-w-4xl
"

onClick={(e)=>

e.stopPropagation()

}

>



<img

src={image}

alt="preview"

className="
max-h-[80vh]
rounded-lg
object-contain
"

/>



<button

onClick={onClose}

className="
mt-4
w-full
bg-black
text-white
py-2
rounded-lg
"

>

Close

</button>




</div>



</div>


);


}