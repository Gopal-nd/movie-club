import { Router } from "express";
import {
  getMovieDetails,
  featuredMovies,
  trendingMovies,
  moviesList,
  moviesSearch,
  moviesGenres,
} from "../controllers/movieController";
import { validateRequest } from "../middleware/validation";
import { movieSchemas } from "../middleware/validation";

const router = Router();

router.get("/featured", featuredMovies);

// Trending movies endpoint - using TMDB trending movies
router.get("/trending", trendingMovies);

// Main movies endpoint with TMDB integration
router.get("/", moviesList);

// Search movies endpoint - using TMDB search
// router.get("/search", moviesSearch);

// Get movie genres from TMDB
router.get("/genres", moviesGenres);

// Generic movie route - using TMDB movie details
router.get("/:id", getMovieDetails);

export default router;
