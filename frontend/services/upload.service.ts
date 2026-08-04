import api from "@/services/api";


// ===============================
// UPLOAD AVATAR
// ===============================

export const uploadAvatar = async(
  file: File
)=>{


const formData =
new FormData();


formData.append(
"image",
file
);



const res =
await api.post(

"/upload/avatar",

formData,

{

headers:{

"Content-Type":
"multipart/form-data"

}

}

);



return res.data?.url || res.data?.message || "";


};