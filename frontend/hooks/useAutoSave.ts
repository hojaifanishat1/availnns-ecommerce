"use client";


import {

useEffect,

useRef,

useState

} from "react";





interface Props {


data:any;


save:(

data:any

)=>void;


delay?:number;


}





export default function useAutoSave({

data,

save,

delay=3000

}:Props){



const [

saving,

setSaving

]=useState(false);




const timer =

useRef<NodeJS.Timeout | null>(null);







useEffect(()=>{



if(timer.current)

clearTimeout(

timer.current

);






timer.current =

setTimeout(()=>{



setSaving(true);




save(data);





setTimeout(()=>{


setSaving(false);


},500);



},delay);






return ()=>{


if(timer.current)

clearTimeout(

timer.current

);


};


},[

data,

save,

delay

]);







return {


saving



};


}