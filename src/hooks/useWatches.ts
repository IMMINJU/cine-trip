"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createWatch, updateWatch, deleteWatch } from "@/app/actions/watch";
import { getErrorMessage } from "@/lib/errors";
import { useUserStore } from "@/stores/useUserStore";

interface CreateWatchData {
  cinemaId: string;
  movieTitle: string;
  genre: string | null;
  rating: number | null;
  comment: string;
  posterUrl: string | null;
  watchedAt: string;
}

export function useCreateWatch() {
  const queryClient = useQueryClient();
  const userId = useUserStore((s) => s.userId);

  return useMutation({
    mutationFn: async (data: CreateWatchData) => {
      return createWatch({
        cinemaId: data.cinemaId,
        userId,
        movieTitle: data.movieTitle,
        genre: data.genre,
        rating: data.rating,
        comment: data.comment || null,
        posterUrl: data.posterUrl,
        watchedAt: data.watchedAt,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cinemas"] });
      queryClient.invalidateQueries({ queryKey: ["cinema", variables.cinemaId] });
      toast.success("관람 기록이 추가되었습니다");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

interface UpdateWatchData {
  id: string;
  cinemaId: string;
  movieTitle: string;
  genre: string | null;
  rating: number | null;
  comment: string;
  posterUrl: string | null;
  watchedAt: string;
}

export function useUpdateWatch() {
  const queryClient = useQueryClient();
  const userId = useUserStore((s) => s.userId);

  return useMutation({
    mutationFn: async (data: UpdateWatchData) => {
      return updateWatch({
        id: data.id,
        userId,
        cinemaId: data.cinemaId,
        movieTitle: data.movieTitle,
        genre: data.genre,
        rating: data.rating,
        comment: data.comment || null,
        posterUrl: data.posterUrl,
        watchedAt: data.watchedAt,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cinemas"] });
      queryClient.invalidateQueries({ queryKey: ["cinema", variables.cinemaId] });
      toast.success("관람 기록이 수정되었습니다");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteWatch() {
  const queryClient = useQueryClient();
  const userId = useUserStore((s) => s.userId);

  return useMutation({
    mutationFn: ({ id, cinemaId }: { id: string; cinemaId: string }) =>
      deleteWatch(id, cinemaId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cinemas"] });
      queryClient.invalidateQueries({ queryKey: ["cinema", variables.cinemaId] });
      toast.success("관람 기록이 삭제되었습니다");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
