"use client";

import { WatchCard } from "./WatchCard";
import { useUserStore } from "@/stores/useUserStore";
import type { WatchRecord } from "@/types";

interface WatchListProps {
  watches: WatchRecord[];
  onEdit?: (watch: WatchRecord) => void;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
}

export function WatchList({ watches, onEdit, onDelete, deletingId }: WatchListProps) {
  const currentUserId = useUserStore((s) => s.userId);

  if (watches.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">관람 기록이 없습니다</p>
    );
  }

  return (
    <div className="space-y-3">
      {watches.map((watch) => {
        const isOwner = watch.userId === currentUserId;
        return (
          <WatchCard
            key={watch.id}
            watch={watch}
            onEdit={onEdit && isOwner ? () => onEdit(watch) : undefined}
            onDelete={onDelete && isOwner ? () => onDelete(watch.id) : undefined}
            isDeleting={deletingId === watch.id}
          />
        );
      })}
    </div>
  );
}
