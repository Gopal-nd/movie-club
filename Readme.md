# 🎬 Movie Club – Movie Review Platform

A **Full Stack Movie Review Platform** where users can browse movies, read/write reviews, add ratings, and manage a personal watchlist.
Built with **React (TanStack Router, Context API), Express.js, Prisma ORM, PostgreSQL, and TMDB API**.

🚀 **Live Demo:**

- **Frontend:** [Movie Club (Vercel)](https://movie-club-rho.vercel.app/)
- **Backend API:** [Movies API (Render)](https://movies-club.onrender.com/)

---

## 📌 Features

### 🔹 Frontend (React + TanStack Router)

- Responsive **Home Page** with featured & trending movies
- **Movie Listing Page** with search and filter (genre, year, rating)
- **Movie Details Page**: trailers, cast, reviews, and ratings
- **User Profile Page**: review history + watchlist
- **Review Submission** with star rating + text
- **Watchlist Management** (add/remove movies)
- **State Management** using React Context
- **API Integration** with TMDB & custom backend
- **Error Handling & Loading States**
- **Authentication** (login/register with JWT)

### 🔹 Backend (Node.js + Express + Prisma + PostgreSQL)

- RESTful API with clean routing & controllers
- Endpoints for movies, reviews, users, and watchlists
- Prisma ORM with **PostgreSQL**
- JWT Authentication & role-based access (admin, user)
- Input validation & error handling
- Rate limiting for security
- Average ratings stored & updated efficiently

---

## 🗂️ Database Schema

**Movies**

- id, title, genre, releaseYear, synopsis, posterUrl, averageRating

**Users**

- id, username, email, password (hashed), profilePicture, joinDate

**Reviews**

- id, userId, movieId, rating (1–5), reviewText, createdAt

**Watchlist**

- id, userId, movieId, addedAt

---

## 🔑 API Endpoints

### Movies

- `GET /movies` → Get all movies (pagination + filters)
- `GET /movies/:id` → Get movie details + reviews
- `POST /movies` → Add movie (admin only)

### Reviews

- `GET /movies/:id/reviews` → Get reviews for a movie
- `POST /movies/:id/reviews` → Add review

### Users

- `GET /users/:id` → Get user profile + reviews
- `PUT /users/:id` → Update profile
- `GET /users/:id/watchlist` → Get watchlist
- `POST /users/:id/watchlist` → Add movie to watchlist
- `DELETE /users/:id/watchlist/:movieId` → Remove movie

### Auth

- `POST /auth/register` → Register new user
- `POST /auth/login` → Login & get JWT

---

## ⚙️ Setup & Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/gopal-nd/movie-club.git
cd movie-club
```

### 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your_jwt_secret"
TMDB_API_KEY="your_tmdb_api_key"
PORT=3001
```

Run migrations & seed data:

```bash
npx prisma migrate dev
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL="https://movies-club.onrender.com"
```

Start frontend:

```bash
npm run dev
```

---

## 📦 Tech Stack

**Frontend:** React, TanStack Router, Context API, TailwindCSS
**Backend:** Node.js, Express.js, Prisma ORM
**Database:** PostgreSQL
**APIs:** TMDB API integration
**Deployment:** Vercel (frontend), Render (backend)
**Auth:** JWT-based authentication
**Other:** Rate limiting, error handling, clean architecture

---

## 🧪 Evaluation Highlights

- ✅ Clean, modular code with best practices
- ✅ RESTful API with proper validation & error handling
- ✅ Prisma + PostgreSQL schema design with relationships
- ✅ JWT authentication & authorization
- ✅ Responsive UI/UX with React + TanStack Router
- ✅ Pagination, filters, caching for performance
- ✅ Deployed on **Vercel & Render**

---

## ✨ Bonus Features (Implemented)

- Integration with **TMDB API** for posters & details
- **Rate limiting** for backend security
- **Watchlist management** per user
