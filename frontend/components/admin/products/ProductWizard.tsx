"use client";


import {
  ProductFormProvider
} from "@/context/ProductFormContext";


import {
  ProductWizardProvider,
  useProductWizard
} from "@/context/ProductWizardContext";


import {
  DEFAULT_PRODUCT_FORM
} from "@/constants/product";



import ProductProgress from "./ProductProgress";

import StepNavigation from "./StepNavigation";

import LivePreview from "./LivePreview";



import BasicInfoStep from "./steps/BasicInfoStep";
import MediaStep from "./steps/MediaStep";
import PricingStep from "./steps/PricingStep";
import VariantStep from "./steps/VariantStep";
import InventoryStep from "./steps/InventoryStep";
import ShippingStep from "./steps/ShippingStep";
import AttributeStep from "./steps/AttributeStep";
import SpecificationStep from "./steps/SpecificationStep";
import SeoStep from "./steps/SeoStep";
import ReviewStep from "./steps/ReviewStep";







function WizardContent(){


const {

currentStep

}=useProductWizard();







const steps=[


<BasicInfoStep key="basic"/>,


<MediaStep key="media"/>,


<PricingStep key="pricing"/>,


<VariantStep key="variant"/>,


<InventoryStep key="inventory"/>,


<ShippingStep key="shipping"/>,


<AttributeStep key="attribute"/>,


<SpecificationStep key="specification"/>,


<SeoStep key="seo"/>,


<ReviewStep key="review"/>,


];







return (



<div

className="
grid
grid-cols-1
lg:grid-cols-12
gap-6
w-full
"

>





<div

className="
lg:col-span-3
"

>

<ProductProgress/>

</div>







<div

className="
lg:col-span-6
"

>





<div>


{

steps[currentStep - 1]

}


</div>





<StepNavigation/>




</div>







<div

className="
lg:col-span-3
"

>

<LivePreview/>

</div>







</div>



);



}









export default function ProductWizard({


initialData=DEFAULT_PRODUCT_FORM


}:{

initialData?:typeof DEFAULT_PRODUCT_FORM


}){







return (


<ProductFormProvider

initialData={initialData}

>


<ProductWizardProvider>


<WizardContent/>


</ProductWizardProvider>


</ProductFormProvider>



);



}