#!/bin/bash
# Netlify build script for JawaStock

echo "Starting Netlify build for JawaStock..."

# Build the frontend and backend
echo "Building application..."
npm run build

# Create the functions directory if it doesn't exist
echo "Setting up Netlify functions..."
mkdir -p functions-build

# Process API routes for Netlify Functions
echo "Processing API routes for Netlify Functions..."
# Create the main API function that will handle all API routes
cat > functions-build/api.js << EOL
const { existsSync } = require('fs');
const path = require('path');

// Import the server API handler
const serverPath = path.join(__dirname, '../dist/index.js');

exports.handler = async (event, context) => {
  try {
    // Check if the server file exists
    if (!existsSync(serverPath)) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server implementation not found' })
      };
    }

    // Dynamically import the server
    const serverModule = await import(serverPath);
    
    // Create a mock request and response objects
    const req = {
      method: event.httpMethod,
      path: event.path.replace('/.netlify/functions/api', '/api'),
      headers: event.headers,
      body: event.body ? JSON.parse(event.body) : {},
      query: event.queryStringParameters || {}
    };

    // Create a promise that resolves with the response
    return new Promise((resolve) => {
      const res = {
        statusCode: 200,
        headers: {},
        body: '',
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.body = JSON.stringify(data);
          this.headers['Content-Type'] = 'application/json';
          resolve({
            statusCode: this.statusCode,
            headers: this.headers,
            body: this.body
          });
          return this;
        },
        send(data) {
          this.body = typeof data === 'object' ? JSON.stringify(data) : data;
          resolve({
            statusCode: this.statusCode,
            headers: this.headers,
            body: this.body
          });
          return this;
        },
        setHeader(key, value) {
          this.headers[key] = value;
          return this;
        }
      };

      // Pass the request to the server's request handler
      serverModule.default(req, res);
    });
  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
EOL

# Create _redirects file for Netlify if it doesn't exist
if [ ! -f "dist/_redirects" ]; then
  echo "Creating _redirects file..."
  echo "/*    /index.html   200" > dist/_redirects
fi

echo "Build completed successfully!"