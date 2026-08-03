export function validateImage(

file:File

){



const allowedTypes=[

"image/jpeg",

"image/png",

"image/webp"

];





const maxSize =

5 *

1024 *

1024;







if(

!allowedTypes.includes(

file.type

)

){


return {

valid:false,

message:"Only JPG, PNG and WEBP allowed"

};


}








if(

file.size > maxSize

){


return {

valid:false,

message:"Image size must be under 5MB"

};


}







return {


valid:true,


message:"Valid image"


};



}