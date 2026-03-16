# SofaScore CORS Proxy v2 — Vercel (Path Forwarding)

CORS proxy dengan path forwarding — tinggal ganti base URL, path tetap sama persis.

---

## 🚀 Deploy ke Vercel

### Via GitHub (direkomendasikan)
1. Upload folder ini ke repository GitHub
2. Buka [vercel.com](https://vercel.com) → New Project → Import repo → Deploy

### Via CLI
```bash
npm i -g vercel
vercel deploy
```

---

## 📡 Cara Pakai

Cukup **ganti base URL** dari `https://api.sofascore.com` menjadi URL proxy kamu.

```
# Original SofaScore
https://api.sofascore.com/api/v1/unique-tournament/17/season/61627/standings/total

# Lewat proxy (path identik)
https://nama-project-kamu.vercel.app/api/v1/unique-tournament/17/season/61627/standings/total
```

Query parameter juga diteruskan otomatis:
```
https://nama-project-kamu.vercel.app/api/v1/sport/football/events/live?page=1
```

---

## 💻 Contoh di JavaScript

```js
// Cukup ganti BASE_URL saja, sisanya tidak perlu diubah
const BASE_URL = "https://nama-project-kamu.vercel.app";

async function fetchSofaScore(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  return res.json();
}

// Standings
const total = await fetchSofaScore("/api/v1/unique-tournament/17/season/61627/standings/total");
const home  = await fetchSofaScore("/api/v1/unique-tournament/17/season/61627/standings/home");
const away  = await fetchSofaScore("/api/v1/unique-tournament/17/season/61627/standings/away");

// Live scores
const live  = await fetchSofaScore("/api/v1/sport/football/events/live");
```
