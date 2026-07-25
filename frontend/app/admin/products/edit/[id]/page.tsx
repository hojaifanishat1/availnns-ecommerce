"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";
import Image from "next/image";
import {
  Save,
  X,
  Upload,
  Loader2,
  Package,
  ChevronLeft,
  Layers,
  Palette,
  Globe,
  Plus,
  Trash,
  Bell,
  Smartphone,
  Tablet,
  Laptop as LaptopIcon,
  Shirt,
  Scissors,
  Watch,
  Crown,
  Footprints,
  Glasses,
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

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const AVAILABLE_SHOE_SIZES = ["6", "7", "8", "9", "10", "11", "12", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10"];
const AVAILABLE_PANT_SIZES = ["28", "30", "32", "34", "36", "38", "40", "42"];
const AVAILABLE_UNDERWEAR_SIZES = ["S", "M", "L", "XL", "XXL"];
const AVAILABLE_COLORS = [
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
  const id = params.id as string;
  const { currency } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [oldImages, setOldImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  
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
    
    // Individual Category Specific Fields
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

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ]);

  const selectedCategoryObj = categories.find((cat) => cat._id === form.category);
  const categoryName = selectedCategoryObj?.name?.toLowerCase() || "";

  // Distinct Individual Category Identifiers
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

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
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

  useEffect(() => {
    const init = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          getProductById(id),
          getAdminCategories(localStorage.getItem("token") || "")
        ]);
        
        const product = prodRes.product || prodRes;
        setForm({
          name: product.name || "", 
          description: product.description || "", 
          brand: product.brand || "",
          sku: product.sku || "", 
          price: String(product.price || ""), 
          discountPrice: String(product.discountPrice || ""),
          discountStartDate: product.discountStartDate ? product.discountStartDate.split("T")[0] : "",
          discountEndDate: product.discountEndDate ? product.discountEndDate.split("T")[0] : "",
          stock: String(product.stock || ""), 
          lowStockThreshold: String(product.lowStockThreshold || "5"),
          category: typeof product.category === "object" ? product.category._id : product.category || "",
          tags: Array.isArray(product.tags) ? product.tags.join(", ") : "", 
          weight: String(product.weight || ""),
          isDigital: product.isDigital || false,
          freeShipping: product.freeShipping || false,
          metaTitle: product.metaTitle || "",
          metaDescription: product.metaDescription || "",
          
          warrantyPeriod: product.warrantyPeriod || "",
          storageCapacity: product.storageCapacity || "",
          ramSize: product.ramSize || "",
          screenSize: product.screenSize || "",
          processorType: product.processorType || "",
          fabricType: product.fabricType || "",
          fitType: product.fitType || "",
          waistRise: product.waistRise || "",
          material: product.material || "",
          strapType: product.strapType || "",
          soleMaterial: product.soleMaterial || "",
          capStyle: product.capStyle || "",

          isFeatured: product.isFeatured || false,
          isBestSeller: product.isBestSeller || false, 
          isNewArrival: product.isNewArrival || false,
        });
        
        setOldImages(product.images || []);
        setSelectedSizes(product.sizes || []);
        setSelectedColors(product.colors || []);
        if (product.specifications && product.specifications.length > 0) {
          setSpecifications(product.specifications);
        }
        setCategories(catRes);
      } catch (err) {
        toast.error("Failed to load product data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  useEffect(() => {
    const urls = newImages.map((file) => URL.createObjectURL(file));
    setPreviewImages(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImages]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ 
        ...prev, 
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setNewImages((prev) => [...prev, ...validFiles]);
  };

  const removeOldImage = (index: number) => {
    setOldImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "tags") {
          const tags = String(value)
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
          data.append("tags", JSON.stringify(tags));
        } else {
          data.append(key, String(value));
        }
      });

      data.append("sizes", JSON.stringify(selectedSizes));
      data.append("colors", JSON.stringify(selectedColors));
      data.append("specifications", JSON.stringify(specifications.filter(s => s.key && s.value)));
      data.append("oldImages", JSON.stringify(oldImages));
      
      newImages.forEach(file => data.append("images", file));

      await updateProduct(id, data, localStorage.getItem("token") || "");
      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-black" size={32} /></div>;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-xl border hover:bg-gray-50"><ChevronLeft /></button>
        <div>
          <h1 className="text-3xl font-black">Edit Product</h1>
          <p className="mt-1 text-gray-500">Modify professional item attributes and specifications</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl bg-white p-8 shadow-xl border border-gray-100">
        
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
            <Input label="Product Name" name="name" value={form.name} onChange={handleChange} required />
            <Input label="Brand Name" name="brand" value={form.brand} onChange={handleChange} />
            <Input label="SKU (Stock Keeping Unit)" name="sku" value={form.sku} onChange={handleChange} />
            <div>
              <label className="text-sm font-semibold text-gray-600">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-black bg-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 1. MOBILE SPECIFICATIONS */}
        {isMobile && (
          <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
              <Smartphone size={20} /> Mobile Specific Attributes
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">Storage Capacity</label>
                <input type="text" name="storageCapacity" value={form.storageCapacity} onChange={handleChange} placeholder="e.g. 128GB / 256GB" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">RAM Size</label>
                <input type="text" name="ramSize" value={form.ramSize} onChange={handleChange} placeholder="e.g. 8GB / 12GB" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Warranty</label>
                <input type="text" name="warrantyPeriod" value={form.warrantyPeriod} onChange={handleChange} placeholder="e.g. 1 Year Official Warranty" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
              </div>
            </div>
          </section>
        )}

        {/* 2. IPAD / TABLET SPECIFICATIONS */}
        {isIpad && (
          <section className="rounded-2xl border border-sky-100 bg-sky-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-sky-600 font-bold text-lg">
              <Tablet size={20} /> iPad & Tablet Attributes
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-gray-700">Storage Capacity</label>
                <input type="text" name="storageCapacity" value={form.storageCapacity} onChange={handleChange} placeholder="e.g. 64GB / 256GB Wi-Fi" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Screen Size</label>
                <input type="text" name="screenSize" value={form.screenSize} onChange={handleChange} placeholder="e.g. 11-inch Liquid Retina" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
              </div>
            </div>
          </section>
        )}

        {/* 3. LAPTOP SPECIFICATIONS */}
        {isLaptop && (
          <section className="rounded-2xl border border-cyan-100 bg-cyan-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-cyan-700 font-bold text-lg">
              <LaptopIcon size={20} /> Laptop Attributes
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">Processor</label>
                <input type="text" name="processorType" value={form.processorType} onChange={handleChange} placeholder="e.g. Apple M3 / Intel Core i7" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">RAM & Storage</label>
                <input type="text" name="storageCapacity" value={form.storageCapacity} onChange={handleChange} placeholder="e.g. 16GB RAM / 512GB SSD" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Warranty</label>
                <input type="text" name="warrantyPeriod" value={form.warrantyPeriod} onChange={handleChange} placeholder="e.g. 2 Years International Warranty" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
              </div>
            </div>
          </section>
        )}

        {/* 4. SHIRT SPECIFICATIONS */}
        {isShirt && (
          <section className="rounded-2xl border border-rose-100 bg-rose-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-lg">
              <Shirt size={20} /> Shirt Attributes
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-gray-700">Fabric Type</label>
                <input type="text" name="fabricType" value={form.fabricType} onChange={handleChange} placeholder="e.g. Oxford Cotton / Linen" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Fit Type</label>
                <input type="text" name="fitType" value={form.fitType} onChange={handleChange} placeholder="e.g. Tailored Fit / Regular Fit" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
              </div>
            </div>
          </section>
        )}

        {/* 5. T-SHIRT SPECIFICATIONS */}
        {isTShirt && (
          <section className="rounded-2xl border border-pink-100 bg-pink-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-pink-600 font-bold text-lg">
              <Shirt size={20} /> T-Shirt Attributes
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-gray-700">Fabric Quality</label>
                <input type="text" name="fabricType" value={form.fabricType} onChange={handleChange} placeholder="e.g. 100% Combed Cotton 180GSM" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Fit Type</label>
                <input type="text" name="fitType" value={form.fitType} onChange={handleChange} placeholder="e.g. Oversized / Regular Fit" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
              </div>
            </div>
          </section>
        )}

        {/* 6. PANT SPECIFICATIONS */}
        {isPant && (
          <section className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
              <Scissors size={20} /> Pant & Trouser Attributes
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-gray-700">Fabric Type</label>
                <input type="text" name="fabricType" value={form.fabricType} onChange={handleChange} placeholder="e.g. Stretch Denim / Twill Cotton" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Waist Rise</label>
                <input type="text" name="waistRise" value={form.waistRise} onChange={handleChange} placeholder="e.g. Mid Rise / Slim Tapered" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
              </div>
            </div>
          </section>
        )}

        {/* 7. UNDERWEAR SPECIFICATIONS */}
        {isUnderwear && (
          <section className="rounded-2xl border border-orange-100 bg-orange-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-orange-600 font-bold text-lg">
              <Package size={20} /> Underwear / Innerwear Attributes
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Fabric Composition</label>
              <input type="text" name="fabricType" value={form.fabricType} onChange={handleChange} placeholder="e.g. Modal Cotton / Breathable Spandex" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
            </div>
          </section>
        )}

        {/* 8. WATCH SPECIFICATIONS */}
        {isWatch && (
          <section className="rounded-2xl border border-purple-100 bg-purple-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-purple-600 font-bold text-lg">
              <Watch size={20} /> Watch Attributes
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-gray-700">Strap Type</label>
                <input type="text" name="strapType" value={form.strapType} onChange={handleChange} placeholder="e.g. Stainless Steel / Silicone Band" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Material / Build</label>
                <input type="text" name="material" value={form.material} onChange={handleChange} placeholder="e.g. Sapphire Crystal / Alloy Case" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
              </div>
            </div>
          </section>
        )}

        {/* 9. CAP SPECIFICATIONS */}
        {isCap && (
          <section className="rounded-2xl border border-teal-100 bg-teal-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-teal-600 font-bold text-lg">
              <Crown size={20} /> Cap & Hat Attributes
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Cap Style / Material</label>
              <input type="text" name="capStyle" value={form.capStyle} onChange={handleChange} placeholder="e.g. Snapback / Curved Brim Cotton" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
            </div>
          </section>
        )}

        {/* 10. SHOES SPECIFICATIONS */}
        {isShoes && (
          <section className="rounded-2xl border border-amber-100 bg-amber-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-lg">
              <Footprints size={20} /> Shoes & Footwear Attributes
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Sole Material / Cushioning</label>
              <input type="text" name="soleMaterial" value={form.soleMaterial} onChange={handleChange} placeholder="e.g. Phylon Rubber Sole / Air Cushion" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
            </div>
          </section>
        )}

        {/* 11. ACCESSORIES SPECIFICATIONS */}
        {isAccessories && (
          <section className="rounded-2xl border border-violet-100 bg-violet-50/40 p-6 space-y-6">
            <div className="flex items-center gap-2 text-violet-600 font-bold text-lg">
              <Glasses size={20} /> General Accessories Attributes
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Primary Material</label>
              <input type="text" name="material" value={form.material} onChange={handleChange} placeholder="e.g. Titanium / Premium Leather" className="mt-2 w-full rounded-xl border p-3 outline-none bg-white" />
            </div>
          </section>
        )}

        {/* VARIANTS (SIZES & COLORS) - Hidden if Digital */}
        {!form.isDigital && (
          <section className="border-t pt-6">
            <div className="grid gap-8 md:grid-cols-2">
              
              {/* SIZES: Hide for Mobile, iPad, Laptop, Watch, Accessories */}
              {!isMobile && !isIpad && !isLaptop && !isWatch && !isAccessories && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers size={18} />
                      <h3 className="text-lg font-bold">
                        {isPant ? "Pant Waist Sizes" : isShoes ? "Shoe Sizes" : isUnderwear ? "Underwear Sizes" : "Available Sizes"}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {(isPant ? AVAILABLE_PANT_SIZES : isShoes ? AVAILABLE_SHOE_SIZES : isUnderwear ? AVAILABLE_UNDERWEAR_SIZES : AVAILABLE_SIZES).map((size) => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <button
                          type="button"
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                            isSelected
                              ? "bg-black text-white border-black"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* COLORS: Show for all physical products */}
              <div className={isMobile || isIpad || isLaptop || isWatch || isAccessories ? "md:col-span-2" : ""}>
                <div className="mb-3 flex items-center gap-2">
                  <Palette size={18} />
                  <h3 className="text-lg font-bold">Available Colors</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((col) => {
                    const isSelected = selectedColors.includes(col.name);
                    return (
                      <button
                        type="button"
                        key={col.name}
                        onClick={() => toggleColor(col.name)}
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                          isSelected
                            ? "bg-black text-white border-black"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: col.hex }}
                        />
                        {col.name}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
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
                  placeholder="Key (e.g. Model / Material)"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                  className="flex-1 rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. Pro / Cotton)"
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
              <label className="text-sm font-semibold">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
                placeholder="50"
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
            <Input label="SEO Meta Title" name="metaTitle" value={form.metaTitle} onChange={handleChange} />
            <Input label="SEO Meta Description" name="metaDescription" value={form.metaDescription} onChange={handleChange} />
          </div>
        </section>

        {/* EXISTING & NEW GALLERY IMAGES */}
        <section className="border-t pt-6">
          <h2 className="mb-5 text-xl font-bold">Product Gallery</h2>
          
          {oldImages.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-500 mb-3">Existing Images</p>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
                {oldImages.map((imgObj, index) => {
                  const imgUrl = typeof imgObj === "string" ? imgObj : imgObj.url;
                  return (
                    <div key={index} className="group relative overflow-hidden rounded-2xl border bg-gray-100">
                      <Image
                        src={imgUrl}
                        alt="existing"
                        width={200}
                        height={200}
                        className="h-32 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeOldImage(index)}
                        className="absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white opacity-0 transition group-hover:opacity-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-10 transition hover:bg-gray-50">
            <Upload size={32} />
            <p className="font-semibold">Upload New Product Images</p>
            <p className="text-sm text-gray-500">Maximum 5MB each</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImages}
              className="hidden"
            />
          </label>

          {previewImages.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-500 mb-3">New Previews</p>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
                {previewImages.map((img, index) => (
                  <div key={img} className="group relative overflow-hidden rounded-2xl border bg-gray-100">
                    <Image
                      src={img}
                      alt="preview"
                      width={200}
                      height={200}
                      className="h-32 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-black p-2 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
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
              <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="h-4 w-4 rounded accent-black" />
              <span>⭐ Featured</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 hover:bg-gray-50">
              <input type="checkbox" name="isBestSeller" checked={form.isBestSeller} onChange={handleChange} className="h-4 w-4 rounded accent-black" />
              <span>🔥 Best Seller</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 hover:bg-gray-50">
              <input type="checkbox" name="isNewArrival" checked={form.isNewArrival} onChange={handleChange} className="h-4 w-4 rounded accent-black" />
              <span>✨ New Arrival</span>
            </label>
          </div>
        </section>

        {/* SUBMIT BUTTONS */}
        <div className="flex items-center justify-end gap-3 border-t pt-6">
          <button type="button" onClick={() => router.back()} className="px-6 py-4 rounded-2xl border hover:bg-gray-50 font-semibold">Cancel</button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-black font-bold text-white transition hover:scale-[1.01] disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>

      </form>
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-600">{label}</label>
      <input {...props} className="mt-1 w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-black" />
    </div>
  );
}
