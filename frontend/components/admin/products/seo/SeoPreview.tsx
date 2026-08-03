"use client";


interface Props {


title?:string;


description?:string;


slug?:string;


}





export default function SeoPreview({

title,

description,

slug

}:Props){



return (

<div

className="
border
rounded-xl
p-5
space-y-3
bg-white
"

>



<h3

className="
font-semibold
text-lg
"

>

Search Preview

</h3>






<div

className="
space-y-1
"

>


<p

className="
text-blue-600
text-xl
font-medium
"

>


{

title ||

"Product Title"

}


</p>





<p

className="
text-green-700
text-sm
"

>


availnns.com/product/


{

slug ||

"product-slug"

}


</p>







<p

className="
text-gray-600
text-sm
"

>


{

description ||

"Product description will appear here"

}


</p>




</div>





</div>

);


}