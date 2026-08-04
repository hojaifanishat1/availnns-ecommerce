"use client";

import {
  useState,
  useCallback
} from "react";

import {
  ProductMedia
} from "@/types/media";

export default function useMedia(
  initial: ProductMedia[] = []
) {
  const [
    images,
    setImages
  ] = useState<ProductMedia[]>(
    initial
  );

  const addImage = useCallback((
    image: ProductMedia
  ) => {
    setImages(
      prev => [
        ...prev,
        image
      ]
    );
  }, []);

  const addImages = useCallback((
    newImages: ProductMedia[]
  ) => {
    setImages(
      prev => [
        ...prev,
        ...newImages
      ]
    );
  }, []);

  const removeImage = useCallback((
    index: number
  ) => {
    setImages(
      prev =>
        prev.filter(
          (_, i) =>
            i !== index
        )
    );
  }, []);

  const updateImage = useCallback((
    index: number,
    data: Partial<ProductMedia>
  ) => {
    setImages(
      prev =>
        prev.map(
          (item, i) =>
            i === index
              ? {
                  ...item,
                  ...data
                }
              : item
        )
    );
  }, []);

  const setPrimaryImage = useCallback((
    index: number
  ) => {
    setImages(
      prev =>
        prev.map(
          (item, i) => ({
            ...item,
            isPrimary:
              i === index
          })
        )
    );
  }, []);

  const reorderImages = useCallback((
    newImages: ProductMedia[]
  ) => {
    setImages(newImages);
  }, []);

  return {
    images,
    setImages,
    addImage,
    addImages,
    removeImage,
    updateImage,
    setPrimaryImage,
    reorderImages
  };
}
