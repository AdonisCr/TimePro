import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Le service worker (cache hors ligne) n'est utile qu'avec le build de
// production : en développement, il garderait des fichiers périmés.
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Un nouveau build est disponible : on vérifie sans bloquer l'UI.
          registration.update().catch(() => {});
        })
        .catch((error) => {
          console.warn('Service worker non enregistré :', error);
        });
    });
  } else {
    // Nettoie un service worker laissé par un ancien build de production.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        void registration.unregister();
      });
    }).catch(() => {});

    if (typeof caches !== 'undefined') {
      caches.keys().then((names) => {
        names
          .filter((name) => name.startsWith('timepro-'))
          .forEach((name) => {
            void caches.delete(name);
          });
      }).catch(() => {});
    }
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
