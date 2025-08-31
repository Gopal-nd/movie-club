import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAppStore } from '../store'
import { moviesAPI } from '../services/api'
import MovieCard from '../components/MovieCard'
import SearchBar from '../components/SearchBar'
import Button from '../components/ui/Button'
import { Loader2, Filter, Grid, List } from 'lucide-react'
import type { Movie, Genre, MovieFilters } from '../types'

export const Route = createFileRoute('/movies')({
  component: MoviesPage,
})

function MoviesPage() {
  const { movies, setMovies, filters: globalFilters } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [genres, setGenres] = useState<Genre[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [localFilters, setLocalFilters] = useState<MovieFilters>({})

  useEffect(() => {
    fetchGenres()
  }, [])

  useEffect(() => {
    fetchMovies()
  }, [currentPage, localFilters])

  const fetchGenres = async () => {
    try {
      const genresData = await moviesAPI.getGenres()
      setGenres(genresData)
    } catch (err) {
      console.error('Error fetching genres:', err)
    }
  }

  const fetchMovies = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await moviesAPI.getMovies(localFilters, currentPage, 20)
      setMovies(response.data)
      setTotalPages(response.totalPages)
    } catch (err) {
      setError('Failed to load movies. Please try again later.')
      console.error('Error fetching movies:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setLocalFilters(prev => ({ ...prev, searchQuery: query }))
    setCurrentPage(1)
  }

  const handleFiltersChange = (filters: MovieFilters) => {
    setLocalFilters(filters)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearAllFilters = () => {
    setLocalFilters({})
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Movies</h1>
          <p className="text-gray-600">Discover and explore thousands of movies</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <SearchBar
            onSearch={handleSearch}
            onFiltersChange={handleFiltersChange}
            genres={genres}
          />
        </div>

        {/* View Controls and Results */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {movies.length} movies found
            </span>
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Clear Filters */}
          {(localFilters.genre || localFilters.year || localFilters.rating || localFilters.searchQuery) && (
            <Button variant="outline" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Loading movies...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchMovies}>
              Try Again
            </Button>
          </div>
        )}

        {/* Movies Grid/List */}
        {!isLoading && !error && movies.length > 0 && (
          <>
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
                : 'space-y-4'
            }`}>
              {movies.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie}
                  className={viewMode === 'list' ? 'flex-row aspect-auto' : ''}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    if (totalPages <= 5) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      )
                    }
                    
                    // Show first, last, current, and neighbors
                    if (page === 1 || page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      )
                    }
                    
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2">...</span>
                    }
                    
                    return null
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!isLoading && !error && movies.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No movies found</h2>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={clearAllFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
