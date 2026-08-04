"use client";

import {
  Save,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";
import { useCallback } from "react";

interface Props {
  title?: string;
  onSave?: () => void;
  saving?: boolean;
}

export default function ProductHeader({
  title = "Add New Product",
  onSave,
  saving = false
}: Props) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <div
      className="
        flex
        items-center
        justify-between
        border-b
        pb-5
        mb-6
      "
    >
      <div
        className="
          flex
          items-center
          gap-4
        "
      >
        <button
          type="button"
          onClick={handleBack}
          className="
            p-2
            rounded-lg
            border
            hover:bg-gray-100
            transition-colors
            flex
            items-center
            justify-center
          "
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1
            className="
              text-2xl
              font-bold
              text-gray-900
            "
          >
            {title}
          </h1>

          <p
            className="
              text-sm
              text-gray-500
            "
          >
            Create and manage your product
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="
          flex
          items-center
          gap-2
          bg-black
          text-white
          px-5
          py-2.5
          rounded-lg
          font-medium
          text-sm
          hover:bg-gray-800
          transition-colors
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      >
        {
          saving
            ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Saving...</span>
              </>
            )
            : (
              <>
                <Save size={18} />
                <span>Save Product</span>
              </>
            )
        }
      </button>
    </div>
  );
}
