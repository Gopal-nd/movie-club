import { Router } from 'express';
import {
  searchMovies,
  getMovieDetails,
  getPopularMovies,
  getTopRatedMovies,
  getMovieGenres
} from '../controllers/movieController';
import { validateRequest } from '../middleware/validation';
import { movieSchemas } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/search', validateRequest(movieSchemas.search), searchMovies);
router.get('/popular', getPopularMovies);
router.get('/top-rated', getTopRatedMovies);
router.get('/genres', getMovieGenres);
router.get('/:movieId', validateRequest(movieSchemas.movieId), getMovieDetails);

export default router;
