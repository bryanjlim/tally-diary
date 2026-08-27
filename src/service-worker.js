/// <reference types="@sveltejs/kit" />
import { build, files, prerendered, version } from '$service-worker';

const CACHE = `tally-diary-${version}`;
const IMMUTABLE_ASSETS = new Set(build);

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll([...build, ...files, ...prerendered, '/']))
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
	// Never intercept cross-origin (Drive API, OAuth, Google GIS, fonts) — always live network
	if (url.origin !== location.origin) return;

	// 1. Navigation requests (HTML pages): Network-first, fallback to cached SPA shell offline
	if (event.request.mode === 'navigate') {
		event.respondWith(
			(async () => {
				try {
					const response = await fetch(event.request);
					if (response.status === 200) {
						const cache = await caches.open(CACHE);
						cache.put('/', response.clone());
					}
					return response;
				} catch (err) {
					const cache = await caches.open(CACHE);
					const shell = await cache.match('/');
					if (shell) return shell;
					throw err;
				}
			})()
		);
		return;
	}

	// 2. Hashed immutable build assets: Cache-first
	if (IMMUTABLE_ASSETS.has(url.pathname)) {
		event.respondWith(
			(async () => {
				const cache = await caches.open(CACHE);
				const cached = await cache.match(url.pathname);
				if (cached) return cached;

				const response = await fetch(event.request);
				if (response.status === 200) {
					const contentType = response.headers.get('content-type') || '';
					if (!contentType.includes('text/html')) {
						cache.put(url.pathname, response.clone());
					}
				}
				return response;
			})()
		);
		return;
	}

	// 3. Static files & other assets: Network-first with cache fallback
	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);
			const cached = await cache.match(event.request);
			try {
				const response = await fetch(event.request);
				if (response.status === 200) {
					const contentType = response.headers.get('content-type') || '';
					if (!contentType.includes('text/html')) {
						cache.put(event.request, response.clone());
					}
				}
				return response;
			} catch (err) {
				if (cached) return cached;
				throw err;
			}
		})()
	);
});

