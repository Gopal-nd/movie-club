import { da } from "zod/locales";
import { prisma } from "./database";

// TMDB API configuration
export const TMDB_API_KEY = "08c445d6706403919504ea14c3e2c2a0";
export const TMDB_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwOGM0NDVkNjcwNjQwMzkxOTUwNGVhMTRjM2UyYzJhMCIsIm5iZiI6MTc1NjYyNTU1NS4xNDIwMDAyLCJzdWIiOiI2OGIzZmE5MzVhZmY5OTQ3ZTMzOTc5Y2IiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.uOw05vSZl9jpcxpE9mYRJ2diiVvIum3sJXhheSDpKNg";
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-jwt-key-change-in-production";

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TMDBMovieDetails extends TMDBMovie {
  backdrop_path: string | null;
  vote_count: number;
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  credits: any;
  videos: any;
}

export interface TMDBResponse {
  results: TMDBMovie[];
  total_results: number;
  total_pages: number;
}

export interface TMDBGenresResponse {
  genres: Array<{ id: number; name: string }>;
}

// Helper function to fetch from TMDB API
export async function fetchFromTMDB<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const finalData = (await response.json()) as Promise<TMDBResponse>;
  try {
    const data = await finalData;
    data.results &&
      data.results.map(async (movie: TMDBMovie) => {
        const raw = await fetchFromTMDB<Movie>(`/movie/${movie.id}`, {
          append_to_response: "credits,videos,images",
        });
        const available = await prisma.movie.findUnique({
          where: {
            movieId: Number(raw.id),
          },
        });
        if (!available) {
          const newMovie = await prisma.movie.create({
            data: {
              movieId: raw.id,
              imdbId: raw.imdb_id,
              title: raw.title,
              originalTitle: raw.original_title,
              originalLanguage: raw.original_language,
              overview: raw.overview,
              tagline: raw.tagline,
              homepage: raw.homepage,
              status: raw.status,
              releaseDate: raw.release_date ? new Date(raw.release_date) : null,
              runtime: raw.runtime,
              budget: raw.budget ? BigInt(raw.budget) : null,
              revenue: raw.revenue ? BigInt(raw.revenue) : null,
              popularity: raw.popularity,
              voteAverage: raw.vote_average,
              voteCount: raw.vote_count,
              video: raw.video,
              posterPath: raw.poster_path,
              backdropPath: raw.backdrop_path,
              genres: raw.genres.map((g) => g.name),
              originCountries: raw.origin_country,
              spokenLanguages: raw.spoken_languages.map((l) => l.english_name),
              productionCountries: raw.production_countries.map((c) => c.name),
            },
          });
        }
      });
  } catch (error) {
    console.log("error in the  fetching move", error);
  }
  // console.log(data.results.map((movie: TMDBMovie) => movie.id));

  return finalData as T;
}

export type Movie = {
  id: number; // This is TMDB's movie ID
  imdb_id?: string;
  title: string;
  original_title: string;
  original_language: string;
  overview?: string;
  tagline?: string;
  homepage?: string;
  status: string;
  release_date?: string; // date as string "YYYY-MM-DD"
  runtime?: number;
  budget?: number;
  revenue?: number;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  video: boolean;
  poster_path?: string;
  backdrop_path?: string;
  genres: { id: number; name: string }[];
  origin_country: string[];
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
};
