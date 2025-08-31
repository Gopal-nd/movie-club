# Movie Club Frontend

A modern React application for discovering, reviewing, and managing your movie watchlist.

## Features

- 🎬 **Home Page**: Featured movies and trending films with beautiful hero section
- 🔍 **Movie Search**: Advanced search and filtering by genre, year, rating, and more
- 📱 **Responsive Design**: Mobile-first design that works on all devices
- ⭐ **Review System**: Rate and review movies with star ratings and comments
- ❤️ **Watchlist Management**: Add/remove movies to your personal watchlist
- 👤 **User Profiles**: View your review history and watchlist
- 🔐 **Authentication**: Secure login/registration system
- 🎨 **Modern UI**: Beautiful design with Tailwind CSS and smooth animations

## Tech Stack

- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development
- **TanStack Router** - File-based routing
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client with interceptors
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Backend API running (see server directory)

### Installation

1. Install dependencies:
```bash
bun install
# or
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure environment variables:
```env
VITE_API_URL=http://localhost:3001/api
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

4. Start development server:
```bash
bun dev
# or
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # Base UI components (Button, etc.)
│   ├── MovieCard.tsx  # Movie display component
│   ├── SearchBar.tsx  # Search and filter component
│   └── StarRating.tsx # Star rating component
├── routes/             # Page components
│   ├── index.tsx      # Home page
│   ├── movies.tsx     # Movie listing page
│   ├── movies.$movieId.tsx # Individual movie page
│   ├── profile.tsx    # User profile page
│   ├── watchlist.tsx  # Watchlist page
│   ├── login.tsx      # Login page
│   └── register.tsx   # Registration page
├── store/              # Zustand state management
│   └── index.ts       # Main store configuration
├── services/           # API services
│   └── api.ts         # Axios instance and API methods
├── types/              # TypeScript type definitions
│   └── index.ts       # All interfaces and types
└── lib/                # Utility functions
    └── utils.ts        # Helper functions
```

## API Integration

The frontend is designed to work with a backend API that provides:

- **Authentication**: Login, registration, profile management
- **Movies**: CRUD operations, search, filtering
- **Reviews**: Create, read, update, delete reviews
- **Watchlist**: Add/remove movies from user watchlist

### Backend Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/movies` - Get movies with filters
- `GET /api/movies/:id` - Get movie details
- `GET /api/movies/featured` - Get featured movies
- `GET /api/movies/trending` - Get trending movies
- `POST /api/reviews` - Create review
- `GET /api/reviews/movie/:id` - Get movie reviews
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/:id` - Remove from watchlist

## State Management

The application uses Zustand for state management with the following stores:

- **Auth State**: User authentication, login/logout
- **Movies**: Movie data, featured/trending movies
- **Watchlist**: User's movie watchlist
- **Reviews**: Movie reviews and user reviews
- **Filters**: Search and filter state

## Styling

The application uses Tailwind CSS for styling with:

- Responsive design patterns
- Custom color schemes
- Smooth transitions and animations
- Component variants and states

## Development

### Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun preview` - Preview production build
- `bun lint` - Run ESLint
- `bun format` - Format code with Prettier

### Code Quality

- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Consistent component structure

## Deployment

1. Build the application:
```bash
bun build
```

2. Deploy the `dist` folder to your hosting service

3. Ensure environment variables are configured in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
