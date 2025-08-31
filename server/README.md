# Movie Club Backend API

A modular Node.js/Express backend for the Movie Club application with TMDB integration and user authentication.

## 🏗️ Architecture

The backend follows a clean, modular architecture:

```
src/
├── config/          # Configuration files (database, TMDB API)
├── controllers/     # Business logic handlers
├── middleware/      # Custom middleware (auth, validation)
├── routes/          # Route definitions
└── app.ts          # Main Express application
```

## 🚀 Features

- **User Authentication**: JWT-based auth with email/password
- **TMDB Integration**: Movie search, details, and metadata
- **Movie Reviews**: User ratings and reviews system
- **Watchlist Management**: Personal movie collections
- **Data Validation**: Zod schema validation
- **Database**: PostgreSQL with Prisma ORM
- **Security**: Password hashing, JWT tokens, CORS

## 📋 Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- TMDB API key (already configured)

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Environment setup:**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Database setup:**
   ```bash
   bun run db:generate    # Generate Prisma client
   bun run db:push        # Push schema to database
   ```

4. **Start development server:**
   ```bash
   bun run dev
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Movies
- `GET /api/movies/search?query=...` - Search movies
- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/top-rated` - Get top rated movies
- `GET /api/movies/genres` - Get movie genres
- `GET /api/movies/:movieId` - Get movie details

### Reviews
- `POST /api/reviews/:movieId` - Create review (protected)
- `PUT /api/reviews/:movieId` - Update review (protected)
- `DELETE /api/reviews/:movieId` - Delete review (protected)
- `GET /api/reviews/user` - Get user reviews (protected)

### Watchlist
- `POST /api/watchlist/:movieId` - Add to watchlist (protected)
- `DELETE /api/watchlist/:movieId` - Remove from watchlist (protected)
- `GET /api/watchlist` - Get user watchlist (protected)
- `GET /api/watchlist/:movieId/status` - Check watchlist status (protected)

## 🔐 Authentication

Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Schema

The application uses Prisma with the following models:
- **User**: Authentication and profile data
- **Movie**: Movie information and metadata
- **Review**: User movie reviews and ratings
- **Watchlist**: User movie collections

## 🎬 TMDB Integration

The backend integrates with The Movie Database (TMDB) API to provide:
- Movie search functionality
- Detailed movie information
- Cast and crew details
- Movie posters and images
- Trailer videos

## 🧪 Development

```bash
# Development with hot reload
bun run dev

# Production build
bun run build
bun run start

# Database operations
bun run db:studio    # Open Prisma Studio
bun run db:migrate   # Run migrations
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment mode | development |

## 📝 API Response Format

### Success Response
```json
{
  "data": {...},
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": {...}
}
```

## 🚨 Error Handling

The API includes comprehensive error handling:
- Input validation errors
- Authentication errors
- Database errors
- TMDB API errors
- Generic server errors

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS configuration
- Input validation and sanitization
- Protected route middleware

## 📈 Performance

- Database connection pooling
- Efficient Prisma queries
- TMDB API caching considerations
- Request logging and monitoring
