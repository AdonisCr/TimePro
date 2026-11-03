/**
 * Service worker de Time Pro.
 *
 * Objectif : l'application doit s'ouvrir même sans réseau.
 *  - les pages (navigation) sont demandées au réseau d'abord, puis servies
 *    depuis le cache si le réseau échoue ;
 *  - les fichiers construits par Vite (`/assets/index-xxxx.js`) ont un nom
 *    unique par version : ils sont servis depuis le cache en priorité ;
 *  - le nom du cache contient l'empreinte du build : un nouveau déploiement
 *    crée un nouveau cache et supprime l'ancien ;
 *  - si rien n'est disponible, une page `offline.html` explique la situation.
 *
 * Ce fichier n'est enregistré qu'en production (voir `src/main.tsx`).
 */

const CACHE_PREFIX = 'timepro-';
const OFFLINE_URL = '/offline.html';
const SHELL_URL = '/index.html';
const STATIC_FILES = [
  '/',
  SHELL_URL,
  OFFLINE_URL,
  '/manifest.json',
  '/icon-192x192.png',
  '/badge-72x72.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
];

let cacheName = `${CACHE_PREFIX}bootstrap`;

const isSameOrigin = (url) => url.origin === self.location.origin;

/** Extrait les fichiers du build référencés par index.html. */
const extractBuildAssets = (html) => {
  const matches = html.match(/\/assets\/[A-Za-z0-9._-]+/g) ?? [];
  return Array.from(new Set(matches));
};

/** Empreinte du build, lue dans le nom du fichier principal. */
const buildVersion = (html) => {
  const match = html.match(/\/assets\/index-([A-Za-z0-9_-]+)\.js/);
  return match ? match[1].slice(0, 40) : String(Date.now());
};

const cacheAddAll = async (cache, urls) => {
  await Promise.allSettled(
    urls.map(async (url) => {
      const response = await fetch(url, { cache: 'reload' });
      if (response.ok) {
        await cache.put(url, response);
      }
    })
  );
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      let html = '';
      try {
        const response = await fetch(SHELL_URL, { cache: 'reload' });
        if (response.ok) {
          html = await response.text();
        }
      } catch {
        // Hors ligne pendant l'installation : on garde les fichiers de base.
      }

      cacheName = `${CACHE_PREFIX}${buildVersion(html)}`;
      const cache = await caches.open(cacheName);

      const assets = html ? extractBuildAssets(html) : [];
      await cacheAddAll(cache, [...STATIC_FILES, ...assets]);

      // La page de repli doit toujours être disponible.
      try {
        const offline = await fetch(OFFLINE_URL, { cache: 'reload' });
        if (offline.ok) {
          await cache.put(OFFLINE_URL, offline);
        }
      } catch {
        // Rien de plus à faire : le cache réseau a déjà été tenté.
      }

      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith(CACHE_PREFIX) && name !== cacheName)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/** Réseau d'abord, cache ensuite, puis page de repli. */
const networkFirstNavigation = async (request) => {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      // On mémorise la coquille de l'application pour les prochaines visites.
      cache.put(SHELL_URL, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    const shell = await cache.match(SHELL_URL);
    if (shell) return shell;

    const root = await cache.match('/');
    if (root) return root;

    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;

    return new Response('Hors ligne', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
};

/** Cache d'abord (fichiers à nom unique), réseau ensuite. */
const cacheFirst = async (request) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!isSameOrigin(url)) return;

  // Ouverture de l'application (URL quelconque du SPA).
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  // Fichiers du build et fichiers statiques : cache d'abord.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (STATIC_FILES.includes(url.pathname) || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      cacheFirst(request).catch(async () => {
        const offline = await caches.match(OFFLINE_URL);
        return offline ?? Response.error();
      })
    );
  }

  // Les appels API ne sont jamais servis depuis le cache : la file hors ligne
  // de l'application s'en occupe.
});
