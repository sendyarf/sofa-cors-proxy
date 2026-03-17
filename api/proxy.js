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

  const url = new URL(request.url);
  const targetUrl = `https://api.sofascore.com${url.pathname}${url.search}`;

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.sofascore.com/',
        'Origin': 'https://www.sofascore.com',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        // Pass essential client headers like Authorization if they exist
        ...(request.headers.get('Authorization') && { 'Authorization': request.headers.get('Authorization') })
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
