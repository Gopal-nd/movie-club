import { Router, type Request, type Response } from "express";
import {
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
} from "../controllers/reviewController";
import { auth } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { reviewSchemas } from "../middleware/validation";

const router = Router();

// Reviews API endpoints
router.get("/movie/:movieId", async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // For now, return empty reviews since we don't have a reviews system implemented
    // In a real app, you would query the database for reviews
    res.json({
      data: [],
      pagination: {
        page: parseInt(page.toString()),
        limit: parseInt(limit.toString()),
        total: 0,
        totalPages: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching movie reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});
router.get("/user", auth, getUserReviews);

router.post("/", auth, createReview);

router.put("/api/reviews/:reviewId", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    // For now, return a mock updated review
    const mockReview = {
      id: reviewId,
      movieId: 1,
      userId: "mock_user_id",
      rating: parseInt(rating),
      comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.json(mockReview);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
});

router.delete("/api/reviews/:reviewId", async (req, res) => {
  try {
    const { reviewId } = req.params;

    // For now, just return success since we don't have a reviews system implemented
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
