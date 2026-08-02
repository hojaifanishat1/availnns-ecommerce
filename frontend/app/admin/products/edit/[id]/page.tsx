"use client";

import {
  useEffect,
  useState,
  useRef,
} from "react";
import {
  useRouter,
  useParams,
} from "next/navigation";
import Image from "next/image";
import {
  Upload,
  X,
  Save,
  Package,
  Layers,
  Palette,
  Globe,
  Plus,
  Trash,
  Bell,
  Shirt,
  Watch,
  Footprints,
  Scissors,
  Smartphone,
  Tablet,
  Laptop as LaptopIcon,
  ArrowLeft,
  ChevronDown,
  Check,
  FolderTree,
} from "lucide-react";
import {
  toast,
} from "sonner";
import {
  getProductById,
  updateProduct,
} from "@/services/product.service";
import {
  getAdminCategories,
} from "@/services/category.service";
import {
  Category,
} from "@/types/category";
import { useCurrency } from "@/context/CurrencyContext";

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const DEFAULT_SHOE_SIZES = ["6", "7", "8", "9", "10", "11", "12", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10"];
const DEFAULT_PANT_SIZES = ["28", "30", "32", "34", "36", "38", "40", "42"];
const DEFAULT_UNDERWEAR_SIZES = ["S", "M", "L", "XL", "XXL"];
const DEFAULT_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#EF4444" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#10B981" },
  { name: "Yellow", hex: "#F59E0B" },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const { currency } = useCurrency();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  
  // Images (Existing URLs & New Files)
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  // Custom Dropdown Interactive States
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Main Form State
  const [form, setForm] = useState({
    name: "",
    description: "",
    brand: "",
    sku: "",
    price: "",
    discountPrice: "",
    discountStartDate: "",
    discountEndDate: "",
    stock: "",
    lowStockThreshold: "5",
    category: "",
    tags: "",
    weight: "",
    isDigital: false,
    freeShipping: false,
    metaTitle: "",
    metaDescription: "",
    
    // Category Specific Fields
    warrantyPeriod: "",
    storageCapacity: "",
    ramSize: "",
    screenSize: "",
    processorType: "",
    fabricType: "",
    fitType: "",
    waistRise: "",
    material: "",
    strapType: "",
    soleMaterial: "",
    capStyle: "",

    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
  });

  // Custom Editable Lists for Sizes and Colors
  const [availableSizesList, setAvailableSizesList] = useState<string[]>(DEFAULT_SIZES);
  const [availableColorsList, setAvailableColorsList] = useState<{ name: string; hex: string }[]>(DEFAULT_COLORS);

  const [newSizeInput, setNewSizeInput] = useState("");
  const [newColorNameInput, setNewColorNameInput] = useState("");
  const [newColorHexInput, setNewColorHexInput] = useState("#000000");

  // Selected State
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sizeColorStock, setSizeColorStock] = useState<Record<string, Record<string, number>>>({});

  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ]);

  const selectedCategoryObj = categories.find((cat) => cat._id === form.category);
  const categoryName = selectedCategoryObj?.name?.toLowerCase() || "";

  const isMobile = categoryName.includes("mobile") || categoryName.includes("phone") || categoryName.includes("smartphone");
  const isIpad = categoryName.includes("ipad") || categoryName.includes("tablet");
  const isLaptop = categoryName.includes("laptop") || categoryName.includes("macbook") || categoryName.includes("computer");
  const isShirt = categoryName.includes("shirt") && !categoryName.includes("t-shirt") && !categoryName.includes("tshirt");
  const isTShirt = categoryName.includes("t-shirt") || categoryName.includes("tshirt");
  const isPant = categoryName.includes("pant") || categoryName.includes("trouser") || categoryName.includes("jean") || categoryName.includes("chinos") || categoryName.includes("cargo");
  const isUnderwear = categoryName.includes("underware") || categoryName.includes("underwear") || categoryName.includes("innerwear") || categoryName.includes("brief") || categoryName.includes("boxer");
  const isWatch = categoryName.includes("watch") || categoryName.includes("smartwatch");
  const isCap = categoryName.includes("cap") || categoryName.includes("hat") || categoryName.includes("beanie");
  const isShoes = categoryName.includes("shoe") || categoryName.includes("footwear") || categoryName.includes("sneaker") || categoryName.includes("sandal") || categoryName.includes("boot");
  const isAccessories = (categoryName.includes("accessori") || categoryName.includes("jewel") || categoryName.includes("sunglass")) && !isWatch && !isCap;

  const hasSizes = !isMobile && !isIpad && !isLaptop && !isWatch && !isAccessories;

  // Outside click listener for custom category dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Categories & Product Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch categories even if token is missing so the dropdown works or handles gracefully
        const catData = await getAdminCategories(token || "").catch(() => []);
        setCategories(catData);

        if (!productId) {
          setFetching(false);
          setCategoryLoading(false);
          return;
        }

        const productData = await getProductById(productId);

        if (productData) {
          const p = productData;
          setForm({
            name: p.name || "",
            description: p.description || "",
            brand: p.brand || "",
            sku: p.sku || "",
            price: p.price?.toString() || "",
            discountPrice: p.discountPrice?.toString() || "",
            discountStartDate: p.discountStartDate ? p.discountStartDate.split("T")[0] : "",
            discountEndDate: p.discountEndDate ? p.discountEndDate.split("T")[0] : "",
            stock: p.stock?.toString() || "",
            lowStockThreshold: p.lowStockThreshold?.toString() || "5",
            category: p.category?._id || p.category || "",
            tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
            weight: p.weight?.toString() || "",
            isDigital: p.isDigital || false,
            freeShipping: p.freeShipping || false,
            metaTitle: p.metaTitle || "",
            metaDescription: p.metaDescription || "",
            
            warrantyPeriod: p.warrantyPeriod || "",
            storageCapacity: p.storageCapacity || "",
            ramSize: p.ramSize || "",
            screenSize: p.screenSize || "",
            processorType: p.processorType || "",
            fabricType: p.fabricType || "",
            fitType: p.fitType || "",
            waistRise: p.waistRise || "",
            material: p.material || "",
            strapType: p.strapType || "",
            soleMaterial: p.soleMaterial || "",
            capStyle: p.capStyle || "",

            isFeatured: p.isFeatured || false,
            isBestSeller: p.isBestSeller || false,
            isNewArrival: p.isNewArrival || false,
          });

          if (p.images && Array.isArray(p.images)) {
            setExistingImages(p.images);
          }

          if (p.sizes && Array.isArray(p.sizes)) {
            setSelectedSizes(p.sizes);
          }

          if (p.colors && Array.isArray(p.colors)) {
            setSelectedColors(p.colors);
          }

          if (p.sizeColorStock) {
            setSizeColorStock(p.sizeColorStock);
          }

          if (p.specifications && Array.isArray(p.specifications) && p.specifications.length > 0) {
            setSpecifications(p.specifications);
          }
        }
      } catch (err: any) {
        console.error("Error loading product data:", err);
        setError(err?.response?.data?.message || err?.message || "Failed to load product details");
        toast.error("Failed to load product details");
      } finally {
        setCategoryLoading(false);
        setFetching(false);
      }
    };

    loadData();
  }, [productId]);

  // Preview new images
  useEffect(() => {
    const urls = newImages.map((file) => URL.createObjectURL(file));
    setNewPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImages]);

  // Auto adjust default sizes list based on category type
  useEffect(() => {
    if (isPant) {
      setAvailableSizesList(DEFAULT_PANT_SIZES);
    } else if (isShoes) {
      setAvailableSizesList(DEFAULT_SHOE_SIZES);
    } else if (isUnderwear) {
      setAvailableSizesList(DEFAULT_UNDERWEAR_SIZES);
    } else {
      setAvailableSizesList(DEFAULT_SIZES);
    }
  }, [isPant, isShoes, isUnderwear]);

  const handleAddCustomSize = () => {
    if (!newSizeInput.trim()) return;
    const formattedSize = newSizeInput.trim().toUpperCase();
    if (!availableSizesList.includes(formattedSize)) {
      setAvailableSizesList((prev) => [...prev, formattedSize]);
    }
    setSelectedSizes((prev) => (prev.includes(formattedSize) ? prev : [...prev, formattedSize]));
    setNewSizeInput("");
  };

  const handleDeleteSize = (sizeToDelete: string) => {
    setAvailableSizesList((prev) => prev.filter((s) => s !== sizeToDelete));
    setSelectedSizes((prev) => prev.filter((s) => s !== sizeToDelete));
    setSizeColorStock((prev) => {
      const updated = { ...prev };
      delete updated[sizeToDelete];
      
      let total = 0;
      Object.keys(updated).forEach((sz) => {
        Object.keys(updated[sz]).forEach((col) => {
          total += updated[sz][col] || 0;
        });
      });
      setForm((f) => ({ ...f, stock: total === 0 ? "" : total.toString() }));

      return updated;
    });
  };

  const handleAddCustomColor = () => {
    if (!newColorNameInput.trim()) return;
    const colorName = newColorNameInput.trim();
    const exists = availableColorsList.some((c) => c.name.toLowerCase() === colorName.toLowerCase());
    
    if (!exists) {
      setAvailableColorsList((prev) => [...prev, { name: colorName, hex: newColorHexInput }]);
    }
    setSelectedColors((prev) => (prev.includes(colorName) ? prev : [...prev, colorName]));
    setNewColorNameInput("");
  };

  const handleDeleteColor = (colorToDelete: string) => {
    setAvailableColorsList((prev) => prev.filter((c) => c.name !== colorToDelete));
    setSelectedColors((prev) => prev.filter((c) => c !== colorToDelete));
    setSizeColorStock((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((sz) => {
        if (updated[sz]) {
          const colorMap = { ...updated[sz] };
          delete colorMap[colorToDelete];
          updated[sz] = colorMap;
        }
      });

      let total = 0;
      Object.keys(updated).forEach((sz) => {
        Object.keys(updated[sz]).forEach((col) => {
          total += updated[sz][col] || 0;
        });
      });
      setForm((f) => ({ ...f, stock: total === 0 ? "" : total.toString() }));

      return updated;
    });
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => {
      const nextSizes = prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size];
      
      setSizeColorStock((currentMatrix) => {
        const updated = { ...currentMatrix };
        if (prev.includes(size)) {
          delete updated[size];
        } else {
          updated[size] = {};
        }

        let total = 0;
        Object.keys(updated).forEach((sz) => {
          Object.keys(updated[sz]).forEach((col) => {
            total += updated[sz][col] || 0;
          });
        });
        setForm((f) => ({ ...f, stock: total === 0 ? "" : total.toString() }));

        return updated;
      });

      return nextSizes;
    });
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) => {
      const nextColors = prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName];
      
      setSizeColorStock((currentMatrix) => {
        const updated = { ...currentMatrix };
        Object.keys(updated).forEach((sz) => {
          if (updated[sz]) {
            const colorMap = { ...updated[sz] };
            if (prev.includes(colorName)) {
              delete colorMap[colorName];
            }
            updated[sz] = colorMap;
          }
        });

        let total = 0;
        Object.keys(updated).forEach((sz) => {
          Object.keys(updated[sz]).forEach((col) => {
            total += updated[sz][col] || 0;
          });
        });
        setForm((f) => ({ ...f, stock: total === 0 ? "" : total.toString() }));

        return updated;
      });

      return nextColors;
    });
  };

  const handleStockChange = (size: string, color: string, value: string) => {
    const numVal = value === "" ? 0 : parseInt(value, 10);
    setSizeColorStock((prev) => {
      const sizeObj = prev[size] || {};
      const updatedSizeObj = { ...sizeObj, [color]: isNaN(numVal) ? 0 : numVal };
      const newMatrix = { ...prev, [size]: updatedSizeObj };

      let total = 0;
      Object.keys(newMatrix).forEach((sz) => {
        Object.keys(newMatrix[sz]).forEach((col) => {
          total += newMatrix[sz][col] || 0;
        });
      });

      setForm((f) => ({ ...f, stock: total === 0 ? "" : total.toString() }));

      return newMatrix;
    });
  };

  const handleSpecChange = (index: number, field: "key" | "value", val: string) => {
    const updated = [...specifications];
    updated[index][field] = val;
    setSpecifications(updated);
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const discountPercentage =
    Number(form.price) > 0 &&
    Number(form.discountPrice) > 0 &&
    Number(form.discountPrice) < Number(form.price)
      ? Math.round(
          ((Number(form.price) - Number(form.discountPrice)) /
            Number(form.price)) *
            100
        )
      : 0;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files allowed");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB`);
        return false;
      }
      return true;
    });

    const totalImagesCount = existingImages.length + newImages.length + validFiles.length;
    if (totalImagesCount > 6) {
      toast.error("Maximum 6 images allowed in total");
      return;
    }

    setNewImages((prev) => [...prev, ...validFiles]);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized");
        return;
      }

      if (!form.category) {
        setError("Please select a product category");
        return;
      }

      if (
        form.discountPrice &&
        Number(form.discountPrice) >= Number(form.price)
      ) {
        setError("Discount price must be lower than price");
        return;
      }

      if (existingImages.length === 0 && newImages.length === 0) {
        setError("Please upload at least one product image");
        return;
      }

      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "tags") {
          const tags = value
            .toString()
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
          data.append("tags", JSON.stringify(tags));
        } else {
          data.append(key, String(value));
        }
      });

      data.append("existingImages", JSON.stringify(existingImages));
      data.append("sizes", JSON.stringify(selectedSizes));
      data.append("colors", JSON.stringify(selectedColors));
      data.append("sizeColorStock", JSON.stringify(sizeColorStock));
      data.append("specifications", JSON.stringify(specifications.filter(s => s.key && s.value)));

      newImages.forEach((file) => {
        data.append("images", file);
      });

      await updateProduct(productId, data, token);

      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Product update failed");
    } finally {
      setLoading(false);
    }
  };

  const parentCategories = categories.filter((cat) => !cat.parent);
  const getSubCategories = (parentId: string) => categories.filter((cat) => cat.parent === parentId || (cat.parent && typeof cat.parent === 'object' && (cat.parent as any)._id === parentId));

  const toggleParentExpand = (parentId: string) => {
    setExpandedParents((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  if (fetching) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
          <p className="text-gray-500 font-medium">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 self-start rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div>
          <h1 className="text-3xl font-black">Edit Product</h1>
          <p className="mt-2 text-gray-500">Update product details, pricing, variants and inventory</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-3xl bg-white p-8 shadow-xl border border-gray-100"
      >
        {error && (
          <div className="rounded-xl bg-red-100 p-4 font-medium text-red-600 flex items-center justify-between">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} className="text-red-800 font-bold">&times;</button>
          </div>
        )}

        {/* TYPE TOGGLE */}
        <section>
          <div className="flex gap-4 p-1">
            <label className={`flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 p-4 transition ${!form.isDigital ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>
              <input type="radio" name="isDigital" checked={!form.isDigital} onChange={() => setForm(p => ({...p, isDigital: false}))} className="hidden" />
              <Package size={20} />
              <span className="font-bold">Physical Product</span>
            </label>
            <label className={`flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 p-4 transition ${form.isDigital ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>
              <input type="radio" name="isDigital" checked={form.isDigital} onChange={() => setForm(p => ({...p, isDigital: true}))} className="hidden" />
              <Globe size={20} />
              <span className="font-bold">Digital / Downloadable</span>
            </label>
          </div>
        </section>

        {/* PRODUCT INFO */}
        <section className="border-t pt-6">
          <div className="mb-5 flex items-center gap-2">
            <Package size={22} />
            <h2 className="text-xl font-bold">Product Information</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product Name"
              className="rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
              required
            />
            <input
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="Brand Name"
              className="rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
            />
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="SKU (Stock Keeping Unit)"
              className="rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
            />
            
            {/* Custom Interactive Main Category Dropdown */}
            <div className="relative w-full" ref={categoryDropdownRef}>
              <div
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`flex w-full items-center justify-between rounded-xl border bg-white p-3.5 cursor-pointer transition-all shadow-sm ${
                  isCategoryOpen ? "border-black ring-2 ring-black/10" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FolderTree size={18} className="text-gray-400 shrink-0" />
                  <span className={`font-medium truncate ${selectedCategoryObj ? "text-gray-900" : "text-gray-400"}`}>
                    {selectedCategoryObj ? selectedCategoryObj.name : "Select Product Category"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  {selectedCategoryObj && (
                    <span className="rounded-full bg-gray-100 p-1 text-gray-600 hover:bg-gray-200" onClick={(e) => { e.stopPropagation(); setForm(p => ({...p, category: ""})); }}>
                      <X size={12} />
                    </span>
                  )}
                  <ChevronDown size={18} className={`text-gray-500 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
                </div>
              </div>

              {isCategoryOpen && (
                <div className="absolute left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                  {categoryLoading ? (
                    <div className="py-8 text-center text-sm text-gray-400">Loading categories...</div>
                  ) : parentCategories.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">No categories found</div>
                  ) : (
                    <div className="space-y-1">
                      {parentCategories.map((parentCat) => {
                        const subCats = getSubCategories(parentCat._id);
                        const isExpanded = expandedParents[parentCat._id];
                        const isSelected = form.category === parentCat._id;

                        return (
                          <div key={parentCat._id} className="overflow-hidden rounded-xl">
                            <div
                              className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all cursor-pointer ${
                                isSelected 
                                  ? "bg-black text-white font-semibold shadow-sm" 
                                  : "hover:bg-gray-50 text-gray-800"
                              }`}
                              onClick={() => {
                                setForm((prev) => ({ ...prev, category: parentCat._id }));
                                if (subCats.length > 0) {
                                  toggleParentExpand(parentCat._id);
                                } else {
                                  setIsCategoryOpen(false);
                                }
                              }}
                            >
                              <span className="flex-1 font-medium">{parentCat.name}</span>
                              <div className="flex items-center gap-2">
                                {isSelected && <Check size={16} className="text-white" />}
                                {subCats.length > 0 && (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleParentExpand(parentCat._id);
                                    }}
                                    className={`rounded-lg p-1 transition-colors ${isSelected ? "hover:bg-gray-800 text-white" : "hover:bg-gray-200 text-gray-400"}`}
                                  >
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                                  </div>
                                )}
                              </div>
                            </div>

                            {subCats.length > 0 && isExpanded && (
                              <div className="ml-3 my-1 pl-3 border-l-2 border-gray-100 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                {subCats.map((subCat) => {
                                  const isSubSelected = form.category === subCat._id;
                                  return (
                                    <div
                                      key={subCat._id}
                                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all cursor-pointer ${
                                        isSubSelected 
                                          ? "bg-gray-900 text-white font-semibold shadow-sm" 
                                          : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setForm((prev) => ({ ...prev, category: subCat._id }));
                                        setIsCategoryOpen(false);
                                      }}
                                    >
                                      <span className="truncate">{subCat.name}</span>
                                      {isSubSelected && <Check size={14} className="text-white shrink-0 ml-2" />}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </section>

        {/* SPECIFIC CATEGORY ATTRIBUTES */}
        {isMobile && (
          <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
              <Smartphone size={20} /> Mobile Specific Attributes
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">Storage Capacity</label>
                <input type="text" name="storageCapacity" value={form.storageCapacity} onChange={handleChange} placeholder="e.g. 128GB" className="mt-2 w-full rounded-xl border p-3 bg-white outline-none" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">RAM Size</label>
                <input type="text" name="ramSize" value={form.ramSize} onChange={handleChange} placeholder="e.g. 8GB" className="mt-2 w-full rounded-xl border p-3 bg-white outline-none" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Warranty</label>
                <input type="text" name="warrantyPeriod" value={form.warrantyPeriod} onChange={handleChange} placeholder="1 Year" className="mt-2 w-full rounded-xl border p-3 bg-white outline-none" />
              </div>
            </div>
          </section>
        )}

        {isIpad && (
          <section className="rounded-2xl border border-sky-100 bg-sky-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-sky-600 font-bold text-lg">
              <Tablet size={20} /> iPad Attributes
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <input type="text" name="storageCapacity" value={form.storageCapacity} onChange={handleChange} placeholder="Storage (e.g. 256GB)" className="rounded-xl border p-3 bg-white outline-none" />
              <input type="text" name="screenSize" value={form.screenSize} onChange={handleChange} placeholder="Screen Size (e.g. 11-inch)" className="rounded-xl border p-3 bg-white outline-none" />
            </div>
          </section>
        )}

        {isLaptop && (
          <section className="rounded-2xl border border-cyan-100 bg-cyan-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-cyan-700 font-bold text-lg">
              <LaptopIcon size={20} /> Laptop Attributes
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <input type="text" name="processorType" value={form.processorType} onChange={handleChange} placeholder="Processor (e.g. M3)" className="rounded-xl border p-3 bg-white outline-none" />
              <input type="text" name="storageCapacity" value={form.storageCapacity} onChange={handleChange} placeholder="RAM/SSD (e.g. 16GB/512GB)" className="rounded-xl border p-3 bg-white outline-none" />
              <input type="text" name="warrantyPeriod" value={form.warrantyPeriod} onChange={handleChange} placeholder="Warranty" className="rounded-xl border p-3 bg-white outline-none" />
            </div>
          </section>
        )}

        {(isShirt || isTShirt) && (
          <section className="rounded-2xl border border-rose-100 bg-rose-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-lg">
              <Shirt size={20} /> Shirt / T-Shirt Attributes
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <input type="text" name="fabricType" value={form.fabricType} onChange={handleChange} placeholder="Fabric Type (e.g. Cotton)" className="rounded-xl border p-3 bg-white outline-none" />
              <input type="text" name="fitType" value={form.fitType} onChange={handleChange} placeholder="Fit Type (e.g. Regular Fit)" className="rounded-xl border p-3 bg-white outline-none" />
            </div>
          </section>
        )}

        {isPant && (
          <section className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
              <Scissors size={20} /> Pant Attributes
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <input type="text" name="fabricType" value={form.fabricType} onChange={handleChange} placeholder="Fabric Type" className="rounded-xl border p-3 bg-white outline-none" />
              <input type="text" name="waistRise" value={form.waistRise} onChange={handleChange} placeholder="Waist Rise" className="rounded-xl border p-3 bg-white outline-none" />
            </div>
          </section>
        )}

        {isWatch && (
          <section className="rounded-2xl border border-purple-100 bg-purple-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-purple-600 font-bold text-lg">
              <Watch size={20} /> Watch Attributes
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <input type="text" name="strapType" value={form.strapType} onChange={handleChange} placeholder="Strap Type" className="rounded-xl border p-3 bg-white outline-none" />
              <input type="text" name="material" value={form.material} onChange={handleChange} placeholder="Material" className="rounded-xl border p-3 bg-white outline-none" />
            </div>
          </section>
        )}

        {isShoes && (
          <section className="rounded-2xl border border-amber-100 bg-amber-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-lg">
              <Footprints size={20} /> Shoe Attributes
            </div>
            <input type="text" name="soleMaterial" value={form.soleMaterial} onChange={handleChange} placeholder="Sole Material" className="w-full rounded-xl border p-3 bg-white outline-none" />
          </section>
        )}

        {/* VARIANTS: SIZES & COLORS WITH ADD & DELETE OPTIONS */}
        {!form.isDigital && (
          <section className="border-t pt-6 space-y-6">
            <div className="grid gap-8 md:grid-cols-2">
              
              {/* SIZES SECTION */}
              {hasSizes && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers size={18} />
                      <h3 className="text-lg font-bold">Manage Sizes</h3>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSizeInput}
                      onChange={(e) => setNewSizeInput(e.target.value)}
                      placeholder="Add custom size (e.g. 3XL)"
                      className="flex-1 rounded-xl border p-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSize}
                      className="flex items-center gap-1 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition"
                    >
                      <Plus size={16} /> Add Size
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {availableSizesList.map((size) => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <div
                          key={size}
                          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${
                            isSelected
                              ? "bg-black text-white border-black shadow"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span onClick={() => toggleSize(size)} className="cursor-pointer">{size}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSize(size);
                            }}
                            className="ml-1 text-gray-400 hover:text-red-500 transition"
                            title="Delete Size"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* COLORS SECTION */}
              <div className={!hasSizes ? "md:col-span-2" : ""}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Palette size={18} />
                    <h3 className="text-lg font-bold">Manage Colors</h3>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newColorNameInput}
                    onChange={(e) => setNewColorNameInput(e.target.value)}
                    placeholder="Color Name (e.g. Navy Blue)"
                    className="flex-1 rounded-xl border p-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="color"
                    value={newColorHexInput}
                    onChange={(e) => setNewColorHexInput(e.target.value)}
                    className="h-11 w-12 cursor-pointer rounded-xl border bg-white p-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="flex items-center gap-1 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition"
                  >
                    <Plus size={16} /> Add Color
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {availableColorsList.map((col) => {
                    const isSelected = selectedColors.includes(col.name);
                    return (
                      <div
                        key={col.name}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${
                          isSelected
                            ? "bg-black text-white border-black shadow"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-gray-300 cursor-pointer"
                          style={{ backgroundColor: col.hex }}
                          onClick={() => toggleColor(col.name)}
                        />
                        <span onClick={() => toggleColor(col.name)} className="cursor-pointer">{col.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteColor(col.name);
                          }}
                          className="ml-1 text-gray-400 hover:text-red-500 transition"
                          title="Delete Color"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* SIZE-COLOR COMBINATION STOCK MATRIX */}
            {selectedColors.length > 0 && (hasSizes ? selectedSizes.length > 0 : true) && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-6 space-y-4 mt-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Per-Variant Stock Allocation (Pcs per Size & Color)</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the exact quantity available for each combination. Total stock will update automatically.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {hasSizes && <th className="py-3 px-4">Size</th>}
                        <th className="py-3 px-4">Color</th>
                        <th className="py-3 px-4">Quantity (Pcs)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                      {hasSizes ? (
                        selectedSizes.map((size) =>
                          selectedColors.map((color) => (
                            <tr key={`${size}-${color}`} className="hover:bg-white/60 transition">
                              <td className="py-3 px-4 font-bold text-gray-800">{size}</td>
                              <td className="py-3 px-4 flex items-center gap-2 text-gray-700">
                                <span
                                  className="h-3 w-3 rounded-full border border-gray-300"
                                  style={{
                                    backgroundColor: availableColorsList.find((c) => c.name === color)?.hex || "#000",
                                  }}
                                />
                                {color}
                              </td>
                              <td className="py-3 px-4">
                                <input
                                  type="number"
                                  min="0"
                                  value={sizeColorStock[size]?.[color] ?? ""}
                                  onChange={(e) => handleStockChange(size, color, e.target.value)}
                                  placeholder="0 pcs"
                                  className="w-32 rounded-lg border bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-black"
                                />
                              </td>
                            </tr>
                          ))
                        )
                      ) : (
                        selectedColors.map((color) => (
                          <tr key={color} className="hover:bg-white/60 transition">
                            <td className="py-3 px-4 flex items-center gap-2 text-gray-700">
                              <span
                                className="h-3 w-3 rounded-full border border-gray-300"
                                style={{
                                  backgroundColor: availableColorsList.find((c) => c.name === color)?.hex || "#000",
                                }}
                              />
                              {color}
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="number"
                                min="0"
                                value={sizeColorStock["Default"]?.[color] ?? ""}
                                onChange={(e) => handleStockChange("Default", color, e.target.value)}
                                placeholder="0 pcs"
                                className="w-32 rounded-lg border bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-black"
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* DESCRIPTION */}
        <section className="border-t pt-6">
          <h2 className="mb-5 text-xl font-bold">Description</h2>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={6}
            placeholder="Detailed product description..."
            className="w-full rounded-xl border p-4 outline-none focus:ring-2 focus:ring-black"
            required
          />
        </section>

        {/* SPECIFICATIONS */}
        <section className="border-t pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Product Specifications</h2>
            <button
              type="button"
              onClick={addSpecification}
              className="flex items-center gap-1 text-sm font-semibold bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
            >
              <Plus size={16} /> Add Specification
            </button>
          </div>
          <div className="space-y-3">
            {specifications.map((spec, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Key (e.g. Material)"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                  className="flex-1 rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 100% Cotton)"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                  className="flex-1 rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
                />
                {specifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
                  >
                    <Trash size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* PRICING & INVENTORY */}
        <section className="border-t pt-6">
          <h2 className="mb-5 text-xl font-bold">Pricing & Inventory</h2>
          
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="text-sm font-semibold flex items-center justify-between">
                <span>Regular Price</span>
                <span className="text-xs text-gray-400 font-normal">({currency.symbol})</span>
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
                placeholder="100"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold flex items-center justify-between">
                <span>Discount Price</span>
                <span className="text-xs text-gray-400 font-normal">({currency.symbol})</span>
              </label>
              <input
                type="number"
                name="discountPrice"
                value={form.discountPrice}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
                placeholder="80"
              />
              {discountPercentage > 0 && (
                <p className="mt-2 text-sm font-semibold text-green-600">
                  Save {discountPercentage}%
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold">Total Stock Quantity (Auto)</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black bg-gray-50 cursor-not-allowed"
                placeholder="0"
                readOnly
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold flex items-center gap-1"><Bell size={14}/> Low Stock Alert</label>
              <input
                type="number"
                name="lowStockThreshold"
                value={form.lowStockThreshold}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
                placeholder="5"
              />
            </div>

            {!form.isDigital && (
              <>
                <div>
                  <label className="text-sm font-semibold">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
                    placeholder="0.5"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 w-full hover:bg-gray-50">
                    <input
                      type="checkbox"
                      name="freeShipping"
                      checked={form.freeShipping}
                      onChange={handleChange}
                      className="h-4 w-4 rounded accent-black"
                    />
                    <span className="font-semibold text-sm">🚚 Free Shipping</span>
                  </label>
                </div>
              </>
            )}
          </div>
        </section>

        {/* SEO */}
        <section className="border-t pt-6">
          <div className="mb-5 flex items-center gap-2">
            <Globe size={22} />
            <h2 className="text-xl font-bold">SEO & Search Optimization</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <input
              name="metaTitle"
              value={form.metaTitle}
              onChange={handleChange}
              placeholder="SEO Meta Title"
              className="rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
            />
            <input
              name="metaDescription"
              value={form.metaDescription}
              onChange={handleChange}
              placeholder="SEO Meta Description"
              className="rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </section>

        {/* GALLERY */}
        <section className="border-t pt-6">
          <h2 className="mb-5 text-xl font-bold">Product Gallery</h2>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-10 transition hover:bg-gray-50">
            <Upload size={32} />
            <p className="font-semibold">Upload More Product Images</p>
            <p className="text-sm text-gray-500">Maximum 6 images total • 5MB each</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleNewImages}
              className="hidden"
            />
          </label>

          {(existingImages.length > 0 || newPreviews.length > 0) && (
            <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
              {/* Existing Images */}
              {existingImages.map((imgUrl, index) => (
                <div
                  key={`existing-${index}`}
                  className="group relative overflow-hidden rounded-2xl border bg-gray-100"
                >
                  <Image
                    src={imgUrl}
                    alt="existing product"
                    width={200}
                    height={200}
                    className="h-32 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white opacity-0 transition group-hover:opacity-100"
                    title="Remove Image"
                  >
                    <X size={16} />
                  </button>
                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">Existing</span>
                </div>
              ))}

              {/* New Previews */}
              {newPreviews.map((img, index) => (
                <div
                  key={`new-${index}`}
                  className="group relative overflow-hidden rounded-2xl border bg-gray-100"
                >
                  <Image
                    src={img}
                    alt="new preview"
                    width={200}
                    height={200}
                    className="h-32 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-black p-2 text-white opacity-0 transition group-hover:opacity-100"
                    title="Remove Image"
                  >
                    <X size={16} />
                  </button>
                  <span className="absolute bottom-1 left-1 rounded bg-green-600/80 px-1.5 py-0.5 text-[10px] text-white">New</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* TAGS */}
        <section className="border-t pt-6">
          <h2 className="mb-5 text-xl font-bold">Tags</h2>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="shirt, pant, mobile, laptop"
            className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
          />
          <p className="mt-2 text-sm text-gray-500">Separate tags using comma</p>
        </section>

        {/* STATUS */}
        <section className="border-t pt-6">
          <h2 className="mb-5 text-xl font-bold">Product Status</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 hover:bg-gray-50">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="h-4 w-4 rounded accent-black"
              />
              <span>⭐ Featured</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 hover:bg-gray-50">
              <input
                type="checkbox"
                name="isBestSeller"
                checked={form.isBestSeller}
                onChange={handleChange}
                className="h-4 w-4 rounded accent-black"
              />
              <span>🔥 Best Seller</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 hover:bg-gray-50">
              <input
                type="checkbox"
                name="isNewArrival"
                checked={form.isNewArrival}
                onChange={handleChange}
                className="app h-4 w-4 rounded accent-black"
              />
              <span>✨ New Arrival</span>
            </label>
          </div>
        </section>

        {/* SUBMIT */}
        <button
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-black py-4 font-bold text-white transition hover:scale-[1.01] disabled:opacity-50"
        >
          <Save size={18} />
          {loading ? "Updating Product..." : "Update Product"}
        </button>
      </form>
    </div>
  );
}
