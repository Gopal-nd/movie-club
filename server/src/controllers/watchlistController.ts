import { type Response, type Request } from "express";
import { prisma } from "../config/database";

export const addToWatchlist = async (req: Request, res: Response) => {
  try {
    let { movieId } = req.body;
    if (!movieId) {
      return res.status(400).json({ error: "Movie ID is required" });
    }
    console.log(movieId);
    const userId = req.user!.id;

    // Check if movie is already in watchlist
    const existingWatchlist = await prisma.watchlist.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId: Number(movieId),
        },
      },
    });

    if (existingWatchlist) {
      return res
        .status(400)
        .json({ error: "Movie is already in your watchlist" });
    }

    // Add to watchlist
    const watchlistItem = await prisma.watchlist.create({
      data: {
        userId,
        movieId: Number(movieId),
      },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            posterPath: true,
            releaseDate: true,
            genres: true,
            voteAverage: true,
          },
        },
      },
    });

    res.status(201).json({ watchlistItem });
  } catch (error) {
    console.error("Error checking watchlist:", error);
    res.status(500).json({ error: "Failed to check watchlist" });
  }
};

export const removeFromWatchlist = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;
    if (!movieId) {
      return res.status(400).json({ error: "Movie ID is required" });
    }
    const userId = req.user!.id;

    // Check if movie exists in watchlist
    const existingWatchlist = await prisma.watchlist.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId: Number(movieId),
        },
      },
    });

    if (!existingWatchlist) {
      return res.status(404).json({ error: "Movie not found in watchlist" });
    }

    // Remove from watchlist
    await prisma.watchlist.delete({
      where: {
        userId_movieId: {
          userId,
          movieId: Number(movieId),
        },
      },
    });

    res.json({ message: "Movie removed from watchlist" });
  } catch (error) {
    console.error("Remove from watchlist error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserWatchlist = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user!.id;

    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { addedAt: "desc" },
    });

    res.json({ watchlist });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    res.status(500).json({ error: "Failed to fetch watchlist" });
  }
};

export const checkWatchlistStatus = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;
    if (!movieId) {
      return res.status(400).json({ error: "Movie ID is required" });
    }
    const userId = req.user!.id;

    const watchlistItem = await prisma.watchlist.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId: Number(movieId),
        },
      },
    });

    res.json({ isInWatchlist: !!watchlistItem });
  } catch (error) {
    console.error("Check watchlist status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
