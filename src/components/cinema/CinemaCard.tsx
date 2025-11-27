"use client";

import Link from "next/link";
import Image from "next/image";
import type { CinemaWithWatches } from "@/types";

interface CinemaCardProps {
  cinema: CinemaWithWatches;
}

export function CinemaCard({ cinema }: CinemaCardProps) {
  const latestWatch = cinema.watches[0];
  const watchWithPoster = cinema.watches.find((w) => w.posterUrl);

  return (
    <Link href={`/cinema/${cinema.id}`}>
      <div className="py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors -mx-4 px-4 flex gap-3">
        {/* 왼쪽: 텍스트 정보 */}
        <div className="flex-1 min-w-0">
          {/* 첫째 줄: 영화관명 + 브랜드 */}
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-[15px] text-gray-900 truncate">{cinema.name}</h3>
            {cinema.brand && (
              <span className="text-[13px] text-gray-400 flex-shrink-0">{cinema.brand}</span>
            )}
            {cinema.isFavorite && (
              <svg className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </div>

          {/* 둘째 줄: 별점 + 관람횟수 */}
          <div className="flex items-center gap-2 mt-1">
            {cinema.averageRating !== null && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-[13px] font-medium text-gray-900">{cinema.averageRating.toFixed(1)}</span>
              </div>
            )}
            <span className="text-[13px] text-gray-400">관람 {cinema.watchCount}회</span>
          </div>

          {/* 셋째 줄: 최근 영화 */}
          {latestWatch && (
            <p className="text-[13px] text-gray-500 mt-1 truncate">
              최근: {latestWatch.movieTitle}
            </p>
          )}

          {/* 넷째 줄: 주소 */}
          <p className="text-[13px] text-gray-400 mt-1 truncate">
            {cinema.address}
          </p>
        </div>

        {/* 오른쪽: 포스터 썸네일 */}
        {watchWithPoster?.posterUrl && (
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={watchWithPoster.posterUrl}
              alt={cinema.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
              loading="lazy"
              unoptimized
            />
          </div>
        )}
      </div>
    </Link>
  );
}
