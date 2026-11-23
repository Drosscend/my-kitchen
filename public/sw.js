// Installability only, no offline caching: Chrome offers to install the app
// only when a fetch handler exists. It stays a no-op on purpose, calling
// respondWith would proxy every Inertia request through the worker.
self.addEventListener('fetch', () => {})

self.addEventListener('push', (event) => {
  const message = event.data.json()
  event.waitUntil(
    self.registration.showNotification(message.title, {
      body: message.body,
      icon: '/favicon-192.png',
      data: { url: message.url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data.url, self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => client.url.startsWith(self.location.origin))
      return open
        ? open.navigate(url).then((client) => client?.focus())
        : self.clients.openWindow(url)
    })
  )
})
