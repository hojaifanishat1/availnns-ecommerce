"use client";


import {
  useProductWizard
} from "@/context/ProductWizardContext";



const steps = [

"Basic",

"Media",

"Pricing",

"Variants",

"Inventory",

"Shipping",

"Attributes",

"Specification",

"SEO",

"Review"

];



export default function ProductProgress(){


const {

currentStep,

completedSteps

}=useProductWizard();




return (

<div className="space-y-3">


{

steps.map((step,index)=>(


<div

key={step}

className={`

flex

items-center

gap-3

p-2

rounded-lg

${

currentStep===index

?

"bg-black text-white"

:

"bg-gray-100"

}

`}

>


<div

className="

w-7

h-7

rounded-full

flex

items-center

justify-center

border

"

>

{

completedSteps.includes(index)

?

"✓"

:

index+1

}

</div>



<span>

{step}

</span>



</div>


))

}


</div>

);


}