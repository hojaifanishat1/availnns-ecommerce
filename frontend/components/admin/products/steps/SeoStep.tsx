"use client";


import SectionCard
from "../shared/SectionCard";


import FormInput
from "../shared/FormInput";


import FormTextarea
from "../shared/FormTextarea";


import {
useProductFormContext
} from "@/context/ProductFormContext";





export default function SeoStep(){


const {

form,

updateField

}=useProductFormContext();




const seo =
form.seo;





const updateSeo=(

key:string,

value:any

)=>{


updateField(

"seo",

{

...seo,

[key]:

value

}

);



};






return (

<div className="space-y-6">


<SectionCard

title="SEO Settings"

description="Optimize product for search engines"

>



<FormInput

label="Meta Title"

value={seo.metaTitle || ""}

onChange={(value)=>

updateSeo(

"metaTitle",

value

)

}

/>





<FormTextarea

label="Meta Description"

value={seo.metaDescription || ""}

onChange={(value)=>

updateSeo(

"metaDescription",

value

)

}

/>





<FormInput

label="Slug"

value={seo.slug || ""}

onChange={(value)=>

updateSeo(

"slug",

value

)

}

/>





<FormInput

label="Keywords"

value={
seo.keywords?.join(", ") || ""
}

onChange={(value)=>

updateSeo(

"keywords",

value.split(",")

)

}

/>




</SectionCard>


</div>

);


}