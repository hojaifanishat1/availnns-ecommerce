"use client";

import {
  X,
} from "lucide-react";
import {
  useEffect,
} from "react";

interface Props {
  open: boolean;
  image?: string;
  onClose: () => void;
}

export default function ImagePreviewModal({
  open,
  image,
  onClose
}: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (open) {
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
          p-5
          rounded-2xl
          max-w-4xl
          w-full
          relative
          shadow-2xl
          border
          space-y-4
          flex
          flex-col
          items-center
        "
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            top-4
            right-4
            bg-gray-100
            hover:bg-gray-200
            text-gray-700
            rounded-full
            p-2
            transition-colors
            z-10
          "
          aria-label="Close preview"
        >
          <X size={18} />
        </button>

        <div className="w-full flex items-center justify-center overflow-hidden rounded-xl bg-gray-50 border">
          <img
            src={image}
            alt="Preview"
            className="
              max-h-[75vh]
              w-auto
              object-contain
              rounded-lg
            "
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="
            w-full
            bg-black
            text-white
            py-2.5
            rounded-xl
            font-medium
            text-sm
            hover:bg-gray-800
            transition-colors
          "
        >
          Close Preview
        </button>
      </div>
    </div>
  );
}
