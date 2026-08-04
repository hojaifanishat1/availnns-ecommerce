import {
  Loader2,
} from "lucide-react";

interface Props {
  show: boolean;
  message?: string;
}

export default function LoadingOverlay({
  show,
  message = "Loading..."
}: Props) {
  if (!show)
    return null;

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/40
        backdrop-blur-xs
        flex
        items-center
        justify-center
        z-50
        transition-opacity
      "
    >
      <div
        className="
          bg-white
          rounded-2xl
          shadow-2xl
          px-8
          py-6
          flex
          items-center
          gap-4
          border
        "
      >
        <Loader2
          size={24}
          className="
            animate-spin
            text-black
          "
        />
        <span
          className="
            font-medium
            text-gray-900
            text-sm
          "
        >
          {message}
        </span>
      </div>
    </div>
  );
}
