#!/bin/bash

# Build script for Cloudflare Pages deployment

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the frontend
echo "Building frontend..."
npm run build

# Copy public files to dist directory
echo "Copying public files to dist..."
cp -r public/* dist/

# Ensure functions directory is published
if [ -d "functions" ]; then
  echo "Copying functions directory..."
  cp -r functions dist/
fi

echo "Build completed successfully!"