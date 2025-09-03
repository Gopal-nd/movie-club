import type { Request, Response } from "express";
import { prisma } from "../config/database";
import fs from "fs/promises";
import {
  fetchFromTMDB,
  TMDB_IMAGE_BASE_URL,
  type Movie,
  type TMDBGenresResponse,
  type TMDBMovie,
  type TMDBMovieDetails,
  type TMDBResponse,
} from "../config/tmdb";

export const featuredMovies = async (req: Request, res: Response) => {
  try {
    const data = await fetchFromTMDB<TMDBResponse>("/movie/popular", {
      page: "1",
    });
    const movies = data.results.slice(0, 6).map((movie: TMDBMovie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
        : null,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genre_ids: movie.genre_ids,
    }));
    res.json(movies);
  } catch (error) {
    console.error("Error fetching featured movies:", error);
    res.status(500).json({ error: "Failed to fetch featured movies" });
  }
};

export const trendingMovies = async (req, res) => {
  try {
    const data = await fetchFromTMDB<TMDBResponse>("/trending/movie/week", {
      page: "1",
    });
    const movies = data.results.slice(0, 6).map((movie: TMDBMovie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
        : null,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genre_ids: movie.genre_ids,
    }));
    res.json(movies);
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    res.status(500).json({ error: "Failed to fetch trending movies" });
  }
};

export const moviesList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      genre,
      year,
      rating,
      sortBy,
      search,
    } = req.query;

    let endpoint = "/discover/movie";
    let params: Record<string, string> = {
      page: page.toString(),
      sort_by: "popularity.desc",
    };

    // Apply genre filter
    if (genre) {
      params.with_genres = genre.toString();
    }

    // Apply year filter
    if (year) {
      params.primary_release_year = year.toString();
    }

    // Apply rating filter
    if (rating) {
      params["vote_average.gte"] = rating.toString();
    }

    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case "title":
          params.sort_by = "title.asc";
          break;
        case "rating":
          params.sort_by = "vote_average.desc";
          break;
        case "release_date":
          params.sort_by = "primary_release_date.desc";
          break;
        default:
          params.sort_by = "popularity.desc";
      }
    }

    // If search query is provided, use search endpoint instead
    if (search) {
      endpoint = "/search/movie";
      params.query = search?.toString();
      delete params.with_genres;
      delete params.primary_release_year;
      delete params["vote_average.gte"];
      delete params.sort_by;
    }

    const data = await fetchFromTMDB<TMDBResponse>(endpoint, params);

    const movies = data.results.map((movie: TMDBMovie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
        : null,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genre_ids: movie.genre_ids,
    }));

    res.json({
      data: movies,
      pagination: {
        page: parseInt(page.toString()),
        limit: parseInt(limit.toString()),
        total: data.total_results,
        totalPages: data.total_pages,
      },
    });
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
};

export const moviesSearch = async (req, res) => {
  try {
    const { q: query, page = 1, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Query parameter required" });
    }

    const data = await fetchFromTMDB<TMDBResponse>("/search/movie", {
      query: query.toString(),
      page: page.toString(),
    });

    data.results.map(async (movie: TMDBMovie) => {
      await fetchFromTMDB<TMDBMovie>(`/movie/${movie.id}`);
    });
    const movies = data.results.map((movie: TMDBMovie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
        : null,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genre_ids: movie.genre_ids,
    }));

    res.json({
      data: movies,
      pagination: {
        page: parseInt(page.toString()),
        limit: parseInt(limit.toString()),
        total: data.total_results,
        totalPages: data.total_pages,
      },
    });
  } catch (error) {
    console.error("Error searching movies:", error);
    res.status(500).json({ error: "Failed to search movies" });
  }
};

export const moviesGenres = async (req: Request, res: Response) => {
  try {
    const data = await fetchFromTMDB<TMDBGenresResponse>("/genre/movie/list");
    res.json(data.genres);
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(500).json({ error: "Failed to fetch genres" });
  }
};

// Generic movie route - using TMDB movie details
export const getMovieDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const raw = await fetchFromTMDB<Movie>(`/movie/${id}`, {
      append_to_response: "credits,videos,images",
    });

    const movie = {
      id: raw.id,
      title: raw.title,
      overview: raw.overview,
      poster_path: raw.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${raw.poster_path}`
        : null,
      backdrop_path: raw.backdrop_path
        ? `https://image.tmdb.org/t/p/original${raw.backdrop_path}`
        : null,
      release_date: raw.release_date,
      vote_average: raw.vote_average,
      vote_count: raw.vote_count,
      runtime: raw.runtime,
      genres: raw.genres,
    };

    res.json(movie);
  } catch (error) {
    console.error("Error fetching movie details:", error);
    res.status(500).json({ error: "Failed to fetch movie details" });
  }
};
