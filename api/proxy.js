export default async function handler(req, res) {
  // Allowed origins (set * untuk public, atau batasi domain tertentu)
  const allowedOrigin = "*";

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
    return res.status(204).end();
  }

  // Hanya izinkan method GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Ambil target URL dari query param ?url=
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: "Missing ?url= parameter" });
  }

  // Validasi URL: hanya izinkan domain SofaScore
  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const allowedHosts = [
    "api.sofascore.com",
    "www.sofascore.com",
  ];

  if (!allowedHosts.includes(parsedUrl.hostname)) {
    return res.status(403).json({
      error: `Host not allowed: ${parsedUrl.hostname}`,
    });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.sofascore.com/",
        "Origin": "https://www.sofascore.com",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Upstream error: ${response.status} ${response.statusText}`,
      });
    }

    const data = await response.json();

    // Set CORS & caching headers
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Content-Type", "application/json");
    // Cache 30 detik di browser, 60 detik di CDN Vercel
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=30");

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch", detail: err.message });
  }
}
