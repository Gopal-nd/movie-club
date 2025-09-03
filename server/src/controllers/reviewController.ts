import type { Request, Response } from "express";
import { prisma } from "../config/database";

export const createReview = async (req: Request, res: Response) => {
  try {
    let { rating, comment, movieId } = req.body;
    console.log(req.body);
    movieId = parseInt(movieId);
    if (!movieId) {
      return res.status(400).json({ error: "Movie ID is required" });
    }
    const userId = req.user!.id;
    console.log(userId, movieId, rating, comment);

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this movie" });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        text: comment,
        movieId,
        userId: userId,
      },
    });

    res.status(201).json({ review });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getMoviereviews = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;
    if (!movieId) {
      return res.status(400).json({ error: "Movie ID is required" });
    }
    const reviews = await prisma.review.findMany({
      where: { movieId: Number(movieId) },
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Get movie reviews error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateReview = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;
    const { rating, text } = req.body;
    const userId = req.user!.id;
    if (!movieId) {
      return res.status(400).json({ error: "Movie ID is required" });
    }
    // Find existing review
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId: Number(movieId),
        },
      },
    });

    if (!existingReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Update review
    const review = await prisma.review.update({
      where: {
        userId_movieId: {
          userId,
          movieId: Number(movieId),
        },
      },
      data: {
        rating,
        text,
      },
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
      },
    });

    res.json({ review });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;
    const userId = req.user!.id;

    // Find existing review
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId: Number(movieId),
        },
      },
    });

    if (!existingReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Delete review
    await prisma.review.delete({
      where: {
        userId_movieId: {
          userId,
          movieId: Number(movieId),
        },
      },
    });

    // Update movie average rating
    // await updateMovieRating(movieId);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            posterPath: true,
            releaseDate: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ reviews });
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
