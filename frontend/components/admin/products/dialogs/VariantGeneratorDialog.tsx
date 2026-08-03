"use client";


import {
useState
} from "react";



interface Props {


open:boolean;


onClose:()=>void;


onGenerate:(

data:any[]

)=>void;


}





export default function VariantGeneratorDialog({

open,

onClose,

onGenerate

}:Props){



const [

sizes,

setSizes

]=useState("");



const [

colors,

setColors

]=useState("");





if(!open)

return null;






const generate=()=>{


const sizeList =

sizes.split(",")

.map(x=>x.trim())

.filter(Boolean);




const colorList =

colors.split(",")

.map(x=>x.trim())

.filter(Boolean);



const result:any[]=[];



sizeList.forEach(size=>{


if(colorList.length){


colorList.forEach(color=>{


result.push({

size,

color,

sku:

`${size}-${color}`,

stock:0,

price:0

});


});


}

else {


result.push({

size,

sku:size,

stock:0,

price:0

});


}


});





onGenerate(result);

onClose();


};







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
space-y-4
"

>


<h2

className="
font-bold
text-lg
"

>

Generate Variants

</h2>




<input

className="
border
rounded-lg
w-full
px-3
py-2
"

placeholder="Sizes S,M,L"

value={sizes}

onChange={(e)=>

setSizes(e.target.value)

}

/>




<input

className="
border
rounded-lg
w-full
px-3
py-2
"

placeholder="Colors Red,Blue"

value={colors}

onChange={(e)=>

setColors(e.target.value)

}

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

onClick={generate}

className="
bg-black
text-white
px-4
py-2
rounded-lg
"

>

Generate

</button>



</div>




</div>


</div>

);


}