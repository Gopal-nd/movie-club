import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const addToWatchlist = async (req: AuthRequest, res: Response) => {
  try {
    const { movieId } = req.params;
    const userId = req.user!.id;

    // Check if movie is already in watchlist
    const existingWatchlist = await prisma.watchlist.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });

    if (existingWatchlist) {
      return res.status(400).json({ error: 'Movie is already in your watchlist' });
    }

    // Add to watchlist
    const watchlistItem = await prisma.watchlist.create({
      data: {
        userId,
        movieId
      },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
            releaseYear: true,
            genres: true,
            averageRating: true
          }
        }
      }
    });

    res.status(201).json({ watchlistItem });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeFromWatchlist = async (req: AuthRequest, res: Response) => {
  try {
    const { movieId } = req.params;
    const userId = req.user!.id;

    // Check if movie exists in watchlist
    const existingWatchlist = await prisma.watchlist.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });

    if (!existingWatchlist) {
      return res.status(404).json({ error: 'Movie not found in watchlist' });
    }

    // Remove from watchlist
    await prisma.watchlist.delete({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });

    res.json({ message: 'Movie removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserWatchlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
            releaseYear: true,
            genres: true,
            averageRating: true,
            ratingsCount: true,
            synopsis: true
          }
        }
      },
      orderBy: { addedAt: 'desc' }
    });

    res.json({ watchlist });
  } catch (error) {
    console.error('Get user watchlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkWatchlistStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { movieId } = req.params;
    const userId = req.user!.id;

    const watchlistItem = await prisma.watchlist.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });

    res.json({ isInWatchlist: !!watchlistItem });
  } catch (error) {
    console.error('Check watchlist status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
