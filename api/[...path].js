export default async function handler(req, res) {
  const allowedOrigin = "*";

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const pathSegments = req.query.path;
  if (!pathSegments) {
    return res.status(400).json({ error: "Missing path" });
  }

  const path = Array.isArray(pathSegments)
    ? pathSegments.join("/")
    : pathSegments;

  const extraParams = { ...req.query };
  delete extraParams.path;

  const queryString = new URLSearchParams(extraParams).toString();
  const targetUrl = `https://api.sofascore.com/${path}${queryString ? "?" + queryString : ""}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Referer": "https://www.sofascore.com/",
        "Origin": "https://www.sofascore.com",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Upstream error: ${response.status} ${response.statusText}`,
      });
    }

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=30");

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch", detail: err.message });
  }
}
