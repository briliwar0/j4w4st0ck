// Cloudflare Pages API adapter
// This file will adapt our Express.js API to work with Cloudflare Pages Functions

export async function onRequestGet(context) {
  return handleRequest(context);
}

export async function onRequestPost(context) {
  return handleRequest(context);
}

export async function onRequestPut(context) {
  return handleRequest(context);
}

export async function onRequestPatch(context) {
  return handleRequest(context);
}

export async function onRequestDelete(context) {
  return handleRequest(context);
}

export async function onRequestOptions(context) {
  return handleCORS(context);
}

// CORS pre-flight response
function handleCORS(context) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}

// Main request handler
async function handleRequest(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/', '');

    // Here we'd normally proxy to our Express server
    // Since we're deploying to Cloudflare Pages, we need to handle the request directly
    // or adapt our Express routes to work with Cloudflare Functions
    
    // For simplicity, we'll return mock data during development
    // In production, you would connect to your database or external API
    
    // Return response based on the request path
    if (path.startsWith('assets')) {
      return handleAssetsRequest(request, path);
    } else if (path.startsWith('auth')) {
      return handleAuthRequest(request, path);
    } else if (path.startsWith('cart')) {
      return handleCartRequest(request, path);
    } else {
      return new Response(JSON.stringify({ message: "Not Found" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('API request error:', error);
    return new Response(JSON.stringify({ message: "Server Error", error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Handle assets-related requests
async function handleAssetsRequest(request, path) {
  // This is where you would implement your assets API logic
  // For now, we'll return a simple response
  return new Response(JSON.stringify({ message: "Assets API" }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Handle auth-related requests
async function handleAuthRequest(request, path) {
  // This is where you would implement your auth API logic
  return new Response(JSON.stringify({ message: "Auth API" }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Handle cart-related requests
async function handleCartRequest(request, path) {
  // This is where you would implement your cart API logic
  return new Response(JSON.stringify({ message: "Cart API" }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}