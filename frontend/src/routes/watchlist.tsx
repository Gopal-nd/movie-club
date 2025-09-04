import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAppStore } from '../store'
import MovieCard from '../components/MovieCard'
import Button from '../components/ui/Button'
import { Heart, Plus } from 'lucide-react'

export const Route = createFileRoute('/watchlist')({
  component: WatchlistPage,
})

function WatchlistPage() {
  const { user, isAuthenticated, watchlist } = useAppStore()
  console.log(watchlist)
  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login'
      return
    }
  }, [isAuthenticated])

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading watchlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                My Watchlist
              </h1>
              <p className="text-gray-600">
                {watchlist.length} movie{watchlist.length !== 1 ? 's' : ''} in
                your watchlist
              </p>
            </div>
          </div>
        </div>

        {/* Watchlist Content */}
        {watchlist.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg shadow-md p-12 max-w-md mx-auto">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your watchlist is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Start building your watchlist by adding movies you want to watch
                later.
              </p>
              <div className="space-y-3">
                <Button variant="outline">
                  <a href="/movies" className="flex items-center gap-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Browse Movies
                  </a>
                </Button>
                <p className="text-sm text-gray-500">
                  Discover new movies and add them to your watchlist
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Watchlist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {watchlist.map((item) => (
                <div key={item.id} className="relative group">
                  <MovieCard movie={item.movie!} showWatchlistButton={false} />

                  {/* Added Date */}
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Watchlist Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Watchlist Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {watchlist.length}
                  </div>
                  <p className="text-gray-600">Total Movies</p>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {
                      watchlist.filter(
                        (item) =>
                          item.movie?.vote_average &&
                          item.movie.vote_average >= 7,
                      ).length
                    }
                  </div>
                  <p className="text-gray-600">Highly Rated (7+ stars)</p>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {
                      new Set(
                        watchlist.map((item) =>
                          new Date(
                            item.movie?.release_date || '',
                          ).getFullYear(),
                        ),
                      ).size
                    }
                  </div>
                  <p className="text-gray-600">Different Years</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
