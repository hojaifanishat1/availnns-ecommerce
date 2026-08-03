interface VariantOptions {


sizes:string[];


colors:string[];


}





export default function variantGenerator({

sizes,

colors

}:VariantOptions){



const variants:any[]=[];






if(

sizes.length===0

&&

colors.length===0

)

return variants;








if(colors.length===0){



sizes.forEach(size=>{


variants.push({

sku:size.toUpperCase(),

size,

stock:0,

price:0,

active:true

});


});



return variants;

}








sizes.forEach(size=>{



colors.forEach(color=>{



variants.push({

sku:

`${size}-${color}`

.toUpperCase(),


size,


color,


stock:0,


price:0,


active:true


});



});


});







return variants;


}