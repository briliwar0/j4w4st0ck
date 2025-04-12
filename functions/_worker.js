// This is the main worker script for Cloudflare Pages
// It handles the SPA routing and API proxying

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
      // For API deployment, you would need to implement
      // proper API handling here or proxy to your backend
      return new Response(JSON.stringify({ 
        error: "API is not available in the static deployment" 
      }), {
        status: 501,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // For static assets, let Cloudflare Pages handle them
    try {
      // Try to get the static asset
      return env.ASSETS.fetch(request);
    } catch (e) {
      // If it fails, return the SPA index.html for client-side routing
      return env.ASSETS.fetch(`${url.origin}/index.html`);
    }
  }
};