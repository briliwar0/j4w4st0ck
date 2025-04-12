// This middleware will handle CORS, Auth, and other common middlewares

export async function onRequest(context) {
  const { request, next, env } = context;
  
  // Handle CORS for API requests
  if (request.url.includes('/api/')) {
    const response = await next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle OPTIONS requests for CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: response.headers
      });
    }
    
    return response;
  }
  
  // For other requests, just continue to the next handler
  return await next();
}