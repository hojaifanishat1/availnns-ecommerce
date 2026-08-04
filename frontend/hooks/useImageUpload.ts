"use client";

import {
  useState,
  useCallback
} from "react";

import {
  uploadProductImage,
  UploadResponse
} from "@/services/media.service";

import {
  validateImage,
} from "@/utils/imageValidator";

import {
  compressImage,
} from "@/utils/imageCompression";

export interface UploadedImageResult {
  url: string;
  publicId?: string;
  alt: string;
}

export default function useImageUpload() {
  const [
    uploading,
    setUploading
  ] = useState(false);

  const [
    progress,
    setProgress
  ] = useState(0);

  const [
    error,
    setError
  ] = useState<string | null>(null);

  const uploadImage = useCallback(async (
    file: File
  ): Promise<UploadedImageResult> => {
    try {
      setError(null);
      setUploading(true);
      setProgress(10);

      const validation =
        validateImage(file);

      if (!validation.valid) {
        throw new Error(
          validation.message || "Invalid image file"
        );
      }

      setProgress(30);

      const compressed =
        await compressImage(file);

      setProgress(50);

      const response: UploadResponse =
        await uploadProductImage(
          compressed
        );

      setProgress(100);

      return {
        url: response.url,
        publicId:
          response.public_id || response.publicId,
        alt:
          file.name,
      };

    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Upload failed";

      setError(errorMessage);
      throw err;

    } finally {
      setUploading(false);

      setTimeout(() => {
        setProgress(0);
      }, 1000);
    }
  }, []);

  const uploadMultiple = useCallback(async (
    files: File[]
  ): Promise<UploadedImageResult[]> => {
    const uploaded: UploadedImageResult[] = [];

    for (const file of files) {
      const image =
        await uploadImage(file);

      uploaded.push(image);
    }

    return uploaded;
  }, [uploadImage]);

  return {
    uploadImage,
    uploadMultiple,
    uploading,
    progress,
    error,
  };
}
