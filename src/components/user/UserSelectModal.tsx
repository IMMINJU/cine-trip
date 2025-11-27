"use client";

import { USERS } from "@/constants";
import { useUserStore } from "@/stores/useUserStore";
import { motion, AnimatePresence } from "framer-motion";

export function UserSelectModal() {
  const { userId, setUserId } = useUserStore();

  return (
    <AnimatePresence>
      {!userId && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                누구세요?
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                사용자를 선택해주세요
              </p>
            </div>

            <div className="space-y-2">
              {USERS.map((user, index) => (
                <motion.button
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setUserId(user.id)}
                  className="w-full p-4 text-left rounded-xl border-2 border-gray-200 hover:border-sky-500 hover:bg-sky-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {user.name}
                    </span>
                    {user.readonly && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        읽기 전용
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
