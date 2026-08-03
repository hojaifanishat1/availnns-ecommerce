import {

createSlice,

PayloadAction

} from "@reduxjs/toolkit";





interface WizardState {


currentStep:number;


completedSteps:number[];


totalSteps:number;


}







const initialState:WizardState={


currentStep:1,


completedSteps:[],


totalSteps:10


};








const productWizardSlice = createSlice({



name:"productWizard",



initialState,



reducers:{







nextStep:(state)=>{



if(

!state.completedSteps.includes(

state.currentStep

)

){


state.completedSteps.push(

state.currentStep

);


}






if(

state.currentStep < state.totalSteps

){


state.currentStep +=1;


}



},







previousStep:(state)=>{



state.currentStep =

Math.max(

1,

state.currentStep-1

);



},







goToStep:(

state,

action:PayloadAction<number>

)=>{



if(

action.payload >=1 &&

action.payload <= state.totalSteps

){



state.currentStep =

action.payload;



}



},







completeStep:(

state,

action:PayloadAction<number>

)=>{



if(

!state.completedSteps.includes(

action.payload

)

){



state.completedSteps.push(

action.payload

);



}



},







resetWizard:(state)=>{



state.currentStep = 1;


state.completedSteps = [];


}



}



});









export const {

nextStep,

previousStep,

goToStep,

completeStep,

resetWizard

}=productWizardSlice.actions;







export default productWizardSlice.reducer;