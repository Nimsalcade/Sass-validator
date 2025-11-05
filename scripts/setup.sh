#!/bin/bash

# Project Setup Script
# This script helps new developers set up the project locally

set -e

echo "🚀 Setting up your development environment..."

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    echo "✅ Node.js $(node -v) found"
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        echo "❌ pnpm is not installed. Installing pnpm..."
        npm install -g pnpm
    else
        echo "✅ pnpm $(pnpm -v) found"
    fi
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        echo "⚠️  PostgreSQL is not installed or not in PATH"
        echo "Please install PostgreSQL: https://www.postgresql.org/download/"
        echo "And ensure pgvector extension is available"
    else
        echo "✅ PostgreSQL found"
    fi
    
    # Check Redis
    if ! command -v redis-cli &> /dev/null; then
        echo "⚠️  Redis is not installed or not in PATH"
        echo "Please install Redis: https://redis.io/download"
    else
        echo "✅ Redis found"
    fi
}

# Setup environment
setup_environment() {
    echo "🔧 Setting up environment..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            echo "✅ Created .env file from .env.example"
            echo "⚠️  Please edit .env file with your configuration values"
        else
            echo "❌ .env.example file not found"
            exit 1
        fi
    else
        echo "✅ .env file already exists"
    fi
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    pnpm install
    echo "✅ Dependencies installed"
}

# Setup database
setup_database() {
    echo "🗄️  Setting up database..."
    
    # Check if DATABASE_URL is set
    if grep -q "DATABASE_URL=\"postgresql://username:password@localhost:5432/database_name\"" .env; then
        echo "⚠️  Please update DATABASE_URL in .env file with your database credentials"
        echo "Then run: pnpm run migrate:dev"
    else
        echo "✅ DATABASE_URL appears to be configured"
        
        # Ask if user wants to run migrations
        read -p "Run database migrations? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            pnpm run generate
            pnpm run migrate:dev
            
            # Ask if user wants to seed the database
            read -p "Seed the database with sample data? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                pnpm run seed
            fi
        fi
    fi
}

# Final checks
final_checks() {
    echo "🔍 Performing final checks..."
    
    # Check if environment variables are properly set
    if [ -f ".env" ]; then
        # Check for required variables
        required_vars=("NEXTAUTH_SECRET" "GOOGLE_CLIENT_ID" "OPENAI_API_KEY")
        missing_vars=()
        
        for var in "${required_vars[@]}"; do
            if grep -q "$var=\"your-" .env || grep -q "$var=\"\"" .env; then
                missing_vars+=("$var")
            fi
        done
        
        if [ ${#missing_vars[@]} -gt 0 ]; then
            echo "⚠️  The following environment variables need to be configured:"
            printf '  %s\n' "${missing_vars[@]}"
        else
            echo "✅ Environment variables appear to be configured"
        fi
    fi
}

# Success message
success_message() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update your .env file with actual values"
    echo "2. Ensure PostgreSQL and Redis are running"
    echo "3. Run 'pnpm run migrate:dev' if you haven't already"
    echo "4. Run 'pnpm run dev' to start the development server"
    echo ""
    echo "Useful commands:"
    echo "  pnpm run dev          - Start development server"
    echo "  pnpm run build        - Build for production"
    echo "  pnpm run lint         - Run linting"
    echo "  pnpm run test         - Run tests"
    echo "  pnpm run db:studio    - Open Prisma Studio"
    echo ""
    echo "For more information, see README.md"
}

# Main execution
main() {
    check_requirements
    setup_environment
    install_dependencies
    setup_database
    final_checks
    success_message
}

# Run main function
main "$@"
