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

  // request.url is the full URL (e.g. `https://your-vercel-domain/api/v1/sport...`)
  const url = new URL(request.url);
  
  // Keep the pathname exactly as requested, e.g. /api/v1/sport...
  // Wait, if the user requested /api/v1/sport..., should we forward /api/v1/... to Sofascore?
  // Sofascore's api path is indeed /api/v1/... so we forward verbatim
  const targetUrl = `https://api.sofascore.com${url.pathname}${url.search}`;

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Origin': 'https://www.sofascore.com',
        'Referer': 'https://www.sofascore.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache',
        'Accept': '*/*'
      }
    });

    const data = await response.arrayBuffer();
    
    const headers = new Headers();
    const contentType = response.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
    
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

    return new Response(data, {
      status: response.status,
      headers: headers
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to proxy request payload', message: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
