"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import ProductWizard from "@/components/admin/products/ProductWizard";
import { getProductById } from "@/services/product.service";

import {
  DEFAULT_PRODUCT_FORM
} from "@/constants/product";

import {
  ProductForm
} from "@/types/productForm";

import {
  FileEdit,
  Loader2,
  PackageX,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function EditProductPage() {
  const params = useParams();
  
  // Safely extract ID from route params
  const rawId = params?.id;
  const id = useMemo(() => {
    if (!rawId) return undefined;
    return typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : undefined;
  }, [rawId]);

  const [
    product,
    setProduct
  ] = useState<ProductForm | null>(null);

  const [
    loading,
    setLoading
  ] = useState(true);

  const normalizedProduct = useMemo(() => {
    if (!product) return null;

    const categoryObject = (product as any)?.category;
    const categoryId = typeof categoryObject === "object" && categoryObject !== null
      ? categoryObject._id || ""
      : categoryObject || "";

    const parentCategoryId = typeof categoryObject === "object" && categoryObject !== null
      ? (typeof categoryObject.parent === "string"
        ? categoryObject.parent
        : categoryObject.parent?._id || "")
      : "";

    const subCategoryValue = typeof (product as any)?.subCategory === "object" && (product as any)?.subCategory !== null
      ? (product as any).subCategory._id || ""
      : (product as any)?.subCategory || "";

    return {
      ...product,
      category: parentCategoryId || categoryId,
      subCategory: subCategoryValue || (parentCategoryId ? categoryId : ""),
    };
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getProductById(id);
        const productData = data?.product || data;

        if (!productData || typeof productData !== "object") {
          setProduct(DEFAULT_PRODUCT_FORM);
          return;
        }

        const categoryObject = productData?.category;
        const categoryId = typeof categoryObject === "object" && categoryObject !== null
          ? categoryObject._id || ""
          : categoryObject || "";
        const parentCategoryId = typeof categoryObject === "object" && categoryObject !== null
          ? (typeof categoryObject.parent === "string"
            ? categoryObject.parent
            : categoryObject.parent?._id || "")
          : "";

        const normalizedProduct = {
          ...DEFAULT_PRODUCT_FORM,
          ...productData,
          name: productData?.name || "",
          description: productData?.description || "",
          brand: productData?.brand || "",
          sku: productData?.sku || "",
          slug: productData?.slug || "",
          category: parentCategoryId || categoryId || DEFAULT_PRODUCT_FORM.category,
          subCategory: parentCategoryId ? categoryId : (productData?.subCategory?._id || productData?.subCategory || ""),
          pricing: {
            ...DEFAULT_PRODUCT_FORM.pricing,
            ...(productData?.pricing || {}),
            price: Number(productData?.price ?? productData?.pricing?.price ?? DEFAULT_PRODUCT_FORM.pricing.price),
            discountPrice: Number(productData?.discountPrice ?? productData?.pricing?.discountPrice ?? DEFAULT_PRODUCT_FORM.pricing.discountPrice ?? 0),
            currency: productData?.pricing?.currency || DEFAULT_PRODUCT_FORM.pricing.currency,
          },
          stock: Number(productData?.stock ?? 0),
          lowStockThreshold: Number(productData?.lowStockThreshold ?? DEFAULT_PRODUCT_FORM.lowStockThreshold),
          shipping: {
            ...DEFAULT_PRODUCT_FORM.shipping,
            ...(productData?.shipping || {}),
            weight: {
              ...DEFAULT_PRODUCT_FORM.shipping.weight,
              ...(productData?.shipping?.weight || {}),
            },
            dimensions: {
              ...DEFAULT_PRODUCT_FORM.shipping.dimensions,
              ...(productData?.shipping?.dimensions || {}),
            },
          },
          seo: {
            ...DEFAULT_PRODUCT_FORM.seo,
            ...(productData?.seo || {}),
            metaTitle: productData?.metaTitle || productData?.seo?.metaTitle || "",
            metaDescription: productData?.metaDescription || productData?.seo?.metaDescription || "",
            slug: productData?.slug || productData?.seo?.slug || "",
          },
          images: Array.isArray(productData?.images) ? productData.images : [],
          variants: Array.isArray(productData?.variants) ? productData.variants : [],
          specifications: Array.isArray(productData?.specifications) ? productData.specifications : [],
          attributes: Array.isArray(productData?.attributes) ? productData.attributes : [],
          tags: Array.isArray(productData?.tags) ? productData.tags : [],
          flags: {
            ...DEFAULT_PRODUCT_FORM.flags,
            ...(productData?.flags || {}),
            isFeatured: Boolean(productData?.isFeatured ?? productData?.flags?.isFeatured ?? false),
            isBestSeller: Boolean(productData?.isBestSeller ?? productData?.flags?.isBestSeller ?? false),
            isNewArrival: Boolean(productData?.isNewArrival ?? productData?.flags?.isNewArrival ?? false),
            isDigital: Boolean(productData?.isDigital ?? productData?.flags?.isDigital ?? false),
          },
          status: productData?.status || productData?.isPublished ? "published" : "draft",
          isDraft: productData?.isDraft ?? !productData?.isPublished,
          completedSteps: Array.isArray(productData?.completedSteps) ? productData.completedSteps : [],
          currentStep: Number(productData?.currentStep ?? 1),
        } as ProductForm;

        setProduct(normalizedProduct);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setProduct(DEFAULT_PRODUCT_FORM);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-black">
          <Loader2 size={24} className="animate-spin" />
        </div>
        <p className="text-sm font-semibold text-gray-700">Loading product details...</p>
      </div>
    );
  }

  if (!normalizedProduct) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 text-center py-20">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <PackageX size={28} />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">Product Not Found</h2>
          <p className="text-sm text-gray-500">The product you are trying to edit does not exist or has been removed.</p>
        </div>
        <div>
          <Link
            href="/admin/products"
            className="
              inline-flex
              items-center
              gap-2
              bg-black
              text-white
              px-4
              py-2.5
              rounded-xl
              text-sm
              font-medium
              transition-colors
              hover:bg-gray-800
            "
          >
            <ArrowLeft size={16} />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-black text-white rounded-xl shadow-xs">
              <FileEdit size={22} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Edit Product
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Update product information, inventory variants, attributes, media, and SEO settings.
          </p>
        </div>

        <div>
          <Link
            href="/admin/products"
            className="
              border
              border-gray-200
              hover:bg-gray-50
              text-gray-700
              px-4
              py-2.5
              rounded-xl
              text-sm
              font-medium
              transition-colors
              flex
              items-center
              gap-2
            "
          >
            <ArrowLeft size={16} />
            <span>Cancel</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <ProductWizard initialData={normalizedProduct} />
      </div>
    </div>
  );
}
