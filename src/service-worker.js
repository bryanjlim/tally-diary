/// <reference types="@sveltejs/kit" />
import { build, files, prerendered, version } from '$service-worker';

const CACHE = `tally-diary-${version}`;
// '/' is the SPA fallback page; serving it from cache makes any route work offline
const ASSETS = [...new Set([...build, ...files, ...prerendered, '/'])];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			for (const key of keys) {
				if (key !== CACHE) await caches.delete(key);
			}
			await self.clients.claim();
		})
	);
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;
	const url = new URL(event.request.url);
	// Never intercept cross-origin (Drive API, OAuth, fonts) — always live network
	if (url.origin !== location.origin) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);

			// Immutable build assets: cache-first
			if (ASSETS.includes(url.pathname)) {
				const cached = await cache.match(url.pathname);
				if (cached) return cached;
			}

			// Everything else: network-first, cache fallback
			try {
				const response = await fetch(event.request);
				if (response.status === 200) cache.put(event.request, response.clone());
				return response;
			} catch (err) {
				const cached = await cache.match(event.request);
				if (cached) return cached;
				// Offline navigation to a client-side route: serve the SPA shell
				if (event.request.mode === 'navigate') {
					const shell = await cache.match('/');
					if (shell) return shell;
				}
				throw err;
			}
		})()
	);
});
