"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  image: File | null;
  existingImageUrl?: string;
  hasExistingImage?: boolean;
  onChange?: (file: File | null) => void;
  onRemoveExisting?: () => void;
  height?: "sm" | "md" | "lg";
  className?: string;
}

export function ImagePreview({
  image,
  existingImageUrl,
  hasExistingImage = false,
  onChange,
  onRemoveExisting,
  height = "md",
  className,
}: ImagePreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const heightClasses = {
    sm: "h-32",
    md: "h-40",
    lg: "h-48",
  };

  const hasImage = image || hasExistingImage;

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange?.(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (image) {
      onChange?.(null);
    } else if (hasExistingImage) {
      onRemoveExisting?.();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative bg-gray-100 cursor-pointer transition-colors",
        heightClasses[height],
        "hover:bg-gray-50",
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {hasImage ? (
        <>
          {image ? (
            <img
              src={URL.createObjectURL(image)}
              alt="미리보기"
              className="w-full h-full object-cover"
            />
          ) : existingImageUrl ? (
            <img
              src={existingImageUrl}
              alt="기존 이미지"
              className="w-full h-full object-cover"
            />
          ) : null}
          {/* 삭제/변경 버튼 */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs">사진 추가</span>
        </div>
      )}
    </div>
  );
}
