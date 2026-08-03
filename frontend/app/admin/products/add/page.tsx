"use client";


import ProductWizard from "@/components/admin/products/ProductWizard";



export default function AddProductPage(){


return (

<div className="p-6">


<div className="mb-6">


<h1 className="text-3xl font-bold">

Add New Product

</h1>



<p className="text-sm text-muted-foreground">

Create a new product with details, images, variants and SEO.

</p>



</div>





<ProductWizard />





</div>

);



}