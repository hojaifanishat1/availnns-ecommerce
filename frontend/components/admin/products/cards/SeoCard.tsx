"use client";



import {

Search

} from "lucide-react";




interface Props {


seo:any;


}




export default function SeoCard({

seo

}:Props){



return (

<div

className="
border
rounded-xl
p-5
space-y-4
bg-white
"

>



<div

className="
flex
items-center
gap-2
"

>


<Search size={18}/>


<h3 className="font-semibold">

SEO

</h3>



</div>







<div>


<p className="text-sm text-gray-500">

Meta Title

</p>


<p className="font-medium">

{

seo?.metaTitle ||

"Not added"

}

</p>


</div>







<div>


<p className="text-sm text-gray-500">

Slug

</p>


<p className="font-medium">

{

seo?.slug ||

"-"

}

</p>


</div>





</div>


);


}