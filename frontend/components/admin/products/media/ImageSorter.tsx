"use client";


import {

useState

} from "react";


import {

GripVertical,

Trash2

} from "lucide-react";


import {

ProductMedia

} from "@/types/media";







interface Props {


images:ProductMedia[];


onChange:(images:ProductMedia[])=>void;


}







export default function ImageSorter({

images,

onChange

}:Props){





const [

dragIndex,

setDragIndex

]=useState<number | null>(null);









const handleDragStart=(

index:number

)=>{


setDragIndex(index);


};









const handleDrop=(

index:number

)=>{



if(

dragIndex === null

) return;





const updated=[...images];



const moved=updated.splice(

dragIndex,

1

)[0];



updated.splice(

index,

0,

moved

);



onChange(updated);



setDragIndex(null);



};









const removeImage=(

index:number

)=>{


const updated=images.filter(

(_,i)=>i!==index

);



onChange(updated);



};









return (



<div className="space-y-4">





<h3 className="font-semibold">

Image Order

</h3>








<div className="grid grid-cols-2 md:grid-cols-4 gap-4">





{

images.map(

(image,index)=>(


<div


key={index}


draggable


onDragStart={()=>handleDragStart(index)}


onDragOver={(e)=>e.preventDefault()}


onDrop={()=>handleDrop(index)}


className="
border
rounded-lg
p-2
cursor-move
space-y-2
"


>






<div className="flex justify-between items-center">


<GripVertical

size={18}

/>





<button


type="button"


onClick={()=>removeImage(index)}


className="text-red-500"


>


<Trash2

size={18}

/>


</button>



</div>







<img


src={

typeof image === "string"

?

image

:

image.url

}


alt="product"


className="
w-full
h-32
object-cover
rounded
"


/>







</div>


)


)

}






</div>






</div>


);



}