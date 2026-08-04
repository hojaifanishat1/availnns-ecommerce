"use client";

import {
  useEffect,
} from "react";
import {
  AlertTriangle,
  X,
} from "lucide-react";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DiscardChangesDialog({
  open,
  onConfirm,
  onCancel
}: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
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
  }, [open, onCancel]);

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
      onClick={onCancel}
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
              <AlertTriangle size={20} />
            </div>
            <h2
              className="
                text-lg
                font-bold
                text-gray-900
              "
            >
              Discard Changes?
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
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
          You have unsaved changes. If you leave now, all modifications will be permanently lost.
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
            onClick={onCancel}
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
            Keep Editing
          </button>

          <button
            type="button"
            onClick={onConfirm}
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
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
}
