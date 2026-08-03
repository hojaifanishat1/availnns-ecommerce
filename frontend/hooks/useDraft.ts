"use client";


import {

useCallback,

useEffect,

useState

} from "react";





const DRAFT_KEY = "availnns_product_draft";





export default function useDraft<T>(

initialData:T

){



const [

draft,

setDraft

]=useState<T>(

initialData

);






useEffect(()=>{


const saved =

localStorage.getItem(

DRAFT_KEY

);



if(saved){


try{


setDraft(

JSON.parse(saved)

);


}

catch(error){


console.log(

"Draft load failed",

error

);


}


}


},[]);







const saveDraft=(

data:T

)=>{


setDraft(data);



localStorage.setItem(

DRAFT_KEY,

JSON.stringify(data)

);



};







const clearDraft=()=>{


localStorage.removeItem(

DRAFT_KEY

);



setDraft(initialData);


};







const hasDraft=()=>{


return (

localStorage.getItem(

DRAFT_KEY

)!==null

);


};







return {


draft,


saveDraft,


clearDraft,


hasDraft



};


}