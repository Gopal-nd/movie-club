import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { movieId } = req.params;
    const { rating, text } = req.body;
    const userId = req.user!.id;

    // Check if user has already reviewed this movie
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this movie' });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        movieId,
        rating,
        text
      },
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true
          }
        }
      }
    });

    // Update movie average rating
    await updateMovieRating(movieId);

    res.status(201).json({ review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { movieId } = req.params;
    const { rating, text } = req.body;
    const userId = req.user!.id;

    // Find existing review
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Update review
    const review = await prisma.review.update({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      },
      data: {
        rating,
        text
      },
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true
          }
        }
      }
    });

    // Update movie average rating
    await updateMovieRating(movieId);

    res.json({ review });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { movieId } = req.params;
    const userId = req.user!.id;

    // Find existing review
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Delete review
    await prisma.review.delete({
      where: {
        userId_movieId: {
          userId,
          movieId
        }
      }
    });

    // Update movie average rating
    await updateMovieRating(movieId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserReviews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
            releaseYear: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ reviews });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to update movie rating
async function updateMovieRating(movieId: string) {
  const reviews = await prisma.review.findMany({
    where: { movieId },
    select: { rating: true }
  });

  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await prisma.movie.update({
      where: { id: movieId },
      data: {
        averageRating,
        ratingsCount: reviews.length
      }
    });
  }
}
