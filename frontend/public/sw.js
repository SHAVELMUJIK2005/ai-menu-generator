// Service Worker — кэширование последнего меню и статических ресурсов
const CACHE_NAME = 'zozh-menu-v1'
const API_CACHE = 'zozh-api-v1'

// Статические ресурсы которые кэшируем при установке
const STATIC_ASSETS = ['/', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Кэшируем GET-запросы к API /menu и /user
  if (
    request.method === 'GET' &&
    (url.pathname.includes('/api/menu') || url.pathname.includes('/api/user'))
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(API_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            if (cached) return cached
            return new Response(JSON.stringify({ offline: true }), {
              headers: { 'Content-Type': 'application/json' },
            })
          })
        )
    )
    return
  }

  // Для остальных — network-first, fallback на кэш
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})
