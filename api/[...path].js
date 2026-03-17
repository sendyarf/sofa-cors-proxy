export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
      },
    });
  }

  // Determine the path to proxy to
  // request.url is the full URL (e.g. `https://your-vercel-domain/api/v1/...`)
  const url = new URL(request.url);
  
  // Keep the pathname and search params, but point to api.sofascore.com
  const targetUrl = `https://api.sofascore.com${url.pathname}${url.search}`;

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        // Spoof headers to avoid 403 Forbidden
        'Origin': 'https://www.sofascore.com',
        'Referer': 'https://www.sofascore.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache',
        'Accept': '*/*'
      }
    });

    // Create a new response based on the Sofascore response
    const data = await response.arrayBuffer();
    
    const headers = new Headers();
    // Copy content-type if available
    const contentType = response.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
    
    // Set CORS headers for the actual response
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Access-Control-Allow-Origin', '*');
    
    // Cache responses locally on Vercel Edge for 60 seconds to prevent rate-limiting
    headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

    return new Response(data, {
      status: response.status,
      headers: headers
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to proxy request to Sofascore', message: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
