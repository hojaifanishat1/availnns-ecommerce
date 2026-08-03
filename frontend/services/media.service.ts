import api from "./api";



export interface UploadResponse {

url:string;

public_id?:string;

}





export async function uploadProductImage(

file:File

):Promise<UploadResponse>{



const formData = new FormData();


formData.append(
"image",
file
);




const response = await api.post(

"/upload",

formData,

{

headers:{

"Content-Type":"multipart/form-data",

},

}

);





return response.data;



}








export async function updateMedia(

id:string,

data:any

){


const response = await api.put(

`/media/${id}`,

data

);


return response.data;


}







export async function deleteMedia(

id:string

){


const response = await api.delete(

`/media/${id}`

);


return response.data;


}