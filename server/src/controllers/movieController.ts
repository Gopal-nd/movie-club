import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { tmdbApi } from '../config/tmdb';

export const searchMovies = async (req: Request, res: Response) => {
  try {
    const { query, page = 1 } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Search TMDB API
    const tmdbResults = await tmdbApi.searchMovies(query as string, page as number);
    
    // Transform TMDB results to match our schema
    const movies = tmdbResults.results.map((movie: any) => ({
      id: movie.id.toString(),
      title: movie.title,
      genres: movie.genre_ids || [],
      releaseYear: new Date(movie.release_date).getFullYear(),
      synopsis: movie.overview,
      posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      averageRating: movie.vote_average || 0,
      ratingsCount: movie.vote_count || 0,
    }));

    res.json({
      movies,
      totalPages: tmdbResults.total_pages,
      totalResults: tmdbResults.total_results,
      currentPage: page
    });
  } catch (error) {
    console.error('Search movies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMovieDetails = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;

    // Get movie details from TMDB
    const tmdbMovie = await tmdbApi.getMovieDetails(movieId);
    
    // Check if movie exists in our database
    let localMovie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        reviews: {
          include: {
            user: {
              select: { username: true, profilePicture: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { reviews: true, watchlistedBy: true }
        }
      }
    });

    // If movie doesn't exist locally, create it
    if (!localMovie) {
      const movieData = {
        id: tmdbMovie.id.toString(),
        title: tmdbMovie.title,
        genres: tmdbMovie.genres?.map((g: any) => g.name) || [],
        releaseYear: new Date(tmdbMovie.release_date).getFullYear(),
        director: tmdbMovie.credits?.crew?.find((c: any) => c.job === 'Director')?.name,
        cast: tmdbMovie.credits?.cast?.slice(0, 10).map((c: any) => ({
          name: c.name,
          role: c.character
        })) || [],
        synopsis: tmdbMovie.overview,
        posterUrl: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : null,
        trailers: tmdbMovie.videos?.results?.filter((v: any) => v.type === 'Trailer').map((v: any) => v.key) || [],
        averageRating: tmdbMovie.vote_average || 0,
        ratingsCount: tmdbMovie.vote_count || 0,
      };

      localMovie = await prisma.movie.create({
        data: movieData,
        include: {
          reviews: {
            include: {
              user: {
                select: { username: true, profilePicture: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: { reviews: true, watchlistedBy: true }
          }
        }
      });
    }

    // Add TMDB specific data
    const movieWithTMDB = {
      ...localMovie,
      tmdb: {
        backdropUrl: tmdbMovie.backdrop_path ? `https://image.tmdb.org/t/p/original${tmdbMovie.backdrop_path}` : null,
        runtime: tmdbMovie.runtime,
        budget: tmdbMovie.budget,
        revenue: tmdbMovie.revenue,
        status: tmdbMovie.status,
        originalLanguage: tmdbMovie.original_language,
        productionCompanies: tmdbMovie.production_companies,
        videos: tmdbMovie.videos?.results || [],
        images: tmdbMovie.images || {},
      }
    };

    res.json({ movie: movieWithTMDB });
  } catch (error) {
    console.error('Get movie details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPopularMovies = async (req: Request, res: Response) => {
  try {
    const { page = 1 } = req.query;

    const tmdbResults = await tmdbApi.getPopularMovies(page as number);
    
    const movies = tmdbResults.results.map((movie: any) => ({
      id: movie.id.toString(),
      title: movie.title,
      genres: movie.genre_ids || [],
      releaseYear: new Date(movie.release_date).getFullYear(),
      synopsis: movie.overview,
      posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      averageRating: movie.vote_average || 0,
      ratingsCount: movie.vote_count || 0,
    }));

    res.json({
      movies,
      totalPages: tmdbResults.total_pages,
      totalResults: tmdbResults.total_results,
      currentPage: page
    });
  } catch (error) {
    console.error('Get popular movies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTopRatedMovies = async (req: Request, res: Response) => {
  try {
    const { page = 1 } = req.query;

    const tmdbResults = await tmdbApi.getTopRatedMovies(page as number);
    
    const movies = tmdbResults.results.map((movie: any) => ({
      id: movie.id.toString(),
      title: movie.title,
      genres: movie.genre_ids || [],
      releaseYear: new Date(movie.release_date).getFullYear(),
      synopsis: movie.overview,
      posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      averageRating: movie.vote_average || 0,
      ratingsCount: movie.vote_count || 0,
    }));

    res.json({
      movies,
      totalPages: tmdbResults.total_pages,
      totalResults: tmdbResults.total_results,
      currentPage: page
    });
  } catch (error) {
    console.error('Get top rated movies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMovieGenres = async (req: Request, res: Response) => {
  try {
    const genres = await tmdbApi.getMovieGenres();
    res.json({ genres: genres.genres });
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
