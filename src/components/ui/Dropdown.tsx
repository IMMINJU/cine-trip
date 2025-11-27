"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DropdownOption<T> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface DropdownProps<T> {
  value: T | null;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  renderValue?: (option: DropdownOption<T>) => ReactNode;
  renderOption?: (option: DropdownOption<T>, isSelected: boolean) => ReactNode;
  position?: "top" | "bottom";
  align?: "left" | "right";
  className?: string;
  triggerClassName?: string;
  optionsClassName?: string;
}

export function Dropdown<T extends string | number>({
  value,
  options,
  onChange,
  placeholder = "선택",
  renderValue,
  renderOption,
  position = "top",
  align = "right",
  className,
  triggerClassName,
  optionsClassName,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "cursor-pointer rounded-lg px-2 py-1 transition-colors",
          isOpen ? "bg-sky-50 ring-2 ring-sky-500" : "hover:bg-gray-50",
          triggerClassName
        )}
      >
        {selectedOption ? (
          renderValue ? (
            renderValue(selectedOption)
          ) : (
            <span className="text-sm">{selectedOption.label}</span>
          )
        ) : (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[100px]",
            position === "top" ? "bottom-full mb-1" : "top-full mt-1",
            align === "right" ? "right-0" : "left-0",
            optionsClassName
          )}
        >
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors",
                  isSelected ? "bg-sky-50 text-sky-700" : "text-gray-700"
                )}
              >
                {renderOption ? (
                  renderOption(option, isSelected)
                ) : (
                  <div className="flex items-center gap-2">
                    {option.icon && <span>{option.icon}</span>}
                    <span>{option.label}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
