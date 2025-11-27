"use client";

import { SORT_OPTIONS } from "@/constants";
import { useFilterStore } from "@/stores/useFilterStore";
import type { SortOption } from "@/types";

export function SortSelect() {
  const { sortOption, setSortOption } = useFilterStore();

  const currentIndex = SORT_OPTIONS.findIndex((o) => o.value === sortOption);
  const currentLabel = SORT_OPTIONS[currentIndex]?.label;

  const handleClick = () => {
    const nextIndex = (currentIndex + 1) % SORT_OPTIONS.length;
    setSortOption(SORT_OPTIONS[nextIndex].value as SortOption);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
      <span>{currentLabel}</span>
    </button>
  );
}
