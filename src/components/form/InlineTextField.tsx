"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface InlineTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  inputClassName?: string;
  displayClassName?: string;
  required?: boolean;
  maxLength?: number;
}

export function InlineTextField({
  value,
  onChange,
  placeholder = "입력",
  emptyText,
  className,
  inputClassName,
  displayClassName,
  required = false,
  maxLength,
}: InlineTextFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false);
    }
  };

  return (
    <div
      onClick={() => !isEditing && setIsEditing(true)}
      className={cn(
        "rounded-lg px-2 py-1 transition-colors",
        isEditing ? "bg-sky-50 ring-2 ring-sky-500" : "hover:bg-gray-50 cursor-pointer",
        className
      )}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          className={cn(
            "w-full bg-transparent focus:outline-none placeholder:text-gray-400",
            inputClassName
          )}
        />
      ) : value ? (
        <span className={displayClassName}>{value}</span>
      ) : (
        <span className="text-gray-400">
          {emptyText || placeholder}
          {required && " *"}
        </span>
      )}
    </div>
  );
}
