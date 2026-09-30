// BroomBoom Vendor App Service Worker for PWA

const CACHE_NAME = "broomboom-vendor-v2";

// If running on localhost or in development, do not intercept requests and auto-unregister
const isLocalhost =
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1" ||
  self.location.hostname.endsWith(".local");

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (isLocalhost) {
        // Clean all caches and unregister on localhost
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        await self.registration.unregister();
        return;
      }
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  // Never intercept requests on localhost
  if (isLocalhost) {
    return;
  }

  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  // NEVER intercept Next.js internals, static chunks, HMR, or API endpoints
  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("webpack") ||
    (url.protocol !== "http:" && url.protocol !== "https:")
  ) {
    return;
  }

  // For navigational requests (HTML pages), try network first
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        return new Response(
          "<!DOCTYPE html><html><body style='font-family:sans-serif;text-align:center;padding:50px;'><h2>Offline</h2><p>Please check your internet connection.</p></body></html>",
          {
            status: 503,
            statusText: "Service Unavailable",
            headers: {
              "Content-Type": "text/html; charset=utf-8",
            },
          }
        );
      })
    );
    return;
  }

  // For other static assets (images, fonts)
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      return new Response("", { status: 408, statusText: "Request Timeout" });
    })
  );
});