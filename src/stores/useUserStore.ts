"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { USERS } from "@/constants";

interface UserState {
  userId: string;
  setUserId: (id: string) => void;
  isReadonly: () => boolean;
  getCurrentUser: () => typeof USERS[number] | undefined;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: "guest",
      setUserId: (id) => set({ userId: id }),
      isReadonly: () => {
        const userId = get().userId;
        const user = USERS.find((u) => u.id === userId);
        return user?.readonly ?? false;
      },
      getCurrentUser: () => {
        const userId = get().userId;
        return USERS.find((u) => u.id === userId);
      },
    }),
    {
      name: "movie-user",
    }
  )
);
