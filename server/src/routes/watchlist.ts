import { Router } from "express";
import {
  addToWatchlist,
  removeFromWatchlist,
  getUserWatchlist,
  checkWatchlistStatus,
} from "../controllers/watchlistController";
import { auth } from "../middleware/auth";

const router = Router();

// All watchlist routes require authentication
router.use(auth);

router.post("/:movieId", auth, addToWatchlist);
router.delete("/:movieId", auth, removeFromWatchlist);
router.get("/", auth, getUserWatchlist);
router.get("/check/:movieId", auth, checkWatchlistStatus);

export default router;
