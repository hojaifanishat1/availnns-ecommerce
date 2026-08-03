"use client";



import {
  Package,
  Image,
  DollarSign,
  Boxes,
  Tag,
  Search,
} from "lucide-react";




interface Props {


product:any;


}





export default function ProductSummary({

product

}:Props){



const {

name,

description,

images=[],

pricing={},

stock,

variants=[],

attributes=[],

seo={}

}=product;







const items=[


{

label:"Images",

value:images.length,

icon:Image

},


{

label:"Variants",

value:variants.length,

icon:Boxes

},


{

label:"Stock",

value:stock || 0,

icon:Package

},


{

label:"Attributes",

value:attributes.length,

icon:Tag

},


{

label:"SEO",

value:

seo.metaTitle

?

"Ready"

:

"Missing",

icon:Search

}



];







return (

<div

className="
border
rounded-xl
p-6
space-y-6
bg-white
"

>



<div>


<h2

className="
text-xl
font-bold
"

>


{

name ||

"Product Name"

}


</h2>



<p

className="
text-gray-500
mt-2
"

>


{

description ||

"No description"

}


</p>



</div>








<div

className="
grid
grid-cols-2
md:grid-cols-5
gap-4
"

>


{

items.map(

(item,index)=>{


const Icon =
item.icon;



return (

<div

key={index}

className="
border
rounded-lg
p-4
text-center
"

>



<Icon

className="
mx-auto
mb-2
"

/>



<p

className="
text-sm
text-gray-500
"

>

{item.label}

</p>




<p

className="
font-bold
"

>

{item.value}

</p>




</div>


)


}

)

}



</div>









<div

className="
grid
grid-cols-2
gap-4
"

>


<div

className="
border
rounded-lg
p-4
"

>


<p className="text-sm text-gray-500">

Regular Price

</p>


<h3 className="font-bold">

{

pricing.price || 0

}

{

pricing.currency || ""

}

</h3>


</div>





<div

className="
border
rounded-lg
p-4
"

>


<p className="text-sm text-gray-500">

Discount Price

</p>


<h3 className="font-bold">

{

pricing.discountPrice || "-"

}

</h3>


</div>



</div>






</div>


);


}