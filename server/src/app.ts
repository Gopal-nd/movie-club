import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import moviesRouter from "./routes/movies";
import reviewsRouter from "./routes/reviews";
import WatchlistRouter from "./routes/watchlist";
import { rateLimit } from "express-rate-limit";
const app = express();

const limiter = rateLimit({
  windowMs: 5 * 1000, // 15 minutes
  limit: 4, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
});
app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/api/auth", authRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/watchlist", WatchlistRouter);

app.use(limiter);
app.use("/api/movies", moviesRouter);

app.get("/", (req, res) => {
  res.send("alive");
});
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
