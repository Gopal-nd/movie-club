export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string
  backdrop_path: string
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  genres?: Genre[]
  runtime?: number
  status?: string
  tagline?: string
  trailer?: string
}

export interface Genre {
  id: number
  name: string
}

export interface Cast {
  id: number
  name: string
  character: string
  profile_path: string
  order: number
}

export interface Review {
  id: string
  movieId: number
  userId: string
  rating: number
  text: string
  createdAt: string
  updatedAt: string
  user?: User
}

export interface User {
  joinDate?: string
  id: string
  email: string
  username: string
  avatar?: string
}

export interface WatchlistItem {
  id: string
  movieId: number
  userId: string
  addedAt: string
  movie?: Movie
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  joinDate?: string
}

export interface MovieFilters {
  genre?: number
  year?: number
  rating?: number
  sortBy?: 'popularity' | 'rating' | 'release_date' | 'title'
  searchQuery?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  reviews: T[]
  total: number
  data: any
  page: number
  limit: number
  totalPages: number
}
