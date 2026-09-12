// Installability only, no offline caching: Chrome offers to install the app
// only when a fetch handler exists. It stays a no-op on purpose, calling
// respondWith would proxy every Inertia request through the worker.
self.addEventListener('fetch', () => {})
