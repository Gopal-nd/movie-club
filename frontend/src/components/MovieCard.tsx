import { Link } from '@tanstack/react-router'
import { Heart, Star } from 'lucide-react'
import { useAppStore } from '../store'
import { tmdbAPI } from '../services/api'
import type { Movie } from '../types'
import Button from './ui/Button'

interface MovieCardProps {
  movie: Movie
  showWatchlistButton?: boolean
  className?: string
}

export default function MovieCard({
  movie,
  showWatchlistButton = true,
  className = '',
}: MovieCardProps) {
  const {
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isAuthenticated,
  } = useAppStore()
  const inWatchlist = isInWatchlist(movie.id)

  const handleWatchlistToggle = () => {
    if (!isAuthenticated) {
      // Redirect to login or show auth modal
      return
    }

    if (inWatchlist) {
      removeFromWatchlist(movie.id)
    } else {
      addToWatchlist(movie)
    }
  }

  return (
    <div
      className={`group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={tmdbAPI.getMoviePoster(movie.poster_path, 'w500')}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder-movie.jpg'
          }}
        />

        {/* Overlay with rating */}
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          {movie?.vote_average}
        </div>

        {/* Watchlist Button */}
        {showWatchlistButton && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 left-2 bg-black/70 text-white hover:bg-black/90 transition-all duration-200 ${
              inWatchlist ? 'text-red-500' : 'text-white'
            }`}
            onClick={handleWatchlistToggle}
          >
            <Heart className={`w-4 h-4 ${inWatchlist ? 'fill-current' : ''}`} />
          </Button>
        )}
      </div>

      {/* Movie Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {movie.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>{new Date(movie.release_date).getFullYear()}</span>
          {/* <span>{movie.vote_count.toLocaleString()} votes</span> */}
        </div>

        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {movie.overview}
        </p>

        {/* Genres */}
        {movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {movie.genres.slice(0, 2).map((genre) => (
              <span
                key={genre.id}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Link overlay for navigation */}
      <Link
        to="/movies/$movieId"
        params={{ movieId: movie?.id?.toString() }}
        className="absolute inset-0 z-10 cursor-pointer"
        aria-label={`View details for ${movie.title}`}
      />
    </div>
  )
}
