"use server";

import { db } from "@/db";
import { cinemas, watches } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { CinemaBrand, SortOption, CinemaWithWatches, WatchRecord } from "@/types";

export async function getCinemas(
  brand?: CinemaBrand | null,
  sort: SortOption = "latest"
): Promise<CinemaWithWatches[]> {
  const result = await db.query.cinemas.findMany({
    with: {
      watches: {
        orderBy: [desc(watches.watchedAt)],
      },
    },
    where: brand ? eq(cinemas.brand, brand) : undefined,
    orderBy:
      sort === "latest"
        ? [desc(cinemas.createdAt)]
        : sort === "name"
        ? [asc(cinemas.name)]
        : undefined,
  });

  // 관람 기록이 있는 영화관만 필터링
  const withWatches = result.filter((c) => c.watches.length > 0);

  const mapped = withWatches.map((c) => {
    const ratings = c.watches
      .filter((w) => w.rating !== null)
      .map((w) => parseFloat(w.rating!));
    const averageRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null;

    return {
      ...c,
      watches: c.watches.map((w) => ({
        id: w.id,
        cinemaId: w.cinemaId,
        userId: w.userId,
        movieTitle: w.movieTitle,
        genre: w.genre,
        rating: w.rating,
        comment: w.comment,
        posterUrl: w.posterUrl,
        watchedAt: w.watchedAt,
        createdAt: w.createdAt,
      })) as WatchRecord[],
      averageRating,
      watchCount: c.watches.length,
    };
  });

  if (sort === "rating") {
    return mapped.sort((a, b) => {
      if (a.averageRating === null && b.averageRating === null) return 0;
      if (a.averageRating === null) return 1;
      if (b.averageRating === null) return -1;
      return b.averageRating - a.averageRating;
    });
  }

  return mapped;
}

export async function getCinemaById(id: string): Promise<CinemaWithWatches | null> {
  const result = await db.query.cinemas.findFirst({
    where: eq(cinemas.id, id),
    with: {
      watches: {
        orderBy: [desc(watches.watchedAt)],
      },
    },
  });

  if (!result) return null;

  const ratings = result.watches
    .filter((w) => w.rating !== null)
    .map((w) => parseFloat(w.rating!));
  const averageRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null;

  return {
    ...result,
    watches: result.watches.map((w) => ({
      id: w.id,
      cinemaId: w.cinemaId,
      userId: w.userId,
      movieTitle: w.movieTitle,
      genre: w.genre,
      rating: w.rating,
      comment: w.comment,
      posterUrl: w.posterUrl,
      watchedAt: w.watchedAt,
      createdAt: w.createdAt,
    })) as WatchRecord[],
    averageRating,
    watchCount: result.watches.length,
  };
}

export async function createCinema(data: {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  brand?: string | null;
}) {
  // 같은 이름과 주소의 영화관이 있는지 확인
  const existing = await db.query.cinemas.findFirst({
    where: eq(cinemas.name, data.name),
  });

  if (existing) {
    return existing;
  }

  const [cinema] = await db
    .insert(cinemas)
    .values({
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      brand: data.brand ?? null,
    })
    .returning();

  revalidatePath("/");
  return cinema;
}

export async function deleteCinema(id: string) {
  await db.delete(cinemas).where(eq(cinemas.id, id));
  revalidatePath("/");
}

export async function toggleFavorite(id: string) {
  const cinema = await db.query.cinemas.findFirst({
    where: eq(cinemas.id, id),
  });

  if (!cinema) return null;

  const [updated] = await db
    .update(cinemas)
    .set({ isFavorite: !cinema.isFavorite })
    .where(eq(cinemas.id, id))
    .returning();

  revalidatePath("/");
  revalidatePath(`/cinema/${id}`);
  return updated;
}
