"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button, Modal, BottomSheet, ConfirmModal } from "@/components/ui";
import { NaverMap } from "@/components/map";
import { WatchList } from "@/components/watch";
import { AddWatchForm, StarRating, type AddWatchFormData, type EditWatchFormData } from "@/components/form";
import { getCinemaById } from "@/app/actions/cinema";
import { useCreateWatch, useUpdateWatch, useDeleteWatch, useToggleFavorite, useIsDesktop } from "@/hooks";
import { useUserStore } from "@/stores/useUserStore";
import type { WatchRecord } from "@/types";

export default function CinemaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isAddWatchOpen, setIsAddWatchOpen] = useState(false);
  const [editingWatch, setEditingWatch] = useState<WatchRecord | null>(null);
  const [deletingWatchId, setDeletingWatchId] = useState<string | null>(null);
  const [confirmDeleteWatchId, setConfirmDeleteWatchId] = useState<string | null>(null);

  const isDesktop = useIsDesktop();
  const isReadonly = useUserStore((s) => s.isReadonly());

  const { data: cinema, isLoading } = useQuery({
    queryKey: ["cinema", id],
    queryFn: () => getCinemaById(id),
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    gcTime: 1000 * 60 * 30, // 30분간 캐시 유지
  });

  const createWatch = useCreateWatch();
  const updateWatch = useUpdateWatch();
  const deleteWatch = useDeleteWatch();
  const toggleFavorite = useToggleFavorite();

  const handleAddWatch = async (data: AddWatchFormData) => {
    await createWatch.mutateAsync({
      cinemaId: id,
      movieTitle: data.movieTitle,
      genre: data.genre,
      rating: data.rating,
      comment: data.comment,
      posterUrl: data.posterUrl,
      watchedAt: data.watchedAt,
    });
    setIsAddWatchOpen(false);
  };

  const handleEditWatch = (watch: WatchRecord) => {
    setEditingWatch(watch);
  };

  const handleUpdateWatch = async (data: EditWatchFormData) => {
    if (!editingWatch) return;
    await updateWatch.mutateAsync({
      id: editingWatch.id,
      cinemaId: id,
      movieTitle: data.movieTitle,
      genre: data.genre,
      rating: data.rating,
      comment: data.comment,
      posterUrl: data.posterUrl,
      watchedAt: data.watchedAt,
    });
    setEditingWatch(null);
  };

  const handleDeleteWatch = (watchId: string) => {
    setConfirmDeleteWatchId(watchId);
  };

  const confirmDeleteWatch = async () => {
    if (!confirmDeleteWatchId || !cinema) return;

    const isLastWatch = cinema.watches.length === 1;

    setDeletingWatchId(confirmDeleteWatchId);
    setConfirmDeleteWatchId(null);
    await deleteWatch.mutateAsync({ id: confirmDeleteWatchId, cinemaId: id });
    setDeletingWatchId(null);

    // 마지막 관람 기록이었으면 홈으로 이동
    if (isLastWatch) {
      router.push("/");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
      </div>
    );
  }

  if (!cinema) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">영화관을 찾을 수 없습니다</p>
        <Link href="/">
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  const AddWatchFormContent = (
    <AddWatchForm
      onSubmit={handleAddWatch}
      onCancel={() => setIsAddWatchOpen(false)}
      isLoading={createWatch.isPending}
    />
  );

  return (
    <div className="h-screen-safe overflow-hidden bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="p-1 -ml-1 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold">{cinema.name}</h1>
          <button
            onClick={() => toggleFavorite.mutate(id)}
            disabled={toggleFavorite.isPending}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={cinema.isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          >
            {cinema.isFavorite ? (
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden lg:flex">
        {/* 영화관 정보 */}
        <div className="h-full flex flex-col lg:w-[480px] lg:border-r lg:border-gray-200 bg-white">
          {/* 지도 - 고정 */}
          <div className="flex-shrink-0 h-40 lg:h-48">
            <NaverMap
              cinemas={[cinema]}
              center={{ lat: cinema.latitude, lng: cinema.longitude }}
              className="w-full h-full"
            />
          </div>

          {/* 영화관 정보 - 고정 */}
          <div className="flex-shrink-0 p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              {cinema.brand && (
                <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-sm rounded">
                  {cinema.brand}
                </span>
              )}
              {cinema.averageRating !== null && (
                <StarRating
                  value={cinema.averageRating}
                  onChange={() => {}}
                  readonly
                  size="sm"
                />
              )}
            </div>
            <p className="text-sm text-gray-500">{cinema.address}</p>
            <p className="text-sm text-gray-400 mt-1">
              총 {cinema.watchCount}회 관람
            </p>
          </div>

          {/* 관람 기록 헤더 - 고정 */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-lg font-semibold">관람 기록</h2>
            {!isReadonly && (
              <Button size="sm" onClick={() => setIsAddWatchOpen(true)}>
                + 추가
              </Button>
            )}
          </div>

          {/* 관람 기록 목록 - 스크롤 */}
          <div className="flex-1 overflow-auto p-4">
            <WatchList
              watches={cinema.watches}
              onEdit={isReadonly ? undefined : handleEditWatch}
              onDelete={isReadonly ? undefined : handleDeleteWatch}
              deletingId={deletingWatchId}
            />
          </div>
        </div>

        {/* 데스크톱: 지도 */}
        <div className="hidden lg:block lg:flex-1">
          <NaverMap
            cinemas={[cinema]}
            center={{ lat: cinema.latitude, lng: cinema.longitude }}
            className="w-full h-full"
          />
        </div>
      </main>

      {/* 관람 추가 모달/바텀시트 */}
      {isDesktop ? (
        <Modal
          isOpen={isAddWatchOpen}
          onClose={() => setIsAddWatchOpen(false)}
          title="관람 기록 추가"
        >
          {AddWatchFormContent}
        </Modal>
      ) : (
        <BottomSheet
          isOpen={isAddWatchOpen}
          onClose={() => setIsAddWatchOpen(false)}
          title="관람 기록 추가"
        >
          {AddWatchFormContent}
        </BottomSheet>
      )}

      {/* 관람 수정 모달/바텀시트 */}
      {isDesktop ? (
        <Modal
          isOpen={!!editingWatch}
          onClose={() => setEditingWatch(null)}
          title="관람 기록 수정"
        >
          {editingWatch && (
            <AddWatchForm
              onSubmit={handleUpdateWatch}
              onCancel={() => setEditingWatch(null)}
              isLoading={updateWatch.isPending}
              initialData={editingWatch}
              mode="edit"
            />
          )}
        </Modal>
      ) : (
        <BottomSheet
          isOpen={!!editingWatch}
          onClose={() => setEditingWatch(null)}
          title="관람 기록 수정"
        >
          {editingWatch && (
            <AddWatchForm
              onSubmit={handleUpdateWatch}
              onCancel={() => setEditingWatch(null)}
              isLoading={updateWatch.isPending}
              initialData={editingWatch}
              mode="edit"
            />
          )}
        </BottomSheet>
      )}

      {/* 관람 기록 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={!!confirmDeleteWatchId}
        onClose={() => setConfirmDeleteWatchId(null)}
        onConfirm={confirmDeleteWatch}
        title="관람 기록 삭제"
        message="이 관람 기록을 삭제하시겠습니까?"
        confirmText="삭제"
        variant="danger"
      />

    </div>
  );
}
