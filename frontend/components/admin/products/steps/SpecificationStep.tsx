"use client";


import {
  Plus,
  Trash2,
} from "lucide-react";


import SectionCard
from "../shared/SectionCard";


import FormInput
from "../shared/FormInput";


import {
  useProductFormContext,
} from "@/context/ProductFormContext";




export default function SpecificationStep(){


const {

form,

updateField

}=useProductFormContext();



const specifications =
form.specifications || [];




const addSpecification=()=>{


updateField(

"specifications",

[

...specifications,

{

key:"",

value:""

}

]

);


};





const removeSpecification=(index:number)=>{


updateField(

"specifications",

specifications.filter(

(_:any,i:number)=>i!==index

)

);



};





const updateSpecification=(

index:number,

key:string,

value:string

)=>{


const updated =

specifications.map(

(item:any,i:number)=>


i===index

?

{

...item,

[key]:

value

}

:

item



);



updateField(

"specifications",

updated

);



};







return (

<div className="space-y-6">


<SectionCard

title="Specifications"

description="Add technical product specifications"

>


<button

type="button"

onClick={addSpecification}

className="
bg-black
text-white
px-4
py-2
rounded-lg
flex
items-center
gap-2
"

>

<Plus size={18}/>

Add Specification

</button>




<div className="space-y-4 mt-5">


{

specifications.map(

(spec:any,index:number)=>(


<div

key={index}

className="
grid
grid-cols-5
gap-3
items-end
border
rounded-xl
p-4
"

>


<div className="col-span-2">

<FormInput

label="Key"

value={spec.key}

onChange={(value)=>

updateSpecification(

index,

"key",

value

)

}

/>

</div>




<div className="col-span-2">

<FormInput

label="Value"

value={spec.value}

onChange={(value)=>

updateSpecification(

index,

"value",

value

)

}

/>

</div>





<button

type="button"

onClick={()=>removeSpecification(index)}

className="
text-red-500
mb-2
"

>

<Trash2 size={20}/>

</button>



</div>


))

}


</div>


</SectionCard>


</div>

);


}