"use client";

import { useEffect, useState } from "react";
import ProductCard from "../product/ProductCard";
import { getDealProducts } from "@/services/product.service";

import { Product } from "@/types/product";


export default function DealProducts(){

  const [products,setProducts] = useState<Product[]>([]);


  useEffect(()=>{

    const loadProducts = async()=>{

      try{

        const data = await getDealProducts();

        setProducts(data);

      }catch(error){

        console.log(error);

      }

    };


    loadProducts();

  },[]);



  if(!products.length) return null;



  return (

    <section className="py-10">

      <div className="container mx-auto">

        <h2 className="text-2xl font-bold mb-6">
          🔥 Deals
        </h2>


        <div className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-5
        ">

        {
          products.map((product)=>(

            <ProductCard
              key={product._id}
              product={product}
            />

          ))
        }

        </div>

      </div>

    </section>

  );

}