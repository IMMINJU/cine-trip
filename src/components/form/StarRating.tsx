"use client";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number | null;
  onChange: (rating: number | null) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const handleClick = (rating: number, isHalf: boolean) => {
    if (readonly) return;

    const newRating = isHalf ? rating - 0.5 : rating;

    if (value === newRating) {
      onChange(null);
    } else {
      onChange(newRating);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => {
        const isFull = value !== null && value >= star;
        const isHalf = value !== null && value >= star - 0.5 && value < star;

        return (
          <div key={star} className="relative">
            <button
              type="button"
              onClick={() => handleClick(star, false)}
              disabled={readonly}
              className={cn(
                "relative",
                !readonly && "cursor-pointer hover:scale-110 transition-transform"
              )}
            >
              <svg
                className={cn(sizeClasses[size], "text-gray-300")}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <svg
                className={cn(
                  sizeClasses[size],
                  "absolute inset-0 text-yellow-400",
                  isHalf ? "clip-half" : ""
                )}
                fill={isFull || isHalf ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                style={isHalf ? { clipPath: "inset(0 50% 0 0)" } : undefined}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>

            {!readonly && (
              <button
                type="button"
                onClick={() => handleClick(star, true)}
                className="absolute inset-y-0 left-0 w-1/2"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
