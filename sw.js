// This is the "Offline copy of pages" service worker
 

// service-worker.js
const CACHE_NAME = 'below-hayden-cache';
const urlsToCache = [
	"game.html",
	"js/game.js",
	"js/item-functions.js",
	"js/classes/player.js",
	"js/classes/monster.js",
	"js/classes/item.js",
	"css/animations.css",
	"css/style.css",
	"sounds.js",
	"sounds/*"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// service-worker.js
self.addEventListener('fetch', event => {
	event.respondWith(
	  caches.match(event.request)
		.then(response => {
		  // Cache hit - return response
		  if (response) {
			return response;
		  }
		  // No cache hit - fetch from network
		  return fetch(event.request);
		})
	);
  });