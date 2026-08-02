"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Edit, Trash2, Plus, Package, Star, TrendingUp, AlertTriangle, Flame, ChevronLeft, ChevronRight, ChevronDown, CheckSquare, Square, ArrowUpDown, Download, X, Save, DollarSign, Percent } from "lucide-react";
import { toast } from "sonner";
import { getAdminProducts, removeProduct, updateDealStatus, updateProduct } from "@/services/product.service";
import { getCategoryTree } from "@/services/category.service";
import { Product } from "@/types/product";
import { useCurrency } from "@/context/CurrencyContext";

interface CategoryItem {
  _id: string;
  name: string;
  children?: CategoryItem[];
}

type SortField = "name" | "price" | "stock" | "topSeller";
type SortOrder = "asc" | "desc";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [dealFilter, setDealFilter] = useState("all");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting State (Default set to "topSeller" so high sales products stay on top automatically)
  const [sortField, setSortField] = useState<SortField>("topSeller");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Bulk Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Quick Inline Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [quickPrice, setQuickPrice] = useState<string | number>("");
  const [quickDiscountPrice, setQuickDiscountPrice] = useState<string | number>("");
  const [quickStock, setQuickStock] = useState<string | number>("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { formatPrice } = useCurrency();

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const [productData, catData] = await Promise.all([
        getAdminProducts(token),
        getCategoryTree().catch(() => [])
      ]);

      setProducts(productData);
      setCategoryTree(Array.isArray(catData) ? catData : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await removeProduct(id, token);
      setProducts((prev) => prev.filter((item) => item._id !== id));
      setSelectedProductIds((prev) => prev.filter((selectedId) => selectedId !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedProductIds.length} selected products?`)) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await Promise.all(selectedProductIds.map((id) => removeProduct(id, token)));
      setProducts((prev) => prev.filter((item) => !selectedProductIds.includes(item._id)));
      setSelectedProductIds([]);
      toast.success("Selected products deleted successfully");
    } catch (error) {
      toast.error("Failed to delete selected products");
    }
  };

  const handleDealToggle = async (productId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const nextStatus = !currentStatus;
      const data = await updateDealStatus(productId, nextStatus, token);

      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, isDeal: nextStatus } : p))
        );
        toast.success("Deal status updated successfully");
      } else {
        toast.error(data.message || "Failed to update deal status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const openQuickEdit = (product: Product) => {
    setEditingProduct(product);
    setQuickPrice(product.price ?? "");
    setQuickDiscountPrice(product.discountPrice ?? 0);
    setQuickStock(product.stock ?? "");
  };

  const handleQuickEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      setIsUpdating(true);

      const parsedPrice = Number(quickPrice) || 0;
      const parsedDiscount = Number(quickDiscountPrice) || 0;
      const parsedStock = Number(quickStock) || 0;

      const categoryId = typeof editingProduct.category === "object" && editingProduct.category !== null 
        ? (editingProduct.category as any)._id 
        : editingProduct.category;

      const formData = new FormData();
      formData.append("name", editingProduct.name);
      formData.append("price", String(parsedPrice));
      formData.append("discountPrice", String(parsedDiscount));
      formData.append("stock", String(parsedStock));
      formData.append("category", categoryId || "");

      const res = await updateProduct(editingProduct._id, formData, token);

      if (res) {
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? { ...p, price: parsedPrice, discountPrice: parsedDiscount, stock: parsedStock } : p))
        );
        toast.success("Product updated successfully!");
        setEditingProduct(null);
      } else {
        toast.error("Failed to update product");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const currentMainCategoryObj = useMemo(() => {
    return categoryTree.find((cat) => cat._id === selectedCategory);
  }, [categoryTree, selectedCategory]);

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

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      const query = search.toLowerCase().trim();
      const matchesSearch = 
        p.name.toLowerCase().includes(query) || 
        p._id.toLowerCase().includes(query);
      
      const productCatId =
        typeof p.category === "object" && p.category !== null
          ? (p.category as any)?._id
          : p.category;

      let matchesCategory = true;
      if (selectedSubCategory !== "all") {
        const validIds = getAllCategoryIds(selectedSubCategory, categoryTree);
        matchesCategory = validIds.includes(productCatId);
      } else if (selectedCategory !== "all") {
        const validIds = getAllCategoryIds(selectedCategory, categoryTree);
        matchesCategory = validIds.includes(productCatId);
      }

      let matchesStock = true;
      if (stockFilter === "low") matchesStock = p.stock > 0 && p.stock < 10;
      else if (stockFilter === "out") matchesStock = p.stock === 0;
      else if (stockFilter === "in") matchesStock = p.stock >= 10;

      let matchesDeal = true;
      if (dealFilter === "deal") matchesDeal = !!p.isDeal;
      else if (dealFilter === "nodeal") matchesDeal = !p.isDeal;

      let matchesBadge = true;
      const totalSold = (p as any).totalSold || (p as any).orderCount || 0;
      if (badgeFilter === "bestSeller") matchesBadge = !!(p as any).isBestSeller;
      else if (badgeFilter === "topSeller") matchesBadge = !!(p as any).isTopSeller || totalSold > 0;
      else if (badgeFilter === "newArrival") matchesBadge = !!(p as any).isNewArrival;

      return matchesSearch && matchesCategory && matchesStock && matchesDeal && matchesBadge;
    });

    return filtered.sort((a, b) => {
      if (sortField === "topSeller") {
        const salesA = (a as any).totalSold || (a as any).orderCount || 0;
        const salesB = (b as any).totalSold || (b as any).orderCount || 0;
        return sortOrder === "desc" ? salesB - salesA : salesA - salesB;
      }

      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === "price") {
        valA = a.discountPrice > 0 ? a.discountPrice : a.price;
        valB = b.discountPrice > 0 ? b.discountPrice : b.price;
      }

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [products, search, selectedCategory, selectedSubCategory, stockFilter, dealFilter, badgeFilter, categoryTree, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Calculated Metrics for Professional Dashboard Stats
  const totalInventoryValue = useMemo(() => {
    return products.reduce((acc, p: any) => {
      const activePrice = p.discountPrice > 0 ? p.discountPrice : p.price;
      return acc + (Number(activePrice) || 0) * (Number(p.stock) || 0);
    }, 0);
  }, [products]);

  const totalDiscountedCount = useMemo(() => {
    return products.filter((p) => (p.discountPrice || 0) > 0).length;
  }, [products]);

  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const exportToCSV = () => {
    try {
      if (!filteredProducts || filteredProducts.length === 0) {
        toast.error("No products to export");
        return;
      }

      const headers = ["ID", "Name", "Category", "Price", "Stock", "Total Sold", "Is Best Seller", "Is Top Seller", "Is New Arrival", "Is Deal", "Is Featured"];
      const rows = filteredProducts.map((p: any) => {
        const catName = typeof p.category === "object" && p.category !== null ? p.category?.name || "Uncategorized" : "Uncategorized";
        const price = p.discountPrice > 0 ? p.discountPrice : p.price;
        const nameClean = (p.name || "").replace(/"/g, '""');
        const catClean = catName.replace(/"/g, '""');
        const totalSold = p.totalSold || p.orderCount || 0;
        const isTopSeller = !!p.isTopSeller || totalSold > 0 ? "Yes" : "No";

        return [
          p._id, 
          `"${nameClean}"`, 
          `"${catClean}"`, 
          price, 
          p.stock, 
          totalSold,
          p.isBestSeller ? "Yes" : "No",
          isTopSeller,
          p.isNewArrival ? "Yes" : "No",
          p.isDeal ? "Yes" : "No", 
          p.isFeatured ? "Yes" : "No"
        ];
      });

      const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Products exported successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export products");
    }
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === paginatedProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(paginatedProducts.map((p) => p._id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-20 rounded-3xl bg-gray-100 animate-pulse" />
        <div className="h-96 rounded-3xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Products Management</h1>
          <p className="text-gray-500">Advanced store inventory, valuation & export tools.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
          >
            <Download size={16} /> Export CSV
          </button>
          
          <Link
            href="/admin/products/add"
            className="flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-white font-semibold hover:bg-gray-800 transition-all cursor-pointer shadow-sm text-xs"
          >
            <Plus size={18} /> Add New Product
          </Link>
        </div>
      </div>

      {/* Professional Advanced Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard 
          title="Total Products" 
          value={products.length} 
          icon={Package} 
          description="Active inventory items"
          gradient="from-blue-500/10 via-blue-500/5 to-transparent"
          iconBg="bg-blue-600 text-white"
        />
        <StatCard 
          title="Inventory Value" 
          value={formatPrice(totalInventoryValue)} 
          icon={DollarSign} 
          description="Total stock asset worth"
          gradient="from-emerald-500/10 via-emerald-500/5 to-transparent"
          iconBg="bg-emerald-600 text-white"
        />
        <StatCard 
          title="Featured Items" 
          value={products.filter((p) => p.isFeatured).length} 
          icon={Star} 
          description="Highlighted on store"
          gradient="from-amber-500/10 via-amber-500/5 to-transparent"
          iconBg="bg-amber-500 text-white"
        />
        <StatCard 
          title="Active Deals" 
          value={products.filter((p) => p.isDeal).length} 
          icon={Flame} 
          description="Running special discounts"
          gradient="from-orange-500/10 via-orange-500/5 to-transparent"
          iconBg="bg-orange-500 text-white"
        />
        <StatCard 
          title="Discounted Items" 
          value={totalDiscountedCount} 
          icon={Percent} 
          description="Products on markdown"
          gradient="from-purple-500/10 via-purple-500/5 to-transparent"
          iconBg="bg-purple-600 text-white"
        />
        <StatCard 
          title="Low / Out of Stock" 
          value={products.filter((p) => p.stock < 10).length} 
          icon={AlertTriangle} 
          description="Requires attention"
          gradient="from-red-500/10 via-red-500/5 to-transparent"
          iconBg="bg-red-600 text-white"
        />
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="flex flex-col gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or ID..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>

          {currentMainCategoryObj?.children && currentMainCategoryObj.children.length > 0 ? (
            <div className="relative w-full">
              <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">
                <ChevronDown size={16} />
              </div>
              <select
                value={selectedSubCategory}
                onChange={(e) => {
                  setSelectedSubCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-4 pr-10 text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-black transition cursor-pointer"
              >
                <option value="all">All Sub-categories</option>
                {currentMainCategoryObj.children.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center px-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/30 text-xs text-gray-400 font-medium">
              No sub-categories available
            </div>
          )}

          <div className="relative w-full">
            <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">
              <ChevronDown size={16} />
            </div>
            <select
              value={badgeFilter}
              onChange={(e) => {
                setBadgeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-4 pr-10 text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-black transition cursor-pointer"
            >
              <option value="all">Filter by Badge (All)</option>
              <option value="bestSeller">Best Sellers</option>
              <option value="topSeller">Top Sellers (Auto / Sales)</option>
              <option value="newArrival">New Arrivals</option>
            </select>
          </div>

          <div className="relative w-full">
            <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">
              <ChevronDown size={16} />
            </div>
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-4 pr-10 text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-black transition cursor-pointer"
            >
              <option value="all">Filter by Stock (All)</option>
              <option value="in">In Stock (10+)</option>
              <option value="low">Low Stock (&lt;10)</option>
              <option value="out">Out of Stock (0)</option>
            </select>
          </div>

          <div className="relative w-full">
            <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">
              <ChevronDown size={16} />
            </div>
            <select
              value={dealFilter}
              onChange={(e) => {
                setDealFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50/50 py-3 pl-4 pr-10 text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-black transition cursor-pointer"
            >
              <option value="all">Filter by Deals (All)</option>
              <option value="deal">Active Deals Only</option>
              <option value="nodeal">Non-Deals Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none border-t border-gray-100">
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedSubCategory("all");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === "all"
                ? "bg-black text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Categories
          </button>
          {categoryTree.map((cat) => (
            <button
              key={cat._id}
              onClick={() => {
                setSelectedCategory(cat._id);
                setSelectedSubCategory("all");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat._id
                  ? "bg-black text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedProductIds.length > 0 && (
        <div className="flex items-center justify-between bg-black text-white px-6 py-3 rounded-2xl shadow-lg transition">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="bg-white/20 px-2 py-0.5 rounded-md">{selectedProductIds.length}</span>
            Products Selected
          </div>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
          >
            <Trash2 size={14} /> Delete Selected
          </button>
        </div>
      )}

      {/* Data Table */}
      {paginatedProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <Package size={50} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold">No Products Found</h2>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6 w-10">
                    <button onClick={handleSelectAll} className="cursor-pointer text-gray-500 hover:text-black">
                      {selectedProductIds.length === paginatedProducts.length && paginatedProducts.length > 0 ? (
                        <CheckSquare size={18} className="text-black" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-black" onClick={() => handleSortToggle("name")}>
                    <div className="flex items-center gap-1.5">
                      Product Info {sortField === "name" && <ArrowUpDown size={12} className="text-black" />}
                    </div>
                  </th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 cursor-pointer hover:text-black" onClick={() => handleSortToggle("price")}>
                    <div className="flex items-center gap-1.5">
                      Price {sortField === "price" && <ArrowUpDown size={12} className="text-black" />}
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-black" onClick={() => handleSortToggle("stock")}>
                    <div className="flex items-center gap-1.5">
                      Stock {sortField === "stock" && <ArrowUpDown size={12} className="text-black" />}
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-black" onClick={() => handleSortToggle("topSeller")}>
                    <div className="flex items-center gap-1.5">
                      Sales / Top Seller {sortField === "topSeller" && <ArrowUpDown size={12} className="text-black" />}
                    </div>
                  </th>
                  <th className="py-4 px-6">Deal Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedProducts.map((product: any) => {
                  const activePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
                  const categoryName = 
                    typeof product.category === "object" && product.category !== null
                      ? product.category?.name || "Uncategorized"
                      : "Uncategorized";
                  const isSelected = selectedProductIds.includes(product._id);
                  const totalSold = product.totalSold || product.orderCount || 0;

                  return (
                    <tr key={product._id} className={`hover:bg-gray-50/50 transition ${isSelected ? "bg-gray-50/80" : ""}`}>
                      <td className="py-4 px-6">
                        <button onClick={() => handleSelectOne(product._id)} className="cursor-pointer text-gray-500 hover:text-black">
                          {isSelected ? <CheckSquare size={18} className="text-black" /> : <Square size={18} />}
                        </button>
                      </td>
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                          <Image src={product.images?.[0]?.url || "/placeholder.png"} alt={product.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {product._id}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {product.discountPrice > 0 && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">SALE</span>}
                            {product.isFeatured && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">FEATURED</span>}
                            {product.isBestSeller && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">BEST SELLER</span>}
                            {(product.isTopSeller || totalSold > 0) && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">TOP SELLER</span>}
                            {product.isNewArrival && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">NEW ARRIVAL</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-medium">{categoryName}</td>
                      <td className="py-4 px-6">
                        <div className="font-black text-gray-900">{formatPrice(activePrice)}</div>
                        {product.discountPrice > 0 && <div className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</div>}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-bold px-2.5 py-1 rounded-lg text-xs ${product.stock === 0 ? "bg-red-100 text-red-700" : product.stock < 10 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
                          {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-xl">
                          {totalSold} Sold
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <label className="flex items-center gap-2 cursor-pointer w-fit text-xs font-semibold text-gray-700 select-none">
                          <input
                            type="checkbox"
                            checked={!!product.isDeal}
                            onChange={() => handleDealToggle(product._id, !!product.isDeal)}
                            className="w-4 h-4 accent-black rounded cursor-pointer"
                          />
                          <span className="flex items-center gap-1"><Flame size={12} className="text-amber-500" /> Deal</span>
                        </label>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openQuickEdit(product)}
                            title="Quick Edit Price & Stock"
                            className="p-2.5 rounded-xl bg-gray-100 hover:bg-black hover:text-white text-gray-700 transition cursor-pointer"
                          >
                            <TrendingUp size={16} />
                          </button>
                          <Link href={`/admin/products/edit/${product._id}`} className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition"><Edit size={16} /></Link>
                          <button onClick={() => deleteProduct(product._id)} className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 p-4 bg-gray-50/50 gap-4">
            <div className="flex items-center gap-3">
              <p className="text-xs text-gray-500">
                Showing page <span className="font-bold text-black">{currentPage}</span> of <span className="font-bold text-black">{totalPages || 1}</span>
              </p>
              
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-xl border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs font-bold text-gray-700 outline-none cursor-pointer"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-xl bg-white border border-gray-200 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-sm"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 rounded-xl bg-white border border-gray-200 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-sm"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">Quick Edit Product</h3>
                <p className="text-xs text-gray-500 line-clamp-1">{editingProduct.name}</p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickEditSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Regular Price</label>
                <input
                  type="number"
                  value={quickPrice}
                  onChange={(e) => setQuickPrice(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 px-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Discount Price (0 for none)</label>
                <input
                  type="number"
                  value={quickDiscountPrice}
                  onChange={(e) => setQuickDiscountPrice(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 px-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={quickStock}
                  onChange={(e) => setQuickStock(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 px-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} /> {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, description, gradient, iconBg }: any) {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-gray-200`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} pointer-events-none`} />
      <div className="relative z-10 flex items-center justify-between">
        <div className={`rounded-2xl p-3 shadow-sm ${iconBg}`}>
          <Icon size={22} />
        </div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live</span>
      </div>
      <div className="relative z-10 mt-5">
        <h3 className="text-3xl font-black tracking-tight text-gray-900">{value}</h3>
        <p className="mt-1 text-xs font-bold text-gray-700">{title}</p>
        {description && <p className="mt-0.5 text-[11px] text-gray-400 font-medium">{description}</p>}
      </div>
    </div>
  );
}
