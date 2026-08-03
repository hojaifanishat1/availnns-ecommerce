"use client";


import {

Plus,

Trash2,

} from "lucide-react";





interface Attribute {


name:string;


value:string;


}




interface Props {


attributes:Attribute[];


onChange:(

attributes:Attribute[]

)=>void;


}





export default function DynamicAttributes({

attributes=[],

onChange

}:Props){





const addAttribute=()=>{


onChange([

...attributes,


{

name:"",

value:""

}


]);


};







const removeAttribute=(index:number)=>{


onChange(

attributes.filter(

(_,i)=>

i!==index

)

);


};







const updateAttribute=(

index:number,

key:keyof Attribute,

value:string

)=>{


const updated =

attributes.map(

(item,i)=>

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



onChange(updated);



};







return (

<div

className="
border
rounded-xl
p-5
space-y-5
"

>



<div

className="
flex
items-center
justify-between
"

>


<h3

className="
font-semibold
text-lg
"

>

Product Attributes

</h3>





<button

type="button"

onClick={addAttribute}

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

Add Attribute


</button>



</div>








<div className="space-y-3">


{

attributes.map(

(attribute,index)=>(



<div

key={index}

className="
grid
grid-cols-5
gap-3
items-center
"

>




<input

className="
border
rounded-lg
px-3
py-2
col-span-2
"

placeholder="Attribute Name"

value={attribute.name}

onChange={(e)=>

updateAttribute(

index,

"name",

e.target.value

)

}


/>







<input

className="
border
rounded-lg
px-3
py-2
col-span-2
"

placeholder="Value"

value={attribute.value}

onChange={(e)=>

updateAttribute(

index,

"value",

e.target.value

)

}


/>







<button

type="button"

onClick={()=>removeAttribute(index)}

className="
text-red-500
"

>


<Trash2 size={20}/>


</button>





</div>



)


)



}



</div>





</div>


);


}