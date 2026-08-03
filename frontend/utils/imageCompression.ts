export async function compressImage(

file:File,

maxWidth:number=1200,

quality:number=0.8

):Promise<File>{



return new Promise((resolve)=>{



const img = new Image();


const canvas = document.createElement("canvas");


const ctx = canvas.getContext("2d");



const reader = new FileReader();





reader.onload=(event)=>{


img.src = event.target?.result as string;



};






img.onload=()=>{


let width = img.width;


let height = img.height;






if(width > maxWidth){



height =

(height * maxWidth)

/

width;



width=maxWidth;



}






canvas.width=width;

canvas.height=height;







ctx?.drawImage(

img,

0,

0,

width,

height

);







canvas.toBlob(

(blob)=>{



if(!blob)

return resolve(file);






const compressed = new File(

[blob],

file.name,

{

type:"image/jpeg",

lastModified:Date.now()

}

);



resolve(compressed);



},

"image/jpeg",

quality

);




};






reader.readAsDataURL(file);



});


}