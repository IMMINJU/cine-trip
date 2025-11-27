"use client";

import { useState } from "react";
import Link from "next/link";
import { useUserStore } from "@/stores/useUserStore";
import { USERS } from "@/constants";
import { Modal } from "@/components/ui";

export function Header() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const { userId, setUserId, getCurrentUser } = useUserStore();
  const currentUser = getCurrentUser();
  const isGuest = userId === "guest";

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            CineTrip
          </h1>
        </Link>

        <div className="flex items-center gap-2">
          {/* 사용자 표시/선택 */}
          {isGuest ? (
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Guest</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-sky-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">{currentUser?.name}</span>
            </div>
          )}

          {/* 통계 */}
          <Link
            href="/stats"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="통계"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* 사용자 선택 모달 */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="사용자 선택"
      >
        <div className="space-y-2">
          {USERS.filter((user) => !user.readonly).map((user) => (
            <button
              key={user.id}
              onClick={() => {
                setUserId(user.id);
                setIsUserModalOpen(false);
              }}
              className="w-full p-4 text-left rounded-xl border-2 border-gray-200 hover:border-sky-500 hover:bg-sky-50 transition-all"
            >
              <span className="font-medium text-gray-900">{user.name}</span>
            </button>
          ))}
        </div>
      </Modal>
    </header>
  );
}
