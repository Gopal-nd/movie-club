import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const app = express();

// Initialize Prisma client
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// TMDB API configuration
const TMDB_API_KEY = '08c445d6706403919504ea14c3e2c2a0';
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwOGM0NDVkNjcwNjQwMzkxOTUwNGVhMTRjM2UyYzJhMCIsIm5iZiI6MTc1NjYyNTU1NS4xNDIwMDAyLCJzdWIiOiI2OGIzZmE5MzVhZmY5OTQ3ZTMzOTc5Y2IiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.uOw05vSZl9jpcxpE9mYRJ2diiVvIum3sJXhheSDpKNg';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-jwt-key-change-in-production';

// TMDB API response types
interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDBMovieDetails extends TMDBMovie {
  backdrop_path: string | null;
  vote_count: number;
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  credits: any;
  videos: any;
}

interface TMDBResponse {
  results: TMDBMovie[];
  total_results: number;
  total_pages: number;
}

interface TMDBGenresResponse {
  genres: Array<{ id: number; name: string }>;
}

// Helper function to fetch from TMDB API
async function fetchFromTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    // Validate input
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        joinDate: true,
        profilePicture: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      joinDate: user.joinDate,
      profilePicture: user.profilePicture
    };

    res.json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Featured movies endpoint - using TMDB popular movies
app.get('/api/movies/featured', async (req, res) => {
  try {
    const data = await fetchFromTMDB<TMDBResponse>('/movie/popular', { page: '1' });
    const movies = data.results.slice(0, 6).map((movie: TMDBMovie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genre_ids: movie.genre_ids
    }));
    res.json(movies);
  } catch (error) {
    console.error('Error fetching featured movies:', error);
    res.status(500).json({ error: 'Failed to fetch featured movies' });
  }
});

// Trending movies endpoint - using TMDB trending movies
app.get('/api/movies/trending', async (req, res) => {
  try {
    const data = await fetchFromTMDB<TMDBResponse>('/trending/movie/week', { page: '1' });
    const movies = data.results.slice(0, 6).map((movie: TMDBMovie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genre_ids: movie.genre_ids
    }));
    res.json(movies);
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
});

// Main movies endpoint with TMDB integration
app.get('/api/movies', async (req, res) => {
  try {
    const { page = 1, limit = 20, genre, year, rating, sortBy, search } = req.query;
    
    let endpoint = '/discover/movie';
    let params: Record<string, string> = {
      page: page.toString(),
      sort_by: 'popularity.desc'
    };

    // Apply genre filter
    if (genre) {
      params.with_genres = genre.toString();
    }

    // Apply year filter
    if (year) {
      params.primary_release_year = year.toString();
    }

    // Apply rating filter
    if (rating) {
      params['vote_average.gte'] = rating.toString();
    }

    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case 'title':
          params.sort_by = 'title.asc';
          break;
        case 'rating':
          params.sort_by = 'vote_average.desc';
          break;
        case 'release_date':
          params.sort_by = 'primary_release_date.desc';
          break;
        default:
          params.sort_by = 'popularity.desc';
      }
    }

    // If search query is provided, use search endpoint instead
    if (search) {
      endpoint = '/search/movie';
      params.query = search.toString();
      delete params.with_genres;
      delete params.primary_release_year;
      delete params['vote_average.gte'];
      delete params.sort_by;
    }

    const data = await fetchFromTMDB<TMDBResponse>(endpoint, params);
    
    const movies = data.results.map((movie: TMDBMovie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genre_ids: movie.genre_ids
    }));

    res.json({
      data: movies,
      pagination: {
        page: parseInt(page.toString()),
        limit: parseInt(limit.toString()),
        total: data.total_results,
        totalPages: data.total_pages
      }
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Search movies endpoint - using TMDB search
app.get('/api/movies/search', async (req, res) => {
  try {
    const { q: query, page = 1, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }
    
    const data = await fetchFromTMDB<TMDBResponse>('/search/movie', {
      query: query.toString(),
      page: page.toString()
    });

    const movies = data.results.map((movie: TMDBMovie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genre_ids: movie.genre_ids
    }));

    res.json({
      data: movies,
      pagination: {
        page: parseInt(page.toString()),
        limit: parseInt(limit.toString()),
        total: data.total_results,
        totalPages: data.total_pages
      }
    });
  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

// Get movie genres from TMDB
app.get('/api/movies/genres', async (req, res) => {
  try {
    const data = await fetchFromTMDB<TMDBGenresResponse>('/genre/movie/list');
    res.json(data.genres);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

// Generic movie route - using TMDB movie details
app.get('/api/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fetchFromTMDB<TMDBMovieDetails>(`/movie/${id}`, {
      append_to_response: 'credits,videos,images'
    });
    
    const movie = {
      id: data.id,
      title: data.title,
      overview: data.overview,
      poster_path: data.poster_path ? `${TMDB_IMAGE_BASE_URL}${data.poster_path}` : null,
      backdrop_path: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
      release_date: data.release_date,
      vote_average: data.vote_average,
      vote_count: data.vote_count,
      runtime: data.runtime,
      genres: data.genres,
      credits: data.credits,
      videos: data.videos
    };
    
    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
