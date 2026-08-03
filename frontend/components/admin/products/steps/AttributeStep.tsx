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






export default function AttributeStep(){


const {

form,

updateField

}=useProductFormContext();





const attributes =
form.attributes || [];







const addAttribute=()=>{


updateField(

"attributes",

[

...attributes,


{

name:"",

value:""

}


]

);



};








const removeAttribute=(

index:number

)=>{


updateField(

"attributes",

attributes.filter(

(_:any,i:number)=>

i!==index

)

);



};







const updateAttribute=(

index:number,

key:string,

value:string

)=>{


const updated =

attributes.map(

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

"attributes",

updated

);



};







return (

<div

className="
space-y-6
"

>




<SectionCard


title="Product Attributes"


description="Add custom product properties"

>




<button


type="button"


onClick={addAttribute}


className="
flex

items-center

gap-2

bg-black

text-white

px-4

py-2

rounded-lg

"

>


<Plus size={18}/>


Add Attribute


</button>







<div

className="
space-y-4

mt-5

"

>



{

attributes.map(

(attribute:any,index:number)=>(


<div

key={index}

className="
grid

grid-cols-5

gap-3

items-end

border

p-4

rounded-xl

"

>




<div

className="
col-span-2

"

>


<FormInput


label="Attribute Name"


value={attribute.name}


onChange={(value)=>

updateAttribute(

index,

"name",

value

)

}


/>


</div>








<div

className="
col-span-2

"

>


<FormInput


label="Value"


value={attribute.value}


onChange={(value)=>

updateAttribute(

index,

"value",

value

)

}


/>


</div>








<button


type="button"


onClick={()=>removeAttribute(index)}


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