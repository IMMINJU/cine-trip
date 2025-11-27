"use client";

import { CinemaCard } from "./CinemaCard";
import type { CinemaWithWatches } from "@/types";

interface CinemaListProps {
  cinemas: CinemaWithWatches[];
  isLoading?: boolean;
  hasFilter?: boolean;
}

export function CinemaList({ cinemas, isLoading, hasFilter }: CinemaListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
          >
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (cinemas.length === 0) {
    // 필터/검색 적용 시
    if (hasFilter) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-gray-500">검색 결과가 없습니다</p>
          <p className="text-sm text-gray-400 mt-1">다른 검색어나 필터를 시도해보세요</p>
        </div>
      );
    }

    // 등록된 영화관이 없을 때
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
            />
          </svg>
        </div>
        <p className="text-gray-500">등록된 영화관이 없습니다</p>
        <p className="text-sm text-gray-400 mt-1">영화관을 추가해보세요!</p>
      </div>
    );
  }

  return (
    <div>
      {cinemas.map((cinema) => (
        <CinemaCard key={cinema.id} cinema={cinema} />
      ))}
    </div>
  );
}
