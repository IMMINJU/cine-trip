import type { NaverSearchItem, NaverSearchResponse } from "@/types";
import { stripHtmlTags } from "./utils";

export async function searchPlaces(query: string): Promise<NaverSearchItem[]> {
  const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error("Failed to search places");
  }

  const data: NaverSearchResponse = await response.json();

  return data.items.map((item) => ({
    ...item,
    title: stripHtmlTags(item.title),
  }));
}

export function convertNaverCoords(mapx: string, mapy: string): { lat: number; lng: number } {
  const lng = parseInt(mapx, 10) / 10000000;
  const lat = parseInt(mapy, 10) / 10000000;
  return { lat, lng };
}
