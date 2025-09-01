// File: /movies/$movieId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAppStore } from '../store'
import { moviesAPI, reviewsAPI, tmdbAPI } from '../services/api'
import MovieCard from '../components/MovieCard'
import StarRating from '../components/StarRating'
import Button from '../components/ui/Button'
import { Heart, Play, Star, Clock, Calendar, Users, MessageCircle, Plus } from 'lucide-react'
import type { Movie, Review, Cast } from '../types'

// Fix 1: Remove the type assertion and use proper route definition
export const Route = createFileRoute('/movies/$movieId')({
  component: MovieDetailPage,
  // Fix 2: Add proper parameter validation
  validateSearch: (search: Record<string, unknown>) => search,
  // Fix 3: Optional - add loader for better data fetching
  // loader: async ({ params }) => {
  //   const movieId = parseInt(params.movieId)
  //   return await moviesAPI.getMovie(movieId)
  // }
})

function MovieDetailPage() {
  // Fix 4: Use the proper hook for getting params
  const { movieId } = Route.useParams()
  const { user, isAuthenticated, isInWatchlist, addToWatchlist, removeFromWatchlist } = useAppStore()
  
  const [movie, setMovie] = useState<Movie | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [cast, setCast] = useState<Cast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [userReview, setUserReview] = useState<Review | null>(null)

  useEffect(() => {
    // Fix 5: Add proper dependency and error handling
    if (movieId) {
      fetchMovieDetails()
      fetchReviews()
      fetchCast()
    }
  }, [movieId])

  const fetchMovieDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // Fix 6: Use movieId directly from params
      const movieData = await moviesAPI.getMovie(parseInt(movieId))
      setMovie(movieData)
    } catch (err) {
      setError('Failed to load movie details. Please try again later.')
      console.error('Error fetching movie:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const reviewsData = await reviewsAPI.getMovieReviews(parseInt(movieId))
      setReviews(reviewsData.data)
      
      // Check if user has already reviewed this movie
      if (isAuthenticated && user) {
        const existingReview = reviewsData.data.find(review => review.userId === user.id)
        if (existingReview) {
          setUserReview(existingReview)
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
    }
  }

  const fetchCast = async () => {
    try {
      // This would be implemented in your backend API
      // For now, we'll use mock data
      setCast([])
    } catch (err) {
      console.error('Error fetching cast:', err)
    }
  }

  const handleWatchlistToggle = () => {
    if (!isAuthenticated) {
      // Redirect to login or show auth modal
      return
    }

    if (movie) {
      if (isInWatchlist(movie.id)) {
        removeFromWatchlist(movie.id)
      } else {
        addToWatchlist(movie)
      }
    }
  }

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!movie || !isAuthenticated) return

    try {
      if (userReview) {
        // Update existing review
        await reviewsAPI.updateReview(userReview.id, rating, comment)
        setUserReview({ ...userReview, rating, comment })
      } else {
        // Create new review
        const newReview = await reviewsAPI.createReview(movie.id, rating, comment)
        setUserReview(newReview)
        setReviews(prev => [newReview, ...prev])
      }
      setShowReviewForm(false)
    } catch (err) {
      console.error('Error submitting review:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading movie details...</p>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error || 'Movie not found'}</p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const inWatchlist = isInWatchlist(movie.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Backdrop */}
      <div className="relative h-96 lg:h-[500px] overflow-hidden">
        <img
          src={tmdbAPI.getBackdropImage(movie.backdrop_path, 'w1280')}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Movie Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 items-end">
              {/* Poster */}
              <div className="flex-shrink-0">
                <img
                  src={tmdbAPI.getMoviePoster(movie.poster_path, 'w500')}
                  alt={movie.title}
                  className="w-48 h-72 rounded-lg shadow-2xl"
                />
              </div>
              
              {/* Movie Details */}
              <div className="flex-1">
                <h1 className="text-4xl lg:text-6xl font-bold mb-4">{movie.title}</h1>
                {movie.tagline && (
                  <p className="text-xl text-gray-300 mb-4 italic">"{movie.tagline}"</p>
                )}
                
                <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                    <span className="text-gray-300">({movie.vote_count.toLocaleString()} votes)</span>
                  </div>
                  
                  {movie.release_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(movie.release_date).getFullYear()}</span>
                    </div>
                  )}
                  
                  {movie.runtime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{movie.runtime} min</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-white/20 text-white rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="bg-red-600 hover:bg-red-700">
                    <Play className="w-5 h-5 mr-2" />
                    Watch Trailer
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleWatchlistToggle}
                    className={`border-white text-white hover:bg-white hover:text-gray-900 ${
                      inWatchlist ? 'bg-white text-gray-900' : ''
                    }`}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${inWatchlist ? 'fill-current' : ''}`} />
                    {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
          <p className="text-gray-700 text-lg leading-relaxed max-w-4xl">
            {movie.overview}
          </p>
        </section>

        {/* Cast Section */}
        {cast.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {cast.slice(0, 12).map((member) => (
                <div key={member.id} className="text-center">
                  <img
                    src={tmdbAPI.getProfileImage(member.profile_path, 'w185')}
                    alt={member.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                  />
                  <p className="font-medium text-sm text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-600">{member.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
            {isAuthenticated && !userReview && (
              <Button onClick={() => setShowReviewForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Write Review
              </Button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Write Your Review</h3>
              <ReviewForm
                onSubmit={handleReviewSubmit}
                onCancel={() => setShowReviewForm(false)}
                initialRating={0}
                initialComment=""
              />
            </div>
          )}

          {/* User's Existing Review */}
          {userReview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-900">Your Review</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReviewForm(true)}
                >
                  Edit
                </Button>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <StarRating rating={userReview.rating} readonly size="sm" />
                <span className="text-sm text-gray-600">
                  {new Date(userReview.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{userReview.comment}</p>
            </div>
          )}

          {/* Other Reviews */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews
                .filter(review => !userReview || review.id !== userReview.id)
                .map((review) => (
                  <div key={review.id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {review.user?.username || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} readonly size="sm" />
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No reviews yet. Be the first to review this movie!</p>
            </div>
          )}
        </section>

        {/* Similar Movies Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Movies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {/* This would be populated with similar movies from your API */}
            <div className="text-center py-8 text-gray-500">
              <p>Similar movies will appear here</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

// Review Form Component
interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => void
  onCancel: () => void
  initialRating: number
  initialComment: string
}

function ReviewForm({ onSubmit, onCancel, initialRating, initialComment }: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating)
  const [comment, setComment] = useState(initialComment)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return

    setIsSubmitting(true)
    try {
      await onSubmit(rating, comment)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <StarRating
          rating={rating}
          onRatingChange={setRating}
          size="lg"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Share your thoughts about this movie..."
          required
        />
      </div>
      
      <div className="flex gap-3">
        <Button type="submit" disabled={rating === 0 || isSubmitting} isLoading={isSubmitting}>
          Submit Review
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}