"use client";

import {
  useState,
  useEffect,
} from "react";

import {
  X,
  ZoomIn,
  Crop,
} from "lucide-react";

interface Props {
  open: boolean;
  image?: string;
  onClose: () => void;
  onCrop: (
    image: string
  ) => void;
}

export default function ImageCropModal({
  open,
  image,
  onClose,
  onCrop
}: Props) {
  const [
    zoom,
    setZoom
  ] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      setZoom(1);
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !image)
    return null;

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/75
        backdrop-blur-xs
        flex
        items-center
        justify-center
        z-50
        p-4
        transition-opacity
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white
          rounded-2xl
          p-6
          w-full
          max-w-lg
          space-y-6
          relative
          shadow-2xl
          border
        "
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Crop size={18} className="text-gray-700" />
            </div>
            <h2
              className="
                font-bold
                text-lg
                text-gray-900
              "
            >
              Crop Image
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              text-gray-400
              hover:text-gray-700
              p-1.5
              rounded-full
              hover:bg-gray-100
              transition-colors
            "
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="
            overflow-hidden
            rounded-xl
            border
            border-gray-200
            bg-gray-50
            h-80
            flex
            items-center
            justify-center
            relative
            shadow-inner
          "
        >
          <img
            src={image}
            alt="Crop preview"
            style={{
              transform: `scale(${zoom})`
            }}
            className="
              max-h-full
              max-w-full
              object-contain
              transition-transform
              duration-150
            "
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-gray-600">
            <span className="flex items-center gap-1.5">
              <ZoomIn size={14} />
              Zoom Level
            </span>
            <span>{zoom.toFixed(1)}x</span>
          </div>

          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) =>
              setZoom(
                Number(e.target.value)
              )
            }
            className="
              w-full
              accent-black
              cursor-pointer
            "
          />
        </div>

        <div
          className="
            flex
            justify-end
            gap-3
            pt-2
          "
        >
          <button
            type="button"
            onClick={onClose}
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
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onCrop(image);
              onClose();
            }}
            className="
              bg-black
              hover:bg-gray-800
              text-white
              px-5
              py-2.5
              rounded-xl
              text-sm
              font-medium
              transition-colors
              shadow-xs
            "
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}
