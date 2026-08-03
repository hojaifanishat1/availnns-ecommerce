"use client";


import {

useEffect,

useState

} from "react";


import {

useParams,

useRouter

} from "next/navigation";


import ProductWizard from "@/components/admin/products/ProductWizard";


import {

ProductFormProvider

} from "@/context/ProductFormContext";


import {

ProductWizardProvider

} from "@/context/ProductWizardContext";


import {

DEFAULT_PRODUCT_FORM

} from "@/constants/product";


import {

ProductForm

} from "@/types/productForm";







export default function EditProductPage(){



const params = useParams();


const router = useRouter();


const id = params.id as string;






const [

product,

setProduct

]=useState<ProductForm | null>(null);




const [

loading,

setLoading

]=useState(true);









useEffect(()=>{



const fetchProduct=async()=>{


try{



const res = await fetch(

`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`

);



const data = await res.json();






setProduct({


...DEFAULT_PRODUCT_FORM,


...data.product,


});





}

catch(error){


console.log(error);


}

finally{


setLoading(false);


}



};



if(id){

fetchProduct();

}



},[id]);









if(loading){


return (

<div className="p-6">

Loading product...

</div>

);


}







if(!product){


return (

<div className="p-6">


Product not found

</div>

);


}









return (



<div className="p-6">





<div className="mb-6">


<h1 className="text-3xl font-bold">

Edit Product

</h1>



<p className="text-sm text-muted-foreground">

Update product information.

</p>


</div>







<ProductFormProvider

initialData={product}

>


<ProductWizardProvider>


<ProductWizard />


</ProductWizardProvider>


</ProductFormProvider>







</div>


);



}