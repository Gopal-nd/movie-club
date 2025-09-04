import { Router, type Request, type Response } from "express";
import {
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  getMoviereviews,
} from "../controllers/reviewController";
import { auth } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { reviewSchemas } from "../middleware/validation";

const router = Router();

// Reviews API endpoints
router.get("/movie/:movieId", getMoviereviews);
router.get("/user", auth, getUserReviews);

router.post("/", auth, createReview);

router.put("/:reviewId", auth, updateReview);

router.delete("/:reviewId", auth, deleteReview);

export default router;
