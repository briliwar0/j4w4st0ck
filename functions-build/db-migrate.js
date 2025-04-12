// Netlify function for database migration
const { execSync } = require('child_process');
const path = require('path');

// Handler for the Netlify Function
exports.handler = async function(event, context) {
  try {
    console.log('Starting database migration...');
    
    // Log environment for debugging (don't log secrets in production)
    console.log('Node environment:', process.env.NODE_ENV);
    console.log('Database connection available:', !!process.env.DATABASE_URL);
    
    // Execute the migration command
    const result = execSync('npx drizzle-kit push', { 
      encoding: 'utf8',
      env: process.env,
      stdio: 'pipe' 
    });
    
    console.log('Migration output:', result);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Database migration completed successfully',
        details: result
      })
    };
  } catch (error) {
    console.error('Migration error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Database migration failed',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};