import type { Genre, CinemaBrand, SortOption, User } from "@/types";

export const GENRES: Genre[] = [
  "액션",
  "로맨스",
  "코미디",
  "공포/스릴러",
  "SF/판타지",
  "드라마",
  "애니메이션",
  "기타",
];

export const CINEMA_BRANDS: CinemaBrand[] = [
  "CGV",
  "메가박스",
  "롯데시네마",
  "독립/예술영화관",
  "기타",
];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "rating", label: "별점순" },
  { value: "name", label: "이름순" },
];

export const USERS: User[] = [
  { id: "minju", name: "민주" },
  { id: "guest", name: "Guest", readonly: true },
];
