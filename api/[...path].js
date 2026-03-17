export default async function handler(req, res) {
  // CORS Headers for preflight and standard requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Determine the path to proxy to
  // req.url in Vercel includes the full path like `/api/v1/sport/football`
  // We remove the `/api` prefix if we want to call Sofascore directly as `https://api.sofascore.com/api/v1/...`
  // But wait, Sofascore actually uses `/api/v1/...` so if the client requests `/api/v1/...`, 
  // we can just forward exactly what is in `req.url` minus any local specifics, or just use req.url!
  
  // Vercel gives req.url as the original requested URL (e.g. `/api/v1/sport/football/events/live?foo=bar`)
  const targetUrl = `https://api.sofascore.com${req.url}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        // Spoof headers to avoid 403 Forbidden
        'Origin': 'https://www.sofascore.com',
        'Referer': 'https://www.sofascore.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache',
        'Accept': '*/*'
      }
    });

    // We can pipe the response or read as arrayBuffer/text
    const data = await response.arrayBuffer();

    // Pass through Content-Type from Sofascore
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Cache responses locally on Vercel Edge for 60 seconds to prevent rate-limiting
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

    // Return the response
    res.status(response.status).send(Buffer.from(data));
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Failed to proxy request to Sofascore', message: error.message });
  }
}
