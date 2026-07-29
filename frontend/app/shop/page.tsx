"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  SlidersHorizontal,
  Filter,
} from "lucide-react";

import {
  useAppDispatch,
  useAppSelector,
} from "@/hooks/redux";

import {
  fetchProducts,
} from "@/store/slices/productSlice";

import {
  getCategoryTree,
} from "@/services/category.service";

import ProductCard from "@/components/product/ProductCard";
import ShopSidebar from "@/components/shop/ShopSidebar";

interface CategoryItem {
  _id: string;
  name: string;
  children?: CategoryItem[];
}

export default function ShopPage(){

const dispatch =
useAppDispatch();

// ===============================
// REDUX PRODUCTS
// ===============================

const products =
useAppSelector(
(state)=>state.products.products || []
);

const loading =
useAppSelector(
(state)=>state.products.loading
);

// ===============================
// LOCAL STATES
// ===============================

const [sort,setSort] =
useState("default");

const [filterOpen,setFilterOpen] =
useState(false);

const [categoryTree, setCategoryTree] = useState<CategoryItem[]>([]);

// FILTER STATES

const [category,setCategory] =
useState("all");

const [minPrice,setMinPrice] =
useState("");

const [maxPrice,setMaxPrice] =
useState("");

const [rating,setRating] =
useState(0);

const [stockOnly,setStockOnly] =
useState(false);

// ===============================
// FETCH PRODUCTS & CATEGORY TREE
// ===============================

useEffect(()=>{
  dispatch(fetchProducts());

  const fetchTree = async () => {
    try {
      const data = await getCategoryTree();
      setCategoryTree(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load category tree for filtering", err);
    }
  };

  fetchTree();
},[dispatch]);

// ===============================
// CLEAR FILTER
// ===============================

const clearFilter=()=>{
  setCategory("all");
  setMinPrice("");
  setMaxPrice("");
  setRating(0);
  setStockOnly(false);
};

// ===============================
// HELPER: GET ALL SUB-CATEGORY IDs
// ===============================

// কোনো ক্যাটেগরি বা তার সাব-ক্যাটেগরিগুলোর সব _id একটি অ্যারেতে বের করার ফাংশন
const getAllCategoryIds = (catId: string, items: CategoryItem[]): string[] => {
  let ids: string[] = [catId];

  for (const item of items) {
    if (item._id === catId) {
      // এই ক্যাটেগরির নিচে চাইল্ড থাকলে তাদের আইডিগুলো রিকার্সিভলি যুক্ত করা
      if (item.children && item.children.length > 0) {
        const collectChildrenIds = (children: CategoryItem[]) => {
          for (const child of children) {
            ids.push(child._id);
            if (child.children && child.children.length > 0) {
              collectChildrenIds(child.children);
            }
          }
        };
        collectChildrenIds(item.children);
      }
      break;
    } else if (item.children && item.children.length > 0) {
      const foundIds = getAllCategoryIds(catId, item.children);
      if (foundIds.length > 1 || foundIds.includes(catId)) {
        ids = foundIds;
        break;
      }
    }
  }

  return ids;
};

// ===============================
// FILTER
// ===============================

const filteredProducts =
products.filter((product)=>{

let categoryMatch = true;

if (category !== "all") {
  const productCatId = 
    typeof product.category === "object" 
      ? product.category?._id 
      : product.category;

  // সিলেক্ট করা ক্যাটেগরি এবং তার অধীনস্থ সকল সাব/সাব-সাব ক্যাটেগরির আইডিগুলো বের করা
  const validCategoryIds = getAllCategoryIds(category, categoryTree);

  // প্রোডাক্টের ক্যাটেগরি আইডি যদি এই লিস্টের যেকোনো একটির সাথে মিলে যায়
  categoryMatch = validCategoryIds.includes(productCatId);
}

const priceMatch =
(!minPrice ||
product.price >= Number(minPrice))
&&
(!maxPrice ||
product.price <= Number(maxPrice));

const ratingMatch =
!rating
||
(product.rating || 0)>=rating;

const stockMatch =
!stockOnly
||
product.stock>0;

return (
categoryMatch
&&
priceMatch
&&
ratingMatch
&&
stockMatch
);

});

// ===============================
// SORT
// ===============================

const sortedProducts =
[...filteredProducts].sort((a,b)=>{

if(sort==="low"){
return a.price-b.price;
}

if(sort==="high"){
return b.price-a.price;
}

if(sort==="rating"){
return (
(b.rating || 0)
-
(a.rating || 0)
);
}

return 0;

});

return (

<main
className="
min-h-screen
bg-gray-50
py-10
"
>

<div
className="
mx-auto
max-w-7xl
px-6
"
>

{/* HEADER */}

<div
className="
mb-8
flex
flex-col
gap-5
md:flex-row
md:items-center
md:justify-between
"
>

<div>

<h1
className="
text-4xl
font-bold
"
>
Shop Products
</h1>

<p
className="
mt-2
text-gray-500
"
>
{sortedProducts.length}
Products Found
</p>

</div>

<div
className="
flex
gap-3
"
>

<button
onClick={()=>
setFilterOpen(true)
}
className="
flex
items-center
gap-2
rounded-xl
bg-black
px-5
py-3
text-white
lg:hidden
"
>
<Filter size={18}/>
Filter
</button>

<div
className="
flex
items-center
gap-3
rounded-xl
bg-white
px-4
py-3
shadow
"
>

<SlidersHorizontal size={18}/>

<select
value={sort}
onChange={(e)=>
setSort(e.target.value)
}
className="
outline-none
text-sm
"
>

<option value="default">
Sort By
</option>

<option value="low">
Price Low To High
</option>

<option value="high">
Price High To Low
</option>

<option value="rating">
Top Rated
</option>

</select>

</div>

</div>

</div>

{/* MAIN GRID */}

<div
className="
grid
gap-8
lg:grid-cols-4
"
>

{/* SIDEBAR */}

<div
className="
hidden
lg:block
"
>

<ShopSidebar
open={false}
onClose={()=>{}}
category={category}
setCategory={setCategory}
minPrice={minPrice}
setMinPrice={setMinPrice}
maxPrice={maxPrice}
setMaxPrice={setMaxPrice}
rating={rating}
setRating={setRating}
stockOnly={stockOnly}
setStockOnly={setStockOnly}
clearFilter={clearFilter}
/>

</div>

{/* PRODUCTS */}

<div
className="
lg:col-span-3
"
>

{
loading &&

<div
className="
grid
grid-cols-2
gap-5
sm:grid-cols-3
xl:grid-cols-4
"
>

{
Array.from({
length:8
}).map((_,i)=>(

<div
key={i}
className="
h-96
rounded-3xl
bg-white
animate-pulse
"
/>

))
}

</div>

}

{
!loading &&
sortedProducts.length===0 &&

<div
className="
rounded-3xl
bg-white
p-10
text-center
"
>

<h2
className="
text-xl
font-bold
"
>
No products found
</h2>

<button
onClick={clearFilter}
className="
mt-5
rounded-full
bg-black
px-6
py-3
text-white
"
>
Clear Filter
</button>

</div>

}

{
!loading &&
sortedProducts.length>0 &&

<div
className="
grid
grid-cols-2
gap-5
sm:grid-cols-3
xl:grid-cols-4
"
>

{
sortedProducts.map(product=>(

<ProductCard
key={product._id}
product={product}
/>

))
}

</div>

}

</div>

</div>

{/* MOBILE SIDEBAR */}

<div
className="
lg:hidden
"
>

<ShopSidebar
open={filterOpen}
onClose={()=>
setFilterOpen(false)
}
category={category}
setCategory={setCategory}
minPrice={minPrice}
setMinPrice={setMinPrice}
maxPrice={maxPrice}
setMaxPrice={setMaxPrice}
rating={rating}
setRating={setRating}
stockOnly={stockOnly}
setStockOnly={setStockOnly}
clearFilter={clearFilter}
/>

</div>

</div>

</main>

);

}
