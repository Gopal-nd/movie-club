#!/bin/bash

echo "🎬 Movie Club Backend Setup"
echo "=========================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your database credentials"
    echo "   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/movie_club"
    echo "   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production"
    echo ""
    read -p "Press Enter after editing .env file..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
bun run db:generate

# Check if database is running
echo "🗄️  Checking database connection..."
if ! nc -z localhost 5432; then
    echo "⚠️  Database not running. Starting with Docker..."
    docker-compose up -d postgres
    echo "⏳ Waiting for database to be ready..."
    sleep 10
fi

# Push database schema
echo "📊 Setting up database schema..."
bun run db:push

echo "✅ Setup complete! Starting development server..."
echo "🚀 Server will be available at http://localhost:3001"
echo "🏥 Health check at http://localhost:3001/health"
echo "📱 API docs at http://localhost:3001/api"
echo ""
echo "Press Ctrl+C to stop the server"

# Start development server
bun run dev
