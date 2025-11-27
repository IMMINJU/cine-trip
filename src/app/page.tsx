"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout";
import { NaverMap } from "@/components/map";
import { CinemaList } from "@/components/cinema";
import { BrandFilter, SortSelect, ListSearchInput } from "@/components/filter";
import { useFilterStore } from "@/stores/useFilterStore";
import { useUserStore } from "@/stores/useUserStore";
import { AddCinemaForm, type AddCinemaFormData } from "@/components/form";
import { Modal, BottomSheet } from "@/components/ui";
import { useCinemas, useCreateCinema, useIsDesktop, useMounted } from "@/hooks";

export default function HomePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);

  const mounted = useMounted();
  const isDesktop = useIsDesktop();
  const isReadonly = useUserStore((s) => s.isReadonly());
  const { data: cinemas = [], isLoading } = useCinemas();
  const createCinema = useCreateCinema();
  const { showFavoritesOnly, setShowFavoritesOnly, searchQuery, selectedBrand } = useFilterStore();

  const filteredCinemas = useMemo(() => {
    let result = cinemas;

    // 즐겨찾기 필터
    if (showFavoritesOnly) {
      result = result.filter((c) => c.isFavorite);
    }

    // 브랜드 필터
    if (selectedBrand) {
      result = result.filter((c) => c.brand === selectedBrand);
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((c) =>
        c.name.toLowerCase().includes(query) ||
        c.address.toLowerCase().includes(query) ||
        c.watches.some((w) => w.movieTitle.toLowerCase().includes(query))
      );
    }

    return result;
  }, [cinemas, showFavoritesOnly, selectedBrand, searchQuery]);

  const hasFilter = showFavoritesOnly || !!selectedBrand || !!searchQuery.trim();

  const handleAddSubmit = async (data: AddCinemaFormData) => {
    await createCinema.mutateAsync(data);
    setIsAddModalOpen(false);
  };

  const AddFormContent = (
    <AddCinemaForm
      onSubmit={handleAddSubmit}
      onCancel={() => setIsAddModalOpen(false)}
      isLoading={createCinema.isPending}
    />
  );

  return (
    <div className="h-screen-safe overflow-hidden bg-gray-50">
      <Header />

      <main className="h-main-safe flex">
        {/* PC: 왼쪽 사이드바 */}
        <div className="hidden lg:flex lg:flex-col lg:w-[380px] lg:border-r lg:border-gray-200 bg-white">
          <div className="flex-shrink-0 p-4 border-b border-gray-100 space-y-3">
            <ListSearchInput />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  영화관 목록 ({filteredCinemas.length})
                </h2>
                <SortSelect />
              </div>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showFavoritesOnly
                    ? "bg-yellow-100 text-yellow-600"
                    : "hover:bg-gray-100 text-gray-400"
                }`}
                aria-label={showFavoritesOnly ? "모든 영화관 보기" : "즐겨찾기만 보기"}
              >
                <svg className="w-5 h-5" fill={showFavoritesOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            </div>
            <BrandFilter />
          </div>
          <div className="flex-1 overflow-auto p-4">
            <CinemaList
              cinemas={filteredCinemas}
              isLoading={isLoading}
              hasFilter={hasFilter}
            />
          </div>
        </div>

        {/* 지도 영역 */}
        <div className="flex-1 relative overflow-hidden">
          <NaverMap
            cinemas={filteredCinemas}
            className="w-full h-full"
          />

          {/* 모바일: 영화관 목록 토글 버튼 */}
          {!isListOpen && (
            <button
              onClick={() => setIsListOpen(true)}
              className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-white rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-colors z-10"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                목록 보기 ({filteredCinemas.length})
              </span>
            </button>
          )}

          {/* 모바일: 바텀시트 */}
          <AnimatePresence>
            {isListOpen && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: "10%" }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="lg:hidden absolute inset-x-0 top-0 bottom-0 bg-white rounded-t-2xl shadow-xl z-[100] flex flex-col"
              >
                {/* 핸들 바 */}
                <div className="flex-shrink-0 pt-3 pb-2">
                  <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
                </div>

                {/* 헤더 */}
                <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 pb-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <ListSearchInput />
                    </div>
                    <button
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className={`p-2 rounded-lg transition-colors ${
                        showFavoritesOnly
                          ? "bg-yellow-100 text-yellow-600"
                          : "hover:bg-gray-100 text-gray-400"
                      }`}
                      aria-label={showFavoritesOnly ? "모든 영화관 보기" : "즐겨찾기만 보기"}
                    >
                      <svg className="w-5 h-5" fill={showFavoritesOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setIsListOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-semibold text-gray-900">
                      {filteredCinemas.length}개
                    </h2>
                    <SortSelect />
                    <BrandFilter />
                  </div>
                </div>

                {/* 목록 */}
                <div className="flex-1 overflow-auto p-4">
                  <CinemaList
                    cinemas={filteredCinemas}
                    isLoading={isLoading}
                    hasFilter={hasFilter}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* FAB: 영화 추가 버튼 */}
      {mounted && !isReadonly && (
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-6 right-6 lg:bottom-20 lg:right-4 w-14 h-14 lg:w-10 lg:h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
          aria-label="영화 추가"
        >
          <svg className="w-7 h-7 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* 영화 추가 모달/바텀시트 */}
      {isDesktop ? (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="영화 추가"
        >
          {AddFormContent}
        </Modal>
      ) : (
        <BottomSheet
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="영화 추가"
        >
          {AddFormContent}
        </BottomSheet>
      )}
    </div>
  );
}
