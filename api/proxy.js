export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
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

  const url = new URL(request.url);
  const targetUrl = `https://api.sofascore.com${url.pathname}${url.search}`;

  try {
    const headers = new Headers();
    headers.append('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    headers.append('Origin', 'https://www.sofascore.com');
    headers.append('Referer', 'https://www.sofascore.com/');

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers
    });

    const data = await response.arrayBuffer();
    
    const resHeaders = new Headers();
    const contentType = response.headers.get('content-type');
    if (contentType) {
      resHeaders.set('Content-Type', contentType);
    }
    
    resHeaders.set('Access-Control-Allow-Credentials', 'true');
    resHeaders.set('Access-Control-Allow-Origin', '*');
    resHeaders.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

    return new Response(data, {
      status: response.status,
      headers: resHeaders
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
