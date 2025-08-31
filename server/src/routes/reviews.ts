import { Router } from 'express';
import {
  createReview,
  updateReview,
  deleteReview,
  getUserReviews
} from '../controllers/reviewController';
import { auth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { reviewSchemas } from '../middleware/validation';

const router = Router();

// All review routes require authentication
router.use(auth);

router.post('/:movieId', validateRequest(reviewSchemas.create), createReview);
router.put('/:movieId', validateRequest(reviewSchemas.create), updateReview);
router.delete('/:movieId', validateRequest(reviewSchemas.movieId), deleteReview);
router.get('/user', getUserReviews);

export default router;
