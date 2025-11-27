"use server";

import { db } from "@/db";
import { watches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { USERS } from "@/constants";

function isReadonlyUser(userId: string): boolean {
  const user = USERS.find((u) => u.id === userId);
  return user?.readonly ?? false;
}

export async function createWatch(data: {
  cinemaId: string;
  userId: string;
  movieTitle: string;
  genre?: string | null;
  rating?: number | null;
  comment?: string | null;
  posterUrl?: string | null;
  watchedAt: string;
}) {
  if (isReadonlyUser(data.userId)) {
    throw new Error("권한이 없습니다");
  }

  const [watch] = await db
    .insert(watches)
    .values({
      cinemaId: data.cinemaId,
      userId: data.userId,
      movieTitle: data.movieTitle,
      genre: data.genre ?? null,
      rating: data.rating?.toString() ?? null,
      comment: data.comment ?? null,
      posterUrl: data.posterUrl ?? null,
      watchedAt: data.watchedAt,
    })
    .returning();

  revalidatePath("/");
  revalidatePath(`/cinema/${data.cinemaId}`);

  return {
    id: watch.id,
    cinemaId: watch.cinemaId,
    userId: watch.userId,
    movieTitle: watch.movieTitle,
    genre: watch.genre,
    rating: watch.rating,
    comment: watch.comment,
    posterUrl: watch.posterUrl,
    watchedAt: watch.watchedAt,
    createdAt: watch.createdAt,
  };
}

export async function updateWatch(data: {
  id: string;
  userId: string;
  cinemaId: string;
  movieTitle: string;
  genre?: string | null;
  rating?: number | null;
  comment?: string | null;
  posterUrl?: string | null;
  watchedAt: string;
}) {
  const existing = await db.query.watches.findFirst({
    where: eq(watches.id, data.id),
  });

  if (!existing) {
    throw new Error("관람 기록을 찾을 수 없습니다");
  }

  if (existing.userId !== data.userId) {
    throw new Error("본인의 기록만 수정할 수 있습니다");
  }

  const [watch] = await db
    .update(watches)
    .set({
      movieTitle: data.movieTitle,
      genre: data.genre ?? null,
      rating: data.rating?.toString() ?? null,
      comment: data.comment ?? null,
      posterUrl: data.posterUrl ?? null,
      watchedAt: data.watchedAt,
    })
    .where(eq(watches.id, data.id))
    .returning();

  revalidatePath("/");
  revalidatePath(`/cinema/${data.cinemaId}`);

  return {
    id: watch.id,
    cinemaId: watch.cinemaId,
    userId: watch.userId,
    movieTitle: watch.movieTitle,
    genre: watch.genre,
    rating: watch.rating,
    comment: watch.comment,
    posterUrl: watch.posterUrl,
    watchedAt: watch.watchedAt,
    createdAt: watch.createdAt,
  };
}

export async function deleteWatch(id: string, cinemaId: string, userId: string) {
  const existing = await db.query.watches.findFirst({
    where: eq(watches.id, id),
  });

  if (!existing) {
    throw new Error("관람 기록을 찾을 수 없습니다");
  }

  if (existing.userId !== userId) {
    throw new Error("본인의 기록만 삭제할 수 있습니다");
  }

  await db.delete(watches).where(eq(watches.id, id));
  revalidatePath("/");
  revalidatePath(`/cinema/${cinemaId}`);
}
