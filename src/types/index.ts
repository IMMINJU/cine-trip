export type Genre =
  | "액션"
  | "로맨스"
  | "코미디"
  | "공포/스릴러"
  | "SF/판타지"
  | "드라마"
  | "애니메이션"
  | "기타";

export type CinemaBrand =
  | "CGV"
  | "메가박스"
  | "롯데시네마"
  | "독립/예술영화관"
  | "기타";

export type SortOption = "latest" | "rating" | "name";

export interface User {
  id: string;
  name: string;
  readonly?: boolean;
}

export interface NaverSearchItem {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
}

export interface NaverSearchResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverSearchItem[];
}

export interface CinemaWithWatches {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  brand: string | null;
  isFavorite: boolean;
  createdAt: Date;
  watches: WatchRecord[];
  averageRating: number | null;
  watchCount: number;
}

export interface WatchRecord {
  id: string;
  cinemaId: string;
  userId: string | null;
  movieTitle: string;
  genre: string | null;
  rating: string | null;
  comment: string | null;
  posterUrl: string | null;
  watchedAt: string;
  createdAt: Date;
}
