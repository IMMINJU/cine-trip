"use client";

import { useState, useEffect, useRef } from "react";
import { searchPlaces, convertNaverCoords } from "@/lib/naver";
import type { NaverSearchItem } from "@/types";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  onSelect: (place: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  }) => void;
  placeholder?: string;
  className?: string;
  variant?: "default" | "inline";
  autoFocus?: boolean;
  searchSuffix?: string;
}

export function SearchInput({
  onSelect,
  placeholder = "검색...",
  className,
  variant = "default",
  autoFocus = false,
  searchSuffix = "",
}: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NaverSearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          // 검색 쿼리 구성 (suffix가 있으면 추가)
          const searchQuery = searchSuffix ? `${query} ${searchSuffix}` : query;
          const items = await searchPlaces(searchQuery);
          setResults(items);
          setIsOpen(true);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: NaverSearchItem) => {
    const coords = convertNaverCoords(item.mapx, item.mapy);
    onSelect({
      name: item.title,
      address: item.roadAddress || item.address,
      lat: coords.lat,
      lng: coords.lng,
    });
    setQuery(item.title);
    setIsOpen(false);
  };

  const isInline = variant === "inline";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full focus:outline-none",
            isInline
              ? "bg-transparent text-[15px] font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal"
              : "px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          )}
        />
        {isLoading && !isInline && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500" />
          </div>
        )}
      </div>

      {isOpen && (
        <ul className={cn(
          "absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto",
          isInline ? "mt-2 left-0 min-w-[280px]" : "mt-1"
        )}>
          {results.length > 0 ? (
            results.map((item, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {item.roadAddress || item.address}
                  </p>
                </button>
              </li>
            ))
          ) : (
            <li className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500">검색 결과가 없습니다</p>
              <p className="text-xs text-gray-400 mt-1">다른 검색어를 입력해보세요</p>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
