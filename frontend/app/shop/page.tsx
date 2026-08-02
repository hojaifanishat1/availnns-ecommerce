"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, Filter, ShoppingBag, ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchProducts } from "@/store/slices/productSlice";
import { getCategoryTree } from "@/services/category.service";
import ProductCard from "@/components/product/ProductCard";
import ShopSidebar from "@/components/shop/ShopSidebar";

interface CategoryItem {
  _id: string;
  name: string;
  children?: CategoryItem[];
}

export default function ShopPage() {
  const dispatch = useAppDispatch();

  // ===============================
  // REDUX PRODUCTS
  // ===============================
  const products = useAppSelector((state) => state.products.products || []);
  const loading = useAppSelector((state) => state.products.loading);

  // ===============================
  // LOCAL STATES
  // ===============================
  const [sort, setSort] = useState("default");
  const [filterOpen, setFilterOpen] = useState(false);
  const [categoryTree, setCategoryTree] = useState<CategoryItem[]>([]);

  // FILTER STATES
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rating, setRating] = useState(0);
  const [stockOnly, setStockOnly] = useState(false);

  // ===============================
  // FETCH PRODUCTS & CATEGORY TREE
  // ===============================
  useEffect(() => {
    dispatch(fetchProducts());

    const fetchTree = async () => {
      try {
        const data = await getCategoryTree();
        setCategoryTree(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load category tree", err);
      }
    };

    fetchTree();
  }, [dispatch]);

  // ===============================
  // CLEAR FILTER
  // ===============================
  const clearFilter = () => {
    setCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setRating(0);
    setStockOnly(false);
  };

  // ===============================
  // HELPER: GET ALL SUB-CATEGORY IDs
  // ===============================
  const getAllCategoryIds = (catId: string, items: CategoryItem[]): string[] => {
    let ids: string[] = [catId];

    for (const item of items) {
      if (item._id === catId) {
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
  const filteredProducts = products.filter((product) => {
    let categoryMatch = true;

    if (category !== "all") {
      const productCatId =
        typeof product.category === "object"
          ? product.category?._id
          : product.category;

      const validCategoryIds = getAllCategoryIds(category, categoryTree);
      categoryMatch = validCategoryIds.includes(productCatId);
    }

    const priceMatch =
      (!minPrice || product.price >= Number(minPrice)) &&
      (!maxPrice || product.price <= Number(maxPrice));

    const ratingMatch = !rating || (product.rating || 0) >= rating;
    const stockMatch = !stockOnly || product.stock > 0;

    return categoryMatch && priceMatch && ratingMatch && stockMatch;
  });

  // ===============================
  // SORT
  // ===============================
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "low") return a.price - b.price;
    if (sort === "high") return b.price - a.price;
    if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  return (
    <main className="min-h-screen bg-zinc-50/50 py-10 selection:bg-zinc-900 selection:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900">
              Curated Shop
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 font-medium">
              Explore products organized by sections and categories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-black transition cursor-pointer lg:hidden"
            >
              <Filter size={16} /> Filter
            </button>

            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 border border-zinc-200/80 shadow-xs">
              <SlidersHorizontal size={15} className="text-zinc-500" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent outline-none text-xs font-bold text-zinc-800 cursor-pointer"
              >
                <option value="default">Sort by: Featured</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid gap-8 lg:grid-cols-4 items-start">
          
          {/* DESKTOP SIDEBAR */}
          <div className="hidden lg:block lg:col-span-1 sticky top-6">
            <div className="bg-white rounded-3xl border border-zinc-200/80 p-5 shadow-xs">
              <ShopSidebar
                open={false}
                onClose={() => {}}
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

          {/* PRODUCTS CONTAINER: SECTION-WISE VIEW */}
          <div className="lg:col-span-3 space-y-12">
            {loading && (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-96 rounded-3xl bg-zinc-100 animate-pulse border border-zinc-200/50"
                  />
                ))}
              </div>
            )}

            {!loading && sortedProducts.length === 0 && (
              <div className="rounded-3xl bg-white border border-zinc-200/80 p-12 text-center shadow-xs">
                <div className="mx-auto w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h2 className="text-xl font-bold text-zinc-900">No products found</h2>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Try changing your filters or browse another category.
                </p>
                <button
                  onClick={clearFilter}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-xs font-bold text-white shadow-lg hover:bg-black transition cursor-pointer"
                >
                  Clear Filters <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* IF "ALL" IS SELECTED: SHOW PRODUCTS GROUPED BY CATEGORY SECTIONS */}
            {!loading && sortedProducts.length > 0 && category === "all" && (
              categoryTree.map((cat) => {
                const catProducts = sortedProducts.filter((product) => {
                  const productCatId =
                    typeof product.category === "object"
                      ? product.category?._id
                      : product.category;
                  const validCategoryIds = getAllCategoryIds(cat._id, categoryTree);
                  return validCategoryIds.includes(productCatId);
                });

                if (catProducts.length === 0) return null;

                return (
                  <div key={cat._id} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                      <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">
                        {cat.name}
                      </h2>
                      <button
                        onClick={() => setCategory(cat._id)}
                        className="text-xs font-bold text-zinc-600 hover:text-black transition flex items-center gap-1 cursor-pointer"
                      >
                        View All <ArrowRight size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3">
                      {catProducts.slice(0, 3).map((product) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            {/* IF A SPECIFIC CATEGORY IS SELECTED: SHOW STANDARD GRID */}
            {!loading && sortedProducts.length > 0 && category !== "all" && (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3">
                {sortedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MOBILE SIDEBAR DRAWER */}
        <div className="lg:hidden">
          <ShopSidebar
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
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
