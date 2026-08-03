export default function generateSKU(

name:string

){



const prefix =

name

.toUpperCase()

.replace(

/[^A-Z0-9]/g,

""

)

.substring(

0,

4

);





const random =

Math.random()

.toString(

36

)

.substring(

2,

8

)

.toUpperCase();






return `${prefix}-${random}`;

}