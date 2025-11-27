"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({
  className,
  selected = false,
  children,
  ...props
}: ChipProps) {
  return (
    <button
      className={cn(
        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0",
        selected
          ? "bg-sky-500 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
