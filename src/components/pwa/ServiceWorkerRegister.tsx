'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Sakinah SW registered');

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
        });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      if ('Notification' in window) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'NOTIFICATION_CLICK') {
            const url = event.data?.url || '/prayers';
            window.focus();
            window.location.href = url;
          }
        });
      }
    }
  }, []);

  return null;
}
