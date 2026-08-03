"use client";


import {

createContext,

useContext,

useState,

ReactNode,

useMemo

} from "react";





interface WizardContextType {


currentStep:number;


completedSteps:number[];


nextStep:()=>void;


previousStep:()=>void;


goToStep:(

step:number

)=>void;


completeStep:(

step:number

)=>void;


resetWizard:()=>void;


}





const ProductWizardContext =

createContext<WizardContextType | null>(null);









export function ProductWizardProvider({

children,

totalSteps=10,

initialStep=1

}:{

children:ReactNode;


totalSteps?:number;


initialStep?:number;


}){





const [

currentStep,

setCurrentStep

]=useState(

initialStep

);





const [

completedSteps,

setCompletedSteps

]=useState<number[]>([]);









const nextStep=()=>{


setCurrentStep(

prev=>

Math.min(

prev+1,

totalSteps

)

);


};








const previousStep=()=>{


setCurrentStep(

prev=>

Math.max(

1,

prev-1

)

);


};









const goToStep=(

step:number

)=>{


if(

step>=1 &&

step<=totalSteps

){


setCurrentStep(step);


}


};









const completeStep=(

step:number

)=>{



setCompletedSteps(

prev=>

prev.includes(step)

?

prev

:

[

...prev,

step

]

);


};









const resetWizard=()=>{


setCurrentStep(initialStep);


setCompletedSteps([]);


};









const value = useMemo(()=>({


currentStep,


completedSteps,


nextStep,


previousStep,


goToStep,


completeStep,


resetWizard



}),[

currentStep,

completedSteps

]);









return (

<ProductWizardContext.Provider

value={value}

>


{children}


</ProductWizardContext.Provider>


);


}









export function useProductWizard(){



const context = useContext(

ProductWizardContext

);





if(!context){


throw new Error(

"useProductWizard must be used inside ProductWizardProvider"

);


}





return context;


}