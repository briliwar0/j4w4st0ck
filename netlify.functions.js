// netlify.functions.js
// This file helps Netlify to understand how to handle our serverless functions

const { existsSync } = require('fs');
const path = require('path');

// Export middleware configuration for Netlify
module.exports = {
  // Configure bundling for our serverless functions
  build: {
    // Specify external dependencies that should not be bundled
    externalNodeModules: ['sharp', 'pg-native', '@neondatabase/serverless'],
    
    // Use esbuild for better performance
    esbuild: {
      // Platform target for serverless functions
      platform: 'node',
      // Target Node.js version
      target: 'node20',
      // Define environment variables
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
      },
      // External packages
      external: ['sharp', 'pg-native', '@neondatabase/serverless']
    }
  },
  
  // Function configuration
  functions: {
    // API handler function
    'api': {
      // Increase timeout for database operations
      timeout: 30,
      // Configure memory allocation
      memory: 1024
    }
  }
};