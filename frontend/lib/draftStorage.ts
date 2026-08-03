const KEY =

"availnns_product_draft";





export function saveDraft(

data:any

){



if(typeof window==="undefined")

return;



localStorage.setItem(

KEY,

JSON.stringify(data)

);


}







export function getDraft(){



if(typeof window==="undefined")

return null;



const data =

localStorage.getItem(KEY);



return data

?

JSON.parse(data)

:

null;



}







export function removeDraft(){



if(typeof window==="undefined")

return;



localStorage.removeItem(KEY);


}