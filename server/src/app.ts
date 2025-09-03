import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import moviesRouter from "./routes/movies";
import reviewsRouter from "./routes/reviews";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/api/auth", authRouter);
app.use("/api/movies", moviesRouter);
app.use("/api/reviews", reviewsRouter);

// Watchlist API endpoints
app.get("/api/watchlist", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // For now, return empty watchlist since we don't have a watchlist system implemented
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
    console.error("Error fetching watchlist:", error);
    res.status(500).json({ error: "Failed to fetch watchlist" });
  }
});

app.post("/api/watchlist", async (req, res) => {
  try {
    const { movieId } = req.body;

    // For now, return a mock watchlist item
    const mockWatchlistItem = {
      id: `watchlist_${Date.now()}`,
      movieId: parseInt(movieId),
      userId: "mock_user_id",
      addedAt: new Date().toISOString(),
    };

    res.status(201).json(mockWatchlistItem);
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    res.status(500).json({ error: "Failed to add to watchlist" });
  }
});

app.delete("/api/watchlist/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;

    // For now, just return success
    res.json({ message: "Removed from watchlist successfully" });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    res.status(500).json({ error: "Failed to remove from watchlist" });
  }
});

app.get("/api/watchlist/check/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;

    // For now, always return false since we don't have a watchlist system implemented
    res.json({ inWatchlist: false });
  } catch (error) {
    console.error("Error checking watchlist:", error);
    res.status(500).json({ error: "Failed to check watchlist" });
  }
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
