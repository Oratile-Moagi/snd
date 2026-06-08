// Service worker for Siluma N Dube Ops — offline support.
// Strategy:
//  - navigations: network-first, fall back to the cached page, then to the
//    cached app shell ("/") so dynamic routes (e.g. /invoices/<id>) still open
//    offline and let the client app render from localStorage.
//  - RSC payload requests (App Router client navigation): network-first, fall
//    back to cache. If nothing is cached we return an opaque empty payload so
//    Next falls back to a normal navigation (handled above) instead of hanging.
//  - static assets (_next/static, icons, brand, images): stale-while-revalidate.
const CACHE = "snd-cache-v3";
const APP_SHELL = [
  "/",
  "/quotes",
  "/quotes/edit",
  "/invoices",
  "/invoices/edit",
  "/clients",
  "/projects",
  "/fleet",
  "/settings",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Best cached fallback for a navigation/RSC request: exact match, then the
// section root (/invoices for /invoices/123), then the app shell.
async function navigationFallback(url) {
  const exact = await caches.match(url.pathname);
  if (exact) return exact;
  const section = "/" + (url.pathname.split("/").filter(Boolean)[0] || "");
  const sectionMatch = await caches.match(section);
  if (sectionMatch) return sectionMatch;
  return caches.match("/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isRsc =
    url.searchParams.has("_rsc") ||
    request.headers.get("RSC") === "1" ||
    request.headers.get("Next-Router-Prefetch") === "1";

  // RSC payload requests (client-side App Router navigation).
  if (isRsc) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          // No cached payload: return an empty 204 so the client router gives
          // up the soft navigation and performs a hard navigation, which the
          // navigate handler below serves from the cached app shell.
          return (
            cached ||
            new Response("", { status: 204, headers: { "Content-Type": "text/x-component" } })
          );
        })
    );
    return;
  }

  // App navigations: network-first with offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(url.pathname, copy));
          return response;
        })
        .catch(() => navigationFallback(url))
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brand/") ||
    /\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?|ttf)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
