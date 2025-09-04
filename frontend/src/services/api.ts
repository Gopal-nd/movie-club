import axios from 'axios'
import type {
  Movie,
  Review,
  User,
  WatchlistItem,
  MovieFilters,
  PaginatedResponse,
} from '../types'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('movie-club-storage')
    if (token) {
      try {
        const parsed = JSON.parse(token)
        if (parsed.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`
        }
      } catch (error) {
        console.error('Error parsing stored token:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('movie-club-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post<{ user: User; token: string }>(
      '/auth/login',
      {
        email,
        password,
      },
    )
    return response.data
  },

  register: async (username: string, email: string, password: string) => {
    const response = await api.post<{ user: User; token: string }>(
      '/auth/register',
      {
        username,
        email,
        password,
      },
    )
    return response.data
  },

  logout: async () => {
    await api.post('/auth/logout')
  },

  getProfile: async () => {
    const response = await api.get<User>('/auth/profile')
    return response.data
  },
}

// Movies API
export const moviesAPI = {
  getMovies: async (filters?: MovieFilters, page = 1, limit = 20) => {
    const params = new URLSearchParams()
    if (filters?.genre) params.append('genre', filters.genre.toString())
    if (filters?.year) params.append('year', filters.year.toString())
    if (filters?.rating) params.append('rating', filters.rating.toString())
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.searchQuery) params.append('search', filters.searchQuery)
    params.append('page', page.toString())
    params.append('limit', limit.toString())

    const response = await api.get<PaginatedResponse<Movie>>(
      `/movies?${params}`,
    )
    return response.data
  },

  getMovie: async (id: number) => {
    const response = await api.get<Movie>(`/movies/${id}`)
    return response.data
  },

  getFeaturedMovies: async () => {
    const response = await api.get<Movie[]>('/movies/featured')
    return response.data
  },

  getTrendingMovies: async () => {
    const response = await api.get<Movie[]>('/movies/trending')
    return response.data
  },

  getGenres: async () => {
    const response =
      await api.get<{ id: number; name: string }[]>('/movies/genres')
    return response.data
  },

  searchMovies: async (query: string, page = 1) => {
    const response = await api.get<PaginatedResponse<Movie>>(
      `/movies/search?q=${query}&page=${page}`,
    )
    return response.data
  },
}

// Reviews API
export const reviewsAPI = {
  getMovieReviews: async (movieId: number, page = 1) => {
    const response = await api.get<PaginatedResponse<Review>>(
      `/reviews/movie/${movieId}?page=${page}`,
    )
    return response.data
  },

  getUserReviews: async (page = 1) => {
    const response = await api.get<PaginatedResponse<Review>>(
      `/reviews/user?page=${page}`,
    )
    return response.data
  },

  createReview: async (movieId: number, rating: number, comment: string) => {
    const response = await api.post<Review>('/reviews', {
      movieId,
      rating,
      comment,
    })
    return response.data
  },

  updateReview: async (
    reviewId: string,
    rating: number,
    text: string,
    movieId: number,
  ) => {
    const response = await api.put<Review>(`/reviews/${reviewId}`, {
      rating,
      text,
      movieId,
    })
    return response.data
  },

  deleteReview: async (reviewId: string) => {
    await api.delete(`/reviews/${reviewId}`)
  },
}

// Watchlist API
export const watchlistAPI = {
  getWatchlist: async (page = 1) => {
    const response = await api.get<PaginatedResponse<WatchlistItem>>(
      `/waasChildtchlist?page=${page}`,
    )
    return response.data
  },

  addToWatchlist: async (movieId: number) => {
    const response = await api.post<WatchlistItem>(`/watchlist/${movieId}`, {
      movieId,
    })
    return response.data
  },

  removeFromWatchlist: async (movieId: number) => {
    await api.delete(`/watchlist/${movieId}`)
  },

  isInWatchlist: async (movieId: number) => {
    const response = await api.get<{ isInWatchlist: boolean }>(
      `/watchlist/check/${movieId}`,
    )
    console.log(response.data)
    return response.data.isInWatchlist
  },
}

// TMDB API for movie posters and additional details
export const tmdbAPI = {
  getMoviePoster: (
    posterPath: string,
    size:
      | 'w92'
      | 'w154'
      | 'w185'
      | 'w342'
      | 'w500'
      | 'w780'
      | 'original' = 'w500',
  ) => {
    const baseUrl = 'https://image.tmdb.org/t/p'
    return `${baseUrl}/${size}${posterPath}`
  },

  getBackdropImage: (
    backdropPath: string,
    size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280',
  ) => {
    const baseUrl = 'https://image.tmdb.org/t/p'
    return `${baseUrl}/${size}${backdropPath}`
  },

  getProfileImage: (
    profilePath: string,
    size: 'w45' | 'w185' | 'h632' | 'original' = 'w185',
  ) => {
    const baseUrl = 'https://image.tmdb.org/t/p'
    return `${baseUrl}/${size}${profilePath}`
  },
}

export default api
