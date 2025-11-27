import { NextRequest, NextResponse } from "next/server";

interface TMDBMovieResult {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDBSearchResponse {
  page: number;
  results: TMDBMovieResult[];
  total_pages: number;
  total_results: number;
}

// TMDB 장르 ID → 우리 앱 장르 매핑
const TMDB_GENRE_MAP: Record<number, string> = {
  28: "액션",      // Action
  12: "액션",      // Adventure
  16: "애니메이션", // Animation
  35: "코미디",    // Comedy
  80: "공포/스릴러", // Crime
  99: "기타",      // Documentary
  18: "드라마",    // Drama
  10751: "기타",   // Family
  14: "SF/판타지", // Fantasy
  36: "드라마",    // History
  27: "공포/스릴러", // Horror
  10402: "기타",   // Music
  9648: "공포/스릴러", // Mystery
  10749: "로맨스", // Romance
  878: "SF/판타지", // Science Fiction
  10770: "드라마", // TV Movie
  53: "공포/스릴러", // Thriller
  10752: "액션",   // War
  37: "액션",      // Western
};

function mapGenre(genreIds: number[]): string | null {
  for (const id of genreIds) {
    if (TMDB_GENRE_MAP[id]) {
      return TMDB_GENRE_MAP[id];
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "query parameter is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
        query
      )}&language=ko-KR&page=1`,
      {
        headers: {
          accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data: TMDBSearchResponse = await response.json();

    // 클라이언트용 데이터 정리
    const items = data.results.slice(0, 10).map((movie) => ({
      id: movie.id,
      title: movie.title,
      originalTitle: movie.original_title,
      posterUrl: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      releaseDate: movie.release_date,
      year: movie.release_date ? movie.release_date.split("-")[0] : null,
      overview: movie.overview,
      rating: movie.vote_average,
      genre: mapGenre(movie.genre_ids),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Movie Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search movies" },
      { status: 500 }
    );
  }
}
