import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAppStore } from '../store'
import { moviesAPI } from '../services/api'
import MovieCard from '../components/MovieCard'
import Button from '../components/ui/Button'
import { Play, Star, TrendingUp, Flame } from 'lucide-react'
import type { Movie } from '../types'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { featuredMovies, trendingMovies, setFeaturedMovies, setTrendingMovies } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch featured and trending movies
        const [featured, trending] = await Promise.all([
          moviesAPI.getFeaturedMovies(),
          moviesAPI.getTrendingMovies()
        ])
        
        setFeaturedMovies(featured)
        setTrendingMovies(trending)
      } catch (err) {
        setError('Failed to load movies. Please try again later.')
        console.error('Error fetching movies:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovies()
  }, [setFeaturedMovies, setTrendingMovies])
  console.log(featuredMovies, trendingMovies)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading amazing movies...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 h-full flex items-center justify-center text-center text-white">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Discover Amazing Movies
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Explore the latest releases, trending films, and hidden gems
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Play className="w-5 h-5 mr-2" />
                Browse Movies
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                Watchlist
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Movies Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Flame className="w-8 h-8 text-orange-500" />
            <h2 className="text-3xl font-bold text-gray-800">Featured Movies</h2>
          </div>
          
          {featuredMovies?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {featuredMovies &&featuredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No featured movies available</p>
            </div>
          )}
        </div>
      </section>

      {/* Trending Movies Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <h2 className="text-3xl font-bold text-gray-800">Trending Now</h2>
          </div>
          
          {trendingMovies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {trendingMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No trending movies available</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {featuredMovies.length + trendingMovies.length}+
              </div>
              <p className="text-gray-600">Movies Available</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {Math.max(...featuredMovies.map(m => m.vote_average), 0).toFixed(1)}
              </div>
              <p className="text-gray-600">Average Rating</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {new Date().getFullYear()}
              </div>
              <p className="text-gray-600">Latest Releases</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
