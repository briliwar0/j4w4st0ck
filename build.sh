#!/bin/bash

# Build script for Cloudflare Pages deployment

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file for build-time environment variables
echo "Creating .env file for build..."
touch .env
# Add necessary environment variables (these will be overridden by Cloudflare Pages)
echo "NODE_ENV=production" >> .env
echo "# Placeholder DATABASE_URL (will be replaced by Cloudflare environment variables)" >> .env
echo "DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder" >> .env

# Create build directory if it doesn't exist
mkdir -p dist

# Build the frontend with fixed base path for Cloudflare Pages
echo "Building frontend with Vite..."
npx vite build --base=/

# Copy public files to dist directory
echo "Copying public files to dist..."
cp -r public/* dist/ || true

# Ensure functions directory is published correctly
if [ -d "functions" ]; then
  echo "Setting up functions directory..."
  # For Cloudflare Pages compatibility
  mkdir -p dist/functions
  cp -r functions/* dist/functions/ || true
fi

# Create or update _redirects file for SPA routing
echo "Setting up SPA routing..."
echo "/* /index.html 200" > dist/_redirects

# Create a _headers file if it doesn't exist
if [ ! -f "dist/_headers" ]; then
  echo "Creating _headers file..."
  cat > dist/_headers << EOL
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
EOL
fi

# Create a basic _routes.json if it doesn't exist
if [ ! -f "dist/_routes.json" ]; then
  echo "Creating _routes.json file..."
  cat > dist/_routes.json << EOL
{
  "version": 1,
  "include": ["/*"],
  "exclude": []
}
EOL
fi

echo "Listing files in dist directory for verification:"
ls -la dist/

echo "Build completed successfully!"