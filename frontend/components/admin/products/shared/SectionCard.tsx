import {
  ReactNode,
} from "react";


interface Props {

  title:string;

  description?:string;

  children:ReactNode;

}



export default function SectionCard({

  title,

  description,

  children

}:Props){


return (

<div
className="
bg-white
rounded-xl
border
p-6
space-y-4
"
>


<div>

<h2
className="
text-lg
font-semibold
"
>

{title}

</h2>


{description && (

<p
className="
text-sm
text-gray-500
"
>

{description}

</p>

)}


</div>



<div>

{children}

</div>



</div>

);


}