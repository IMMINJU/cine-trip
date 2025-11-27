"use client";

import { useForm, Controller } from "react-hook-form";
import Image from "next/image";
import { Button } from "@/components/ui";
import { StarRating } from "./StarRating";
import { DatePicker } from "./DatePicker";
import { MovieSearchInput, type MovieItem } from "./MovieSearchInput";
import type { WatchRecord } from "@/types";
import { format } from "date-fns";

export interface AddWatchFormData {
  movieTitle: string;
  genre: string | null;
  rating: number | null;
  comment: string;
  posterUrl: string | null;
  watchedAt: string;
}

export type EditWatchFormData = AddWatchFormData;

interface AddWatchFormPropsBase {
  onCancel: () => void;
  isLoading?: boolean;
}

interface AddModeProps extends AddWatchFormPropsBase {
  mode?: "add";
  onSubmit: (data: AddWatchFormData) => Promise<void>;
  initialData?: never;
}

interface EditModeProps extends AddWatchFormPropsBase {
  mode: "edit";
  onSubmit: (data: EditWatchFormData) => Promise<void>;
  initialData: WatchRecord;
}

type AddWatchFormProps = AddModeProps | EditModeProps;

export function AddWatchForm(props: AddWatchFormProps) {
  const { onCancel, isLoading = false } = props;
  const mode = props.mode ?? "add";
  const initialData = props.mode === "edit" ? props.initialData : undefined;
  const onSubmit = props.onSubmit as (data: EditWatchFormData) => Promise<void>;

  const { control, handleSubmit, watch, setValue } = useForm<EditWatchFormData>({
    defaultValues: {
      movieTitle: initialData?.movieTitle || "",
      genre: initialData?.genre || null,
      rating: initialData?.rating ? parseFloat(initialData.rating) : null,
      comment: initialData?.comment || "",
      posterUrl: initialData?.posterUrl || null,
      watchedAt: initialData?.watchedAt || format(new Date(), "yyyy-MM-dd"),
    },
  });

  const watchedValues = watch();
  const { movieTitle, posterUrl, genre } = watchedValues;

  const handleSelectMovie = (movie: MovieItem) => {
    setValue("posterUrl", movie.posterUrl);
    setValue("genre", movie.genre);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 프리뷰 카드 */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* 포스터 이미지 영역 */}
        <div className="relative w-full h-48 bg-gray-100">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={movieTitle || "영화 포스터"}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <span className="text-sm">영화를 검색하면 포스터가 표시됩니다</span>
            </div>
          )}
        </div>

        {/* 콘텐츠 영역 */}
        <div className="p-4 space-y-3">
          {/* 영화 제목 검색 + 장르 표시 */}
          <div className="flex items-center gap-2">
            <Controller
              name="movieTitle"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <MovieSearchInput
                  value={field.value}
                  onChange={field.onChange}
                  onSelectMovie={handleSelectMovie}
                  placeholder="영화 제목 검색"
                  className="flex-1 min-w-0"
                />
              )}
            />
            {genre && (
              <span className="px-2 py-1 text-xs font-medium text-sky-600 bg-sky-50 rounded-full whitespace-nowrap">
                {genre}
              </span>
            )}
          </div>

          {/* 별점 */}
          <div className="px-2 py-1 -mx-2">
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <StarRating value={field.value} onChange={field.onChange} size="sm" />
              )}
            />
          </div>

          {/* 한줄평 */}
          <textarea
            value={watchedValues.comment}
            onChange={(e) => setValue("comment", e.target.value)}
            placeholder="한줄평 입력 (선택)"
            maxLength={100}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-sky-500 resize-none"
          />

          {/* 관람일 */}
          <Controller
            name="watchedAt"
            control={control}
            render={({ field }) => (
              <DatePicker value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          취소
        </Button>
        <Button type="submit" disabled={isLoading || !movieTitle} className="flex-1">
          {isLoading
            ? mode === "edit"
              ? "수정 중..."
              : "등록 중..."
            : mode === "edit"
            ? "수정하기"
            : "등록하기"}
        </Button>
      </div>
    </form>
  );
}
