import { Router } from "express";
import {
  addToWatchlist,
  removeFromWatchlist,
  getUserWatchlist,
  checkWatchlistStatus,
} from "../controllers/watchlistController";
import { auth } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { movieSchemas } from "../middleware/validation";

const router = Router();

// All watchlist routes require authentication
router.use(auth);

router.post("/:movieId", auth, addToWatchlist);
router.delete("/:movieId", auth, removeFromWatchlist);
router.get("/", auth, getUserWatchlist);
router.get("/:movieId/status", auth, checkWatchlistStatus);

export default router;
