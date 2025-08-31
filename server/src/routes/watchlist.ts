import { Router } from 'express';
import {
  addToWatchlist,
  removeFromWatchlist,
  getUserWatchlist,
  checkWatchlistStatus
} from '../controllers/watchlistController';
import { auth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { movieSchemas } from '../middleware/validation';

const router = Router();

// All watchlist routes require authentication
router.use(auth);

router.post('/:movieId', validateRequest(movieSchemas.movieId), addToWatchlist);
router.delete('/:movieId', validateRequest(movieSchemas.movieId), removeFromWatchlist);
router.get('/', getUserWatchlist);
router.get('/:movieId/status', validateRequest(movieSchemas.movieId), checkWatchlistStatus);

export default router;
