"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, ImageModal } from "@/components/ui";
import { StarRating } from "@/components/form";
import { formatDate } from "@/lib/utils";
import type { WatchRecord } from "@/types";

interface WatchCardProps {
  watch: WatchRecord;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function WatchCard({ watch, onEdit, onDelete, isDeleting }: WatchCardProps) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const imageUrl = watch.posterUrl;

  return (
    <Card>
      <CardContent className="p-4">
        {/* 콘텐츠 + 사진 */}
        <div className="flex gap-3">
          {/* 콘텐츠 영역 */}
          <div className="flex-1 min-w-0">
            {/* 영화 제목 + 장르 */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{watch.movieTitle}</span>
              {watch.genre && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {watch.genre}
                </span>
              )}
            </div>

            {/* 별점 */}
            {watch.rating && (
              <div className="mt-1">
                <StarRating
                  value={parseFloat(watch.rating)}
                  onChange={() => {}}
                  readonly
                  size="sm"
                />
              </div>
            )}

            {/* 한줄평 */}
            {watch.comment && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{watch.comment}</p>
            )}
          </div>

          {/* 사진 썸네일 - 우측 */}
          {imageUrl && (
            <button
              type="button"
              onClick={() => setIsImageOpen(true)}
              className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in"
            >
              <Image
                src={imageUrl}
                alt={watch.movieTitle}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            </button>
          )}
        </div>

        {/* 날짜 + 수정/삭제 버튼 - 맨 하단 */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {formatDate(watch.watchedAt)}
          </span>
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="text-xs text-gray-400 hover:text-sky-500 transition-colors"
              >
                수정
              </button>
            )}
            {onEdit && onDelete && (
              <span className="text-gray-300">|</span>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                삭제
              </button>
            )}
          </div>
        </div>
      </CardContent>

      {/* 이미지 확대 모달 */}
      {imageUrl && (
        <ImageModal
          isOpen={isImageOpen}
          onClose={() => setIsImageOpen(false)}
          src={imageUrl}
          alt={watch.movieTitle}
        />
      )}
    </Card>
  );
}
