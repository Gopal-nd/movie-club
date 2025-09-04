import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAppStore } from '../store'
import { authAPI, reviewsAPI, watchlistAPI } from '../services/api'
import MovieCard from '../components/MovieCard'
import StarRating from '../components/StarRating'
import Button from '../components/ui/Button'
import { User, Star, Heart, Settings, LogOut, Edit, Trash2 } from 'lucide-react'
import type { Review, WatchlistItem } from '../types'
import WatchListMovieCard from '@/components/watchListedCard'

export const Route = createFileRoute('/profile' as any)({
  component: ProfilePage,
})

function ProfilePage() {
  const { user, isAuthenticated, logout, userReviews, watchlist } =
    useAppStore()
  const [activeTab, setActiveTab] = useState<
    'profile' | 'reviews' | 'watchlist'
  >('profile')
  const [reviews, setReviews] = useState<any>()
  const [watchlists, setWatchlists] = useState<any>()

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login'
      return
    }
  }, [isAuthenticated])
  const userActivity = async () => {
    try {
      const watchList = await watchlistAPI.getWatchlist()
      setWatchlists(watchList?.watchlist)
      const review = await reviewsAPI.getUserReviews()
      setReviews(review?.reviews)
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    userActivity()
  }, [])
  const handleLogout = async () => {
    try {
      await logout()
      // Redirect to home
      window.location.href = '/'
    } catch (err) {
      console.error('Error logging out:', err)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      await reviewsAPI.deleteReview(reviewId)
      // The store will be updated automatically
    } catch (err) {
      console.error('Error deleting review:', err)
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }
  console.log(reviews, watchlists)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12" />
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.username}
              </h1>
              <p className="">{user.email}</p>
              <p className="mb-4">
                Joined on :
                {new Date(user.joinDate as string).toLocaleDateString()}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{reviews?.length} reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>{watchlists?.length} in watchlist</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'reviews', label: 'Reviews', icon: Star },
                { id: 'watchlist', label: 'Watchlist', icon: Heart },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'profile' && <ProfileTab user={user} />}

          {activeTab === 'reviews' && (
            <ReviewsTab reviews={reviews} onDeleteReview={handleDeleteReview} />
          )}

          {activeTab === 'watchlist' && <WatchlistTab watchlist={watchlists} />}
        </div>
      </div>
    </div>
  )
}

// Profile Tab Component
function ProfileTab({ user }: { user: any }) {
  const [name, setName] = useState<string>(user.username)
  const { setUser } = useAppStore()
  const { user: loginUser } = useAppStore()
  const handleNameChange = async () => {
    if (name.length < 4) return
    await authAPI.updateUser(name)
    setUser({
      ...user,
      username: name,
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 "
          />
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={handleNameChange} disabled={name.length < 3}>
          <Settings className="w-4 h-4 mr-2" />
          Update Profile
        </Button>
      </div>
    </div>
  )
}

// Reviews Tab Component
function ReviewsTab({
  reviews,
  onDeleteReview,
}: {
  reviews: any
  onDeleteReview: (id: string) => void
}) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No reviews yet
        </h3>
        <p className="text-gray-500">
          Start reviewing movies to see them here!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Your Reviews</h2>

      <div className="space-y-4">
        {reviews.map((review: any) => (
          <div
            key={review.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div>
              <h1>Movie Name : {review.movie.title}</h1>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <StarRating rating={review.rating} readonly size="sm" />
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.text}</p>
              </div>

              <Link
                to="/movies/$movieId"
                params={{ movieId: review.movie?.movieId?.toString() }}
                aria-label={`View details for ${review.movie.title}`}
              >
                <Button size="sm">view</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Watchlist Tab Component
function WatchlistTab({ watchlist }: { watchlist: WatchlistItem[] }) {
  if (watchlist.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Your watchlist is empty
        </h3>
        <p className="text-gray-500">Start adding movies to your watchlist!</p>
      </div>
    )
  } // <MovieCard
  //   key={item.id}
  //   movie={item.movie}
  //   showWatchlistButton={false}
  // />

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Your Watchlist</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {watchlist.map((item) => (
          <p>
            <WatchListMovieCard key={item.id} movie={item.movie!} />
          </p>
        ))}
      </div>
    </div>
  )
}
