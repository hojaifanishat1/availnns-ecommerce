"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback
} from "react";

interface Props<T> {
  data: T;
  save: (data: T) => Promise<void> | void;
  delay?: number;
}

export default function useAutoSave<T>({
  data,
  save,
  delay = 3000
}: Props<T>) {
  const [
    saving,
    setSaving
  ] = useState(false);

  const timer =
    useRef<NodeJS.Timeout | null>(null);

  const isInitialMount =
    useRef(true);

  const savedCallback =
    useRef(save);

  useEffect(() => {
    savedCallback.current = save;
  }, [save]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (timer.current) {
      clearTimeout(
        timer.current
      );
    }

    timer.current =
      setTimeout(async () => {
        try {
          setSaving(true);
          await savedCallback.current(data);
        } catch (error) {
          console.error(
            "Auto-save failed:",
            error
          );
        } finally {
          setTimeout(() => {
            setSaving(false);
          }, 500);
        }
      }, delay);

    return () => {
      if (timer.current) {
        clearTimeout(
          timer.current
        );
      }
    };
  }, [
    data,
    delay
  ]);

  return {
    saving
  };
}
