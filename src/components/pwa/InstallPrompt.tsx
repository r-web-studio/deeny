'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPrompt() {
  const [showBanner, setShowBanner] = useState(false);
  const deferredPrompt = useRef<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    console.log('PWA install outcome:', outcome);
    deferredPrompt.current = null;
    setShowBanner(false);
  };

  const handleClose = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-between gap-3 px-4 py-3 bg-emerald-700 text-white shadow-lg"
        >
          <p className="text-sm font-medium">Install DeenFlow as an app</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="rounded-md bg-white/20 px-3 py-1.5 text-sm font-semibold hover:bg-white/30 transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleClose}
              className="rounded-md p-1.5 hover:bg-white/20 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
