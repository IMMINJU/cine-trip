"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Image from "next/image";
import { Button } from "@/components/ui";
import { SearchInput } from "./SearchInput";
import { StarRating } from "./StarRating";
import { DatePicker } from "./DatePicker";
import { BrandDropdown } from "./BrandDropdown";
import { MovieSearchInput, type MovieItem } from "./MovieSearchInput";
import type { CinemaBrand } from "@/types";
import { format } from "date-fns";

interface PlaceInfo {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface AddCinemaFormData {
  place: PlaceInfo | null;
  brand: CinemaBrand | null;
  movieTitle: string;
  genre: string | null;
  rating: number | null;
  comment: string;
  posterUrl: string | null;
  watchedAt: string;
}

interface AddCinemaFormProps {
  onSubmit: (data: AddCinemaFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AddCinemaForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: AddCinemaFormProps) {
  const [isEditingPlace, setIsEditingPlace] = useState(false);

  const { control, handleSubmit, watch, setValue } = useForm<AddCinemaFormData>({
    defaultValues: {
      place: null,
      brand: null,
      movieTitle: "",
      genre: null,
      rating: null,
      comment: "",
      posterUrl: null,
      watchedAt: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const watchedValues = watch();
  const { place, movieTitle, posterUrl, genre } = watchedValues;

  const isFormValid = place && movieTitle;

  const handleSelectMovie = (movie: MovieItem) => {
    setValue("posterUrl", movie.posterUrl);
    setValue("genre", movie.genre);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 프리뷰 카드 */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* 포스터 이미지 영역 */}
        <div className="relative w-full h-36 bg-gray-100">
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
              <svg className="w-10 h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <span className="text-xs">영화 검색 시 포스터 표시</span>
            </div>
          )}
        </div>

        {/* 콘텐츠 영역 */}
        <div className="p-4 space-y-2">
          {/* 영화관명 + 브랜드 */}
          <div className="flex items-center gap-2">
            <div
              onClick={() => !place && setIsEditingPlace(true)}
              className={`flex-1 min-w-0 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors ${
                isEditingPlace
                  ? "bg-sky-50 ring-2 ring-sky-500"
                  : !place
                  ? "hover:bg-gray-50 cursor-pointer"
                  : ""
              }`}
            >
              {isEditingPlace ? (
                <Controller
                  name="place"
                  control={control}
                  rules={{ required: "영화관을 선택해주세요" }}
                  render={({ field }) => (
                    <SearchInput
                      onSelect={(selectedPlace) => {
                        field.onChange(selectedPlace);
                        setIsEditingPlace(false);
                      }}
                      placeholder="영화관 검색"
                      variant="inline"
                      autoFocus
                      searchSuffix="영화관"
                    />
                  )}
                />
              ) : place ? (
                <span className="font-medium text-[15px] text-gray-900">{place.name}</span>
              ) : (
                <span className="text-gray-400 text-[15px]">영화관 검색 *</span>
              )}
            </div>
            <Controller
              name="brand"
              control={control}
              render={({ field }) => (
                <BrandDropdown value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

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
                  placeholder="영화 제목 검색 *"
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

          {/* 주소 + 관람일 */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[12px] text-gray-400 truncate flex-1">
              {place?.address || "주소"}
            </span>
            <Controller
              name="watchedAt"
              control={control}
              render={({ field }) => (
                <DatePicker value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          취소
        </Button>
        <Button type="submit" disabled={isLoading || !isFormValid} className="flex-1">
          {isLoading ? "등록 중..." : "등록하기"}
        </Button>
      </div>
    </form>
  );
}
