"use client";

import {
  Trash2,
  Star,
  Image as ImageIcon,
} from "lucide-react";

interface MediaItem {
  url: string;
  isPrimary?: boolean;
  [key: string]: unknown;
}

interface Props {
  images: MediaItem[];
  onDelete: (index: number) => void;
  onPrimary: (index: number) => void;
}

export default function MediaGallery({
  images,
  onDelete,
  onPrimary
}: Props) {
  if (!images || images.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50/50 space-y-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
          <ImageIcon size={24} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-900">No media uploaded</p>
          <p className="text-xs text-gray-500">Upload product images above to start building your gallery.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
        gap-4
      "
    >
      {
        images.map(
          (image, index) => (
            <div
              key={index}
              className="
                relative
                border
                border-gray-200
                rounded-2xl
                overflow-hidden
                bg-white
                shadow-xs
                group
                transition-all
                hover:shadow-md
              "
            >
              <div className="w-full h-40 bg-gray-100 overflow-hidden relative">
                <img
                  src={image.url}
                  alt={`Product media ${index + 1}`}
                  className="
                    w-full
                    h-full
                    object-cover
                    transition-transform
                    duration-300
                    group-hover:scale-105
                  "
                />

                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Star size={10} className="fill-current text-amber-400" />
                    Primary
                  </div>
                )}
              </div>

              <div className="p-3 flex items-center justify-between bg-white border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => onPrimary(index)}
                  className={`
                    text-xs
                    px-3
                    py-1.5
                    rounded-lg
                    font-medium
                    flex
                    items-center
                    gap-1.5
                    transition-colors
                    ${
                      image.isPrimary
                        ? "bg-black text-white shadow-xs"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }
                  `}
                >
                  <Star size={12} className={image.isPrimary ? "fill-current text-amber-400" : ""} />
                  {
                    image.isPrimary
                      ? "Primary"
                      : "Set Primary"
                  }
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(index)}
                  className="
                    p-1.5
                    text-red-500
                    hover:bg-red-50
                    rounded-lg
                    transition-colors
                    border
                    border-transparent
                    hover:border-red-100
                  "
                  aria-label="Delete image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        )
      }
    </div>
  );
}
