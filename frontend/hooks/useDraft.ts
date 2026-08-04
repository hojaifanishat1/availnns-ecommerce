"use client";

import {
  useEffect,
  useState,
  useCallback
} from "react";

const DRAFT_KEY = "availnns_product_draft";

export default function useDraft<T>(
  initialData: T
) {
  const [
    draft,
    setDraft
  ] = useState<T>(
    initialData
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved =
      localStorage.getItem(
        DRAFT_KEY
      );

    if (saved) {
      try {
        setDraft(
          JSON.parse(saved)
        );
      } catch (error) {
        console.error(
          "Draft load failed:",
          error
        );
      }
    }
  }, []);

  const saveDraft = useCallback((
    data: T
  ) => {
    setDraft(data);

    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error(
        "Draft save failed:",
        error
      );
    }
  }, []);

  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(
        DRAFT_KEY
      );
      setDraft(initialData);
    } catch (error) {
      console.error(
        "Draft clear failed:",
        error
      );
    }
  }, [initialData]);

  const hasDraft = useCallback(() => {
    if (typeof window === "undefined") return false;

    return (
      localStorage.getItem(
        DRAFT_KEY
      ) !== null
    );
  }, []);

  return {
    draft,
    saveDraft,
    clearDraft,
    hasDraft
  };
}
