"use client";

import {
  useState,
} from "react";

import {
  GripVertical,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

import {
  ProductMedia,
} from "@/types/media";

interface Props {
  images: ProductMedia[];
  onChange: (images: ProductMedia[]) => void;
}

export default function ImageSorter({
  images,
  onChange
}: Props) {
  const [
    dragIndex,
    setDragIndex
  ] = useState<number | null>(null);

  const [
    dragOverIndex,
    setDragOverIndex
  ] = useState<number | null>(null);

  const handleDragStart = (
    index: number
  ) => {
    setDragIndex(index);
  };

  const handleDragOver = (
    e: React.DragEvent,
    index: number
  ) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (
    index: number
  ) => {
    if (
      dragIndex === null
    ) return;

    const updated = [...images];

    const moved = updated.splice(
      dragIndex,
      1
    )[0];

    updated.splice(
      index,
      0,
      moved
    );

    onChange(updated);

    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const removeImage = (
    index: number
  ) => {
    const updated = images.filter(
      (_, i) => i !== index
    );

    onChange(updated);
  };

  if (!images || images.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50/50 space-y-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
          <ImageIcon size={24} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-900">No images to sort</p>
          <p className="text-xs text-gray-500">Upload images in the previous step to arrange their display order.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="font-semibold text-lg text-gray-900">
          Image Order
        </h3>
        <p className="text-xs text-gray-500">
          Drag and drop images to rearrange their display sequence on the store front.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {
          images.map(
            (image, index) => {
              const imageUrl = typeof image === "string" ? image : image.url;
              const isDragging = dragIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={`
                    border
                    rounded-2xl
                    p-3
                    cursor-grab
                    active:cursor-grabbing
                    space-y-3
                    bg-white
                    shadow-xs
                    transition-all
                    duration-200
                    relative
                    group
                    ${isDragging ? "opacity-40 border-dashed border-black scale-95" : "border-gray-200 hover:shadow-md"}
                    ${isDragOver && !isDragging ? "ring-2 ring-black border-transparent" : ""}
                  `}
                >
                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-gray-700 transition-colors">
                      <GripVertical size={16} />
                      <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
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
                      aria-label="Remove image"
                    >
                      <Trash2
                        size={16}
                      />
                    </button>
                  </div>

                  <div className="w-full h-36 bg-gray-100 rounded-xl overflow-hidden relative border border-gray-100">
                    <img
                      src={imageUrl}
                      alt={`Product thumbnail ${index + 1}`}
                      className="
                        w-full
                        h-full
                        object-cover
                        pointer-events-none
                      "
                    />
                  </div>
                </div>
              );
            }
          )
        }
      </div>
    </div>
  );
}
