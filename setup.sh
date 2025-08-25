#!/bin/bash

# SmokeTest Development Setup Script
# This script sets up the development environment for the Chinese character learning app

set -e  # Exit on any error

echo "🚀 Setting up SmokeTest Development Environment"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (version 18+) first:"
    echo "   - Visit: https://nodejs.org/"
    echo "   - Or use a version manager like nvm"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="18.0.0"

# Simple version comparison (assumes semantic versioning)
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    echo "✅ Node.js $NODE_VERSION detected (required: $REQUIRED_VERSION+)"
else
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to $REQUIRED_VERSION+"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available. Please install npm."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL environment variable is not set."
    echo ""
    echo "Please set up your database connection:"
    echo "1. For local PostgreSQL:"
    echo "   export DATABASE_URL=\"postgresql://username:password@localhost:5432/smoketest\""
    echo ""
    echo "2. For cloud database (Railway, Supabase, etc.):"
    echo "   export DATABASE_URL=\"your_cloud_database_url\""
    echo ""
    echo "3. Create a .env file in the project root:"
    echo "   echo 'DATABASE_URL=\"your_database_url\"' > .env"
    echo ""
    echo "After setting DATABASE_URL, run this script again."
    exit 1
fi

echo "✅ DATABASE_URL is configured"

# Test database connection
echo "🔗 Testing database connection..."
if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed. Please check your DATABASE_URL:"
    echo "   Current: $DATABASE_URL"
    echo ""
    echo "Make sure your database server is running and accessible."
    exit 1
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Seed the database with initial data
echo "🌱 Seeding database with initial data..."
npm run db:seed

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Open your browser to:"
echo "   http://localhost:3000"
echo ""
echo "3. Optional - Open Prisma Studio to view data:"
echo "   npx prisma studio"
echo ""
echo "📚 Documentation:"
echo "- README.md - Project overview and architecture"
echo "- OPERATIONS.md - Database and deployment operations"
echo "- DATABASE.md - Database setup and management"
echo ""
echo "🛠️  Useful commands:"
echo "- npm run dev          - Start development server"
echo "- npm run build        - Build for production"
echo "- npm run type-check   - Run TypeScript checks"
echo "- npm run lint         - Run ESLint"
echo "- npm run db:seed      - Reseed database"
echo "- npm run db:reset     - Reset database (⚠️  destructive)"
echo ""
echo "Happy coding! 🎨"