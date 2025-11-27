"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * 요소 외부 클릭 감지 훅
 */
export function useClickOutside<T extends HTMLElement>(
  callback: () => void,
  enabled: boolean = true
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [callback, enabled]);

  return ref;
}
