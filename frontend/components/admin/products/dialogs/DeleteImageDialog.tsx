"use client";

import {
  useEffect,
} from "react";
import {
  Trash2,
  X,
} from "lucide-react";

interface Props {
  open: boolean;
  onDelete: () => void;
  onClose: () => void;
}

export default function DeleteImageDialog({
  open,
  onDelete,
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

  if (!open)
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
          max-w-md
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
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <Trash2 size={20} />
            </div>
            <h2
              className="
                font-bold
                text-lg
                text-gray-900
              "
            >
              Delete Image?
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

        <p
          className="
            text-sm
            text-gray-600
            leading-relaxed
          "
        >
          This image will be removed permanently from the media gallery and cannot be recovered.
        </p>

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
              onDelete();
              onClose();
            }}
            className="
              bg-red-600
              hover:bg-red-700
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
            Delete Image
          </button>
        </div>
      </div>
    </div>
  );
}
