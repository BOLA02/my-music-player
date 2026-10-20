// Service worker: caches the app shell and Next.js assets so the player opens
// offline. Music and playlists live in IndexedDB, so they never pass through here.
const VERSION = "v1";
const CACHE = `my-music-${VERSION}`;
const SHELL = ["/", "/playlists", "/manifest.webmanifest", "/icon.svg"];

async function precache() {
  const cache = await caches.open(CACHE);
  const assets = new Set();
  for (const url of SHELL) {
    try {
      const res = await fetch(url, { cache: "reload" });
      if (!res.ok) continue;
      await cache.put(url, res.clone());
      if (res.headers.get("content-type")?.includes("text/html")) {
        const html = await res.text();
        for (const m of html.matchAll(/\/_next\/static\/[^"'\\\s)<>]+/g)) assets.add(m[0]);
      }
    } catch {
      // Offline during install: runtime caching will fill in later.
    }
  }
  await Promise.all(
    [...assets].map((url) => cache.add(url).catch(() => undefined)),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(request);
    if (hit) return hit;
    if (fallbackUrl) {
      const fallback = await cache.match(fallbackUrl);
      if (fallback) return fallback;
    }
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
  } else if (request.mode === "navigate") {
    // A playlist page that was never opened online falls back to the list.
    const fallback = url.pathname.startsWith("/playlists/") ? "/playlists" : "/";
    event.respondWith(networkFirst(request, fallback));
  } else {
    event.respondWith(networkFirst(request));
  }
});
