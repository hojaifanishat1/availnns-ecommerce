"use client";


import {
useState
} from "react";


import {
Plus
} from "lucide-react";



interface Props {


onGenerate:(

variants:any[]

)=>void;


}





export default function VariantGenerator({

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







const generate=()=>{


const sizeList =

sizes

.split(",")

.map(

x=>x.trim()

)

.filter(Boolean);




const colorList =

colors

.split(",")

.map(

x=>x.trim()

)

.filter(Boolean);






const result:any[]=[];





if(

sizeList.length && colorList.length

){


sizeList.forEach(size=>{


colorList.forEach(color=>{


result.push({

sku:

`${size}-${color}`

.toUpperCase(),


size,


color,


stock:0,


price:0,


active:true


});


});


});


}





else {


sizeList.forEach(size=>{


result.push({

sku:size.toUpperCase(),

size,

stock:0,

price:0,

active:true


});


});


}




onGenerate(result);


};







return (

<div

className="
border
rounded-xl
p-5
space-y-4
"

>


<h3 className="font-semibold">

Variant Generator

</h3>




<input

className="
border
rounded
px-3
py-2
w-full
"

placeholder="Sizes (S,M,L,XL)"

value={sizes}

onChange={(e)=>

setSizes(e.target.value)

}

/>





<input

className="
border
rounded
px-3
py-2
w-full
"

placeholder="Colors (Red,Blue)"

value={colors}

onChange={(e)=>

setColors(e.target.value)

}

/>





<button

onClick={generate}

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

Generate


</button>



</div>

);


}