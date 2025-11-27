"use client";

import Link from "next/link";
import { useCinemas } from "@/hooks";
import { GENRES } from "@/constants";

export default function StatsPage() {
  const { data: cinemas = [], isLoading } = useCinemas();

  // 총 관람 횟수
  const totalWatches = cinemas.reduce((sum, c) => sum + c.watchCount, 0);

  // 장르별 통계 (관람 기록 기준)
  const genreStats = GENRES.map((genre) => {
    let watchCount = 0;
    cinemas.forEach((cinema) => {
      watchCount += cinema.watches.filter((w) => w.genre === genre).length;
    });
    return { genre, watchCount };
  }).filter((stat) => stat.watchCount > 0);

  // 가장 많이 방문한 영화관 Top 5
  const topCinemas = [...cinemas]
    .sort((a, b) => b.watchCount - a.watchCount)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center px-4 py-3 lg:px-6">
          <Link href="/" className="p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">통계</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-sky-500">{cinemas.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">등록 영화관</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-sky-500">{totalWatches}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">총 관람</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-sky-500">{genreStats.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">장르</p>
          </div>
        </div>

        {/* 장르별 분포 */}
        {genreStats.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">장르별 분포</h2>
            <div className="space-y-3">
              {genreStats
                .sort((a, b) => b.watchCount - a.watchCount)
                .map((stat) => {
                  const percentage = (stat.watchCount / totalWatches) * 100;
                  return (
                    <div key={stat.genre}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{stat.genre}</span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {stat.watchCount}회 관람
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 가장 많이 방문한 영화관 */}
        {topCinemas.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              자주 가는 영화관
            </h2>
            <div className="space-y-3">
              {topCinemas.map((cinema, index) => (
                <Link
                  key={cinema.id}
                  href={`/cinema/${cinema.id}`}
                  className="flex items-center gap-3 p-3 -mx-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="w-6 h-6 bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {cinema.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {cinema.brand || "기타"}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-sky-500">
                    {cinema.watchCount}회
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 빈 상태 */}
        {cinemas.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              아직 통계가 없어요
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              영화관을 등록하고 관람 기록을 남겨보세요
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              영화관 등록하러 가기
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
