"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import { getProducts } from "@/services/product.service";
import { getCategoryTree } from "@/services/category.service";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default function CategoryPage({ params }: Props) {
  const [products, setProducts] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [currentSlug, setCurrentSlug] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setLoading(true);
        const resolvedParams = await params;
        const slug = resolvedParams.slug;
        setCurrentSlug(slug);

        // ক্যাটেগরি ট্রি ফেচ করা
        const categoryTree = await getCategoryTree();
        let foundCat: any = null;

        // যেকোনো লেভেল থেকে ক্যাটেগরি বা সাব-ক্যাটেগরি খুঁজে বের করার ফাংশন (Recursive Search)
        const findCategoryBySlug = (categories: any[], targetSlug: string): any => {
          for (const cat of categories) {
            if (cat.slug === targetSlug) {
              return cat;
            }
            if (cat.children && cat.children.length > 0) {
              const matched = findCategoryBySlug(cat.children, targetSlug);
              if (matched) return matched;
            }
          }
          return null;
        };

        foundCat = findCategoryBySlug(categoryTree, slug);

        // সাব-ক্যাটাগরির স্লাগগুলো সংগ্রহ করার একটি রিকার্সিভ হেল্পার ফাংশন
        const getAllSubSlugs = (cat: any): string[] => {
          let slugs = [cat.slug];
          if (cat.children && cat.children.length > 0) {
            for (const child of cat.children) {
              slugs = [...slugs, ...getAllSubSlugs(child)];
            }
          }
          return slugs;
        };

        let targetSlugs: string[] = [slug];

        if (foundCat) {
          setCategoryName(foundCat.name);
          setSubCategories(foundCat.children || []);
          // মেইন ক্যাটাগরি হলে তার নিজের স্লাগ এবং তার সব সাব-ক্যাটাগরির স্লাগ এক সাথে নেওয়া
          targetSlugs = getAllSubSlugs(foundCat);
        } else {
          setCategoryName(slug ? slug.replaceAll("-", " ") : "All Products");
          setSubCategories([]);
        }

        // প্রোডাক্ট ফেচ করে ফিল্টার করা
        const allProducts = await getProducts();

        if (slug && slug !== "all") {
          const filteredProducts = allProducts.filter((p: any) => {
            const categorySlug = p.category?.slug || p.category;
            const subcategorySlug = p.subcategory?.slug || p.subcategory || p.subCategory?.slug || p.subCategory;
            
            // মেইন ক্যাটাগরি বা সাব-ক্যাটাগরির যেকোনো একটির স্লাগের সাথে মিলে গেলে তা দেখাবে
            return targetSlugs.includes(categorySlug) || targetSlugs.includes(subcategorySlug);
          });

          setProducts(filteredProducts);
        } else {
          setProducts(allProducts);
        }
      } catch (error) {
        console.error("Failed to load category data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [params]);

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-5 py-8 space-y-8">
        
        {/* ক্যাটেগরি হেডার */}
        <div>
          <h1 className="text-3xl font-bold capitalize text-gray-900">
            {categoryName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Explore all items and Categories.</p>
        </div>

        {/* সাব-ক্যাটেগরি সেকশন */}
        {!loading && subCategories.length > 0 && (
          <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {subCategories.map((sub) => {
                const subImg = sub.image || sub.img;
                return (
                  <Link
                    key={sub._id}
                    href={`/category/${sub.slug}`}
                    className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200/60 shadow-xs hover:shadow-md transition-all group"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 mb-2">
                      {subImg ? (
                        <img src={subImg} alt={sub.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-gray-800 text-center truncate w-full">{sub.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* প্রোডাক্টস সেকশন */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Products</h2>
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-sm text-gray-500">No products found in this category.</p>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>

      </section>
    </main>
  );
}
