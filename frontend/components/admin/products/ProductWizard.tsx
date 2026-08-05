"use client";

import {
  useCallback,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import {
  ProductFormProvider,
  useProductFormContext,
} from "@/context/ProductFormContext";

import {
  ProductWizardProvider,
  useProductWizard
} from "@/context/ProductWizardContext";

import {
  DEFAULT_PRODUCT_FORM
} from "@/constants/product";

import {
  createProduct,
  updateProduct,
} from "@/services/product.service";

import ProductProgress from "./ProductProgress";
import StepNavigation from "./StepNavigation";
import LivePreview from "./LivePreview";

import BasicInfoStep from "./steps/BasicInfoStep";
import MediaStep from "./steps/MediaStep";
import PricingStep from "./steps/PricingStep";
import VariantStep from "./steps/VariantStep";
import InventoryStep from "./steps/InventoryStep";
import ShippingStep from "./steps/ShippingStep";
import AttributeStep from "./steps/AttributeStep";
import SpecificationStep from "./steps/SpecificationStep";
import SeoStep from "./steps/SeoStep";
import ReviewStep from "./steps/ReviewStep";

const TOTAL_STEPS = 10;

function WizardContent() {
  const {
    currentStep
  } = useProductWizard();

  const pathname = usePathname();
  const router = useRouter();
  const { form } = useProductFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = pathname?.includes("/admin/products/edit/");

  const buildProductPayload = useCallback((productForm: typeof form) => {
    const data = new FormData();

    data.append("name", productForm.name || "");
    data.append("description", productForm.description || "");
    data.append("shortDescription", productForm.shortDescription || "");
    data.append("brand", productForm.brand || "");
    data.append("sku", productForm.sku || "");
    data.append("slug", productForm.slug || productForm.seo?.slug || "");
    data.append("category", productForm.subCategory || productForm.category || "");
    data.append("subCategory", productForm.subCategory || "");
    data.append("price", String(Number(productForm.pricing?.price ?? 0)));
    data.append("discountPrice", String(Number(productForm.pricing?.discountPrice ?? 0)));
    data.append("stock", String(Number(productForm.stock ?? 0)));
    data.append("lowStockThreshold", String(Number(productForm.lowStockThreshold ?? 0)));
    data.append("status", productForm.status || "draft");
    data.append("isDraft", String(Boolean(productForm.isDraft)));
    data.append("isFeatured", String(Boolean(productForm.flags?.isFeatured)));
    data.append("isBestSeller", String(Boolean(productForm.flags?.isBestSeller)));
    data.append("isNewArrival", String(Boolean(productForm.flags?.isNewArrival)));
    data.append("isFuture", String(Boolean(productForm.flags?.isFuture)));
    data.append("isDigital", String(Boolean(productForm.flags?.isDigital)));
    data.append("shippingClass", productForm.shippingClass || "standard");
    data.append("shipping", JSON.stringify(productForm.shipping || {}));
    data.append("seo", JSON.stringify(productForm.seo || {}));
    data.append("specifications", JSON.stringify(productForm.specifications || []));
    data.append("attributes", JSON.stringify(productForm.attributes || []));
    data.append("variants", JSON.stringify(productForm.variants || []));
    data.append("tags", JSON.stringify(productForm.tags || []));
    data.append("categoryFields", JSON.stringify(productForm.categoryFields || {}));

    if (productForm.images?.length) {
      data.append(
        "images",
        JSON.stringify(
          productForm.images
            .filter((image: any) => image?.url)
            .map((image: any) => ({
              url: image.url,
              public_id: image.publicId || image.public_id || "",
              alt: image.alt || "",
            }))
        )
      );
    }

    return data;
  }, [form]);

  const handleFinish = useCallback(async () => {
    if (isSubmitting) return false;

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to save this product.");
        return false;
      }

      const payload = buildProductPayload(form);
      const productId = pathname?.split("/").filter(Boolean).pop();

      const response = isEditMode && productId
        ? await updateProduct(productId, payload, token)
        : await createProduct(payload, token);

      if (response?.success || response?.product || response?.message) {
        toast.success(isEditMode ? "Product updated successfully!" : "Product created successfully!");
        router.push("/admin/products");
        return true;
      }

      throw new Error("Unable to save product.");
    } catch (error) {
      console.error(error);
      toast.error(isEditMode ? "Failed to update product." : "Failed to create product.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [buildProductPayload, form, isEditMode, isSubmitting, pathname, router]);

  const steps = [
    <BasicInfoStep key="basic" />,
    <MediaStep key="media" />,
    <PricingStep key="pricing" />,
    <VariantStep key="variant" />,
    <InventoryStep key="inventory" />,
    <ShippingStep key="shipping" />,
    <AttributeStep key="attribute" />,
    <SpecificationStep key="specification" />,
    <SeoStep key="seo" />,
    <ReviewStep key="review" />,
  ];

  return (
    <div
      className="
        grid
        grid-cols-1
        lg:grid-cols-12
        gap-6
        w-full
      "
    >
      <div
        className="
          lg:col-span-3
        "
      >
        <ProductProgress />
      </div>

      <div
        className="
          lg:col-span-6
          flex
          flex-col
          justify-between
        "
      >
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-4">
          {
            steps[currentStep - 1]
          }
        </div>

        <StepNavigation
          totalSteps={TOTAL_STEPS}
          onFinish={handleFinish}
          isNextDisabled={isSubmitting}
        />
      </div>

      <div
        className="
          lg:col-span-3
        "
      >
        <LivePreview />
      </div>
    </div>
  );
}

export default function ProductWizard({
  initialData = DEFAULT_PRODUCT_FORM
}: {
  initialData?: typeof DEFAULT_PRODUCT_FORM
}) {
  return (
    <ProductFormProvider
      initialData={initialData}
    >
      <ProductWizardProvider
        totalSteps={TOTAL_STEPS}
        initialStep={initialData.currentStep || 1}
      >
        <WizardContent />
      </ProductWizardProvider>
    </ProductFormProvider>
  );
}
