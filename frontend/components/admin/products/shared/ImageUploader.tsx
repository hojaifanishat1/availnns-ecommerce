"use client";

import {
  useRef,
} from "react";

import useImageUpload from "@/hooks/useImageUpload";
import { Upload, Loader2 } from "lucide-react";

interface UploadedImage {
  url: string;
  alt?: string;
  [key: string]: unknown;
}

interface Props {
  onUpload: (
    image: UploadedImage
  ) => void;
}

export default function ImageUploader({
  onUpload
}: Props) {
  const inputRef =
    useRef<HTMLInputElement | null>(null);

  const {
    uploadImage,
    uploading,
    progress,
    error
  } = useImageUpload();

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file)
      return;

    const image =
      await uploadImage(file);

    if (image && image.url) {
      onUpload(image);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div
      className="
        space-y-3
      "
    >
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
              <span>Upload Image</span>
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

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
      />

      {error && (
        <p
          className="text-red-500 text-sm font-medium"
        >
          {error}
        </p>
      )}
    </div>
  );
}
