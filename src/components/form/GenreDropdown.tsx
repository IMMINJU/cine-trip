"use client";

import { useState, useCallback } from "react";
import { GENRES } from "@/constants";
import { useClickOutside } from "@/hooks";
import { cn } from "@/lib/utils";
import type { Genre } from "@/types";

interface GenreDropdownProps {
  value: Genre | null;
  onChange: (value: Genre) => void;
  placeholder?: string;
  className?: string;
}

export function GenreDropdown({
  value,
  onChange,
  placeholder = "장르",
  className,
}: GenreDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const containerRef = useClickOutside<HTMLDivElement>(handleClose, isOpen);

  const handleSelect = (genre: Genre) => {
    onChange(genre);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "cursor-pointer rounded-lg px-2 py-1 transition-colors",
          isOpen ? "bg-sky-50 ring-2 ring-sky-500" : "hover:bg-gray-50"
        )}
      >
        {value ? (
          <span className="text-[13px] text-gray-500">{value}</span>
        ) : (
          <span className="text-gray-400 text-[13px]">{placeholder}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-1.5 flex flex-wrap gap-1 w-[200px]">
          {GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => handleSelect(genre)}
              className={cn(
                "px-2.5 py-1.5 text-xs rounded-md transition-colors",
                value === genre
                  ? "bg-sky-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {genre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
