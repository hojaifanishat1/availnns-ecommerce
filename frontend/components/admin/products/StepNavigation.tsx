"use client";


import {
  ChevronLeft,
  ChevronRight
} from "lucide-react";


import {
  useProductWizard
} from "@/context/ProductWizardContext";





export default function StepNavigation(){


const {

currentStep,

nextStep,

previousStep

}=useProductWizard();





return (

<div className="flex justify-between mt-6">


<button

onClick={previousStep}

disabled={currentStep===1}

className="px-4 py-2 border rounded"

>

<ChevronLeft className="inline mr-1"/>

Previous

</button>





<button

onClick={nextStep}

className="px-4 py-2 bg-black text-white rounded"

>

Next

<ChevronRight className="inline ml-1"/>

</button>



</div>

);


}