import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AuthState,
  Movie,
  WatchlistItem,
  Review,
  MovieFilters,
} from '../types'

interface AppState extends AuthState {
  // Auth actions
  login: (user: AuthState['user'], token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void

  // Movies
  movies: Movie[]
  featuredMovies: Movie[]
  trendingMovies: Movie[]
  setMovies: (movies: Movie[]) => void
  setFeaturedMovies: (movies: Movie[]) => void
  setTrendingMovies: (movies: Movie[]) => void

  // Watchlist
  watchlist: WatchlistItem[]
  addToWatchlist: (movie: Movie) => void
  removeFromWatchlist: (movieId: number) => void
  isInWatchlist: (movieId: number) => boolean

  // Reviews
  reviews: Review[]
  userReviews: Review[]
  addReview: (review: Review) => void
  updateReview: (reviewId: string, updates: Partial<Review>) => void
  deleteReview: (reviewId: string) => void

  // Filters
  filters: MovieFilters
  setFilters: (filters: Partial<MovieFilters>) => void
  clearFilters: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      movies: [],
      featuredMovies: [],
      trendingMovies: [],
      watchlist: [],
      reviews: [],
      userReviews: [],
      filters: {},

      // Auth actions
      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          watchlist: [],
          userReviews: [],
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Movies
      setMovies: (movies) => set({ movies }),
      setFeaturedMovies: (movies) => set({ featuredMovies: movies }),
      setTrendingMovies: (movies) => set({ trendingMovies: movies }),

      // Watchlist
      addToWatchlist: (movie) => {
        const { watchlist, user } = get()
        if (!user) return

        const existingItem = watchlist.find((item) => item.movieId === movie.id)
        if (!existingItem) {
          const newItem: WatchlistItem = {
            id: Date.now().toString(),
            movieId: movie.id,
            userId: user.id,
            addedAt: new Date().toISOString(),
            movie,
          }
          set({ watchlist: [...watchlist, newItem] })
        }
      },

      removeFromWatchlist: (movieId) => {
        const { watchlist } = get()
        console.log('watchlist', watchlist)
        const newWatchList = watchlist.filter(
          (item) => item.movieId !== movieId,
        )
        console.log('updated watchlist', newWatchList)
        set({ watchlist: watchlist.filter((item) => item.movieId !== movieId) })
      },

      isInWatchlist: (movieId) => {
        const { watchlist } = get()
        return watchlist.some((item) => item.movieId === movieId)
      },

      // Reviews
      addReview: (review) => {
        const { reviews, userReviews } = get()
        set({
          reviews: [...reviews, review],
          userReviews: [...userReviews, review],
        })
      },

      updateReview: (reviewId, updates) => {
        const { reviews, userReviews } = get()
        const updatedReviews = reviews.map((review) =>
          review.id === reviewId ? { ...review, ...updates } : review,
        )
        const updatedUserReviews = userReviews.map((review) =>
          review.id === reviewId ? { ...review, ...updates } : review,
        )
        set({ reviews: updatedReviews, userReviews: updatedUserReviews })
      },

      deleteReview: (reviewId) => {
        const { reviews, userReviews } = get()
        set({
          reviews: reviews.filter((review) => review.id !== reviewId),
          userReviews: userReviews.filter((review) => review.id !== reviewId),
        })
      },

      // Filters
      setFilters: (filters) => {
        const currentFilters = get().filters
        set({ filters: { ...currentFilters, ...filters } })
      },

      clearFilters: () => set({ filters: {} }),
    }),
    {
      name: 'movie-club-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        watchlist: state.watchlist,
        userReviews: state.userReviews,
        filters: state.filters,
      }),
    },
  ),
)
