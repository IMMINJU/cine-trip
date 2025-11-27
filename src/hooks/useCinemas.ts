"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getCinemas, createCinema, deleteCinema, toggleFavorite } from "@/app/actions/cinema";
import { createWatch } from "@/app/actions/watch";
import { useFilterStore } from "@/stores/useFilterStore";
import { useUserStore } from "@/stores/useUserStore";
import { getErrorMessage } from "@/lib/errors";
import type { AddCinemaFormData } from "@/components/form";

export function useCinemas() {
  const { selectedBrand, sortOption } = useFilterStore();

  return useQuery({
    queryKey: ["cinemas", selectedBrand, sortOption],
    queryFn: () => getCinemas(selectedBrand, sortOption),
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    gcTime: 1000 * 60 * 30, // 30분간 캐시 유지
  });
}

export function useCreateCinema() {
  const queryClient = useQueryClient();
  const userId = useUserStore((s) => s.userId);

  return useMutation({
    mutationFn: async (data: AddCinemaFormData) => {
      if (!data.place) {
        throw new Error("Required fields missing");
      }

      const cinema = await createCinema({
        name: data.place.name,
        address: data.place.address,
        latitude: data.place.lat,
        longitude: data.place.lng,
        brand: data.brand,
      });

      await createWatch({
        cinemaId: cinema.id,
        userId,
        movieTitle: data.movieTitle,
        genre: data.genre,
        rating: data.rating,
        comment: data.comment || null,
        posterUrl: data.posterUrl,
        watchedAt: data.watchedAt,
      });

      return cinema;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cinemas"] });
      toast.success("영화가 추가되었습니다");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteCinema() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCinema,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cinemas"] });
      toast.success("영화관이 삭제되었습니다");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFavorite,
    onSuccess: (result, id) => {
      queryClient.invalidateQueries({ queryKey: ["cinemas"] });
      queryClient.invalidateQueries({ queryKey: ["cinema", id] });
      toast.success(result?.isFavorite ? "즐겨찾기에 추가됨" : "즐겨찾기 해제됨");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
