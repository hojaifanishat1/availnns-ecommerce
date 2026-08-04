"use client";

import {
  useRef,
} from "react";

import SectionCard
from "../shared/SectionCard";

import {
  Upload,
  X,
  Star,
  Loader2,
} from "lucide-react";

import {
  useProductFormContext,
} from "@/context/ProductFormContext";

import useImageUpload
from "@/hooks/useImageUpload";

interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
  order?: number;
}

export default function MediaStep() {
  const {
    form,
    updateField
  } = useProductFormContext();

  const inputRef =
    useRef<HTMLInputElement | null>(null);

  const {
    uploadImage,
    uploading,
    progress
  } = useImageUpload();

  const images: ProductImage[] = form.images || [];

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;

    if (!files || files.length === 0)
      return;

    const uploadedImages: ProductImage[] = [
      ...images
    ];

    for (
      const file of Array.from(files)
    ) {
      const image = await uploadImage(file);

      if (image && image.url) {
        uploadedImages.push({
          ...image,
          isPrimary: uploadedImages.length === 0,
          order: uploadedImages.length
        });
      }
    }

    updateField(
      "images",
      uploadedImages
    );

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter(
      (_, i: number) => i !== index
    );

    // If we removed the primary image and there are still images left, make the first one primary
    if (images[index]?.isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }

    updateField(
      "images",
      updatedImages
    );
  };

  const makePrimary = (index: number) => {
    const updatedImages = images.map(
      (image: ProductImage, i: number) => ({
        ...image,
        isPrimary: i === index
      })
    );

    updateField(
      "images",
      updatedImages
    );
  };

  return (
    <div
      className="
        space-y-6
      "
    >
      <SectionCard
        title="Product Media"
        description="Upload high-quality product images. Set a primary image to display in listings."
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="
              flex
              items-center
              gap-2
              bg-black
              text-white
              px-4
              py-2.5
              rounded-lg
              text-sm
              font-medium
              hover:bg-gray-800
              transition-colors
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Upload Images</span>
              </>
            )}
          </button>

          {uploading && (
            <div className="flex items-center gap-3 text-sm text-gray-600 w-full sm:w-auto">
              <div className="w-full sm:w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-black h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="font-medium">{progress}%</span>
            </div>
          )}
        </div>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            gap-4
            mt-5
          "
        >
          {images.length > 0 ? (
            images.map(
              (image: ProductImage, index: number) => (
                <div
                  key={index}
                  className="
                    relative
                    border
                    rounded-xl
                    overflow-hidden
                    group
                    bg-gray-50
                    aspect-square
                    flex
                    items-center
                    justify-center
                  "
                >
                  <img
                    src={image.url}
                    alt={image.alt || `Product image ${index + 1}`}
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="
                      absolute
                      top-2
                      right-2
                      bg-white/90
                      hover:bg-white
                      text-red-500
                      rounded-full
                      p-1.5
                      shadow-sm
                      transition-colors
                    "
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => makePrimary(index)}
                    className={`
                      absolute
                      bottom-2
                      left-2
                      px-2.5
                      py-1
                      rounded-lg
                      text-xs
                      font-medium
                      flex
                      items-center
                      gap-1.5
                      shadow-sm
                      transition-colors
                      ${
                        image.isPrimary
                          ? "bg-black text-white"
                          : "bg-white/90 text-gray-700 hover:bg-white"
                      }
                    `}
                  >
                    <Star size={12} className={image.isPrimary ? "fill-white" : ""} />
                    {
                      image.isPrimary
                        ? "Primary"
                        : "Set Primary"
                    }
                  </button>
                </div>
              )
            )
          ) : (
            <div className="col-span-full text-center py-12 border-2 border-dashed rounded-xl bg-gray-50/50 text-gray-500 text-sm">
              No images uploaded yet. Click &quot;Upload Images&quot; to add product photos.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
