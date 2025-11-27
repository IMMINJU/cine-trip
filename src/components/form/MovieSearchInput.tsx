"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useDebounce } from "@/hooks";

export interface MovieItem {
  id: number;
  title: string;
  originalTitle: string;
  posterUrl: string | null;
  year: string | null;
  rating: number;
  genre: string | null;
}

interface MovieSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectMovie?: (movie: MovieItem) => void;
  placeholder?: string;
  className?: string;
}

export function MovieSearchInput({
  value,
  onChange,
  onSelectMovie,
  placeholder = "영화 제목 검색",
  className = "",
}: MovieSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<MovieItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(value, 300);

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 검색 실행
  useEffect(() => {
    async function searchMovies() {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search/movie?query=${encodeURIComponent(debouncedQuery)}`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.items || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Movie search error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    searchMovies();
  }, [debouncedQuery]);

  const handleSelect = (movie: MovieItem) => {
    onChange(movie.title);
    onSelectMovie?.(movie);
    setIsOpen(false);
    setResults([]);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:border-sky-500 text-sm"
        />
        {isLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-sky-500 rounded-full animate-spin" />
          </div>
        )}
        {!isLoading && value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.map((movie) => (
            <button
              key={movie.id}
              type="button"
              onClick={() => handleSelect(movie)}
              className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 text-left transition-colors"
            >
              {/* 포스터 이미지 */}
              <div className="flex-shrink-0 w-10 h-14 bg-gray-100 rounded overflow-hidden">
                {movie.posterUrl ? (
                  <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    width={40}
                    height={56}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* 영화 정보 */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {movie.title}
                  {movie.year && (
                    <span className="text-gray-400 font-normal ml-1">
                      ({movie.year})
                    </span>
                  )}
                </p>
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <p className="text-xs text-gray-500 truncate">
                    {movie.originalTitle}
                  </p>
                )}
              </div>

              {/* 평점 */}
              {movie.rating > 0 && (
                <div className="flex-shrink-0 text-xs text-yellow-500 font-medium">
                  ★ {movie.rating.toFixed(1)}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
