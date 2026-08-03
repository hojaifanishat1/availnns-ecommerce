"use client";


import {

Package,

Image,

DollarSign,

Layers,

Truck,

Search,

Settings,

} from "lucide-react";



interface MenuItem {

label:string;

icon:any;

}




const menu:MenuItem[]=[


{
label:"Basic Information",
icon:Package
},


{
label:"Media",
icon:Image
},


{
label:"Pricing",
icon:DollarSign
},


{
label:"Variants",
icon:Layers
},


{
label:"Shipping",
icon:Truck
},


{
label:"SEO",
icon:Search
},


{
label:"Settings",
icon:Settings
}



];





interface Props {


active?:number;


onChange?:(

index:number

)=>void;


}





export default function ProductSidebar({

active=0,

onChange

}:Props){



return (

<div

className="
bg-white
border
rounded-xl
p-4
space-y-2
"

>


{

menu.map((item,index)=>{


const Icon =
item.icon;



return (

<button


key={item.label}


onClick={()=>

onChange?.(index)

}


className={`

w-full

flex

items-center

gap-3

px-4

py-3

rounded-lg

text-left

${

active===index

?

"bg-black text-white"

:

"hover:bg-gray-100"

}

`}


>


<Icon size={18}/>


<span>

{item.label}

</span>



</button>


)


})

}



</div>

);


}