'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share } from 'lucide-react';
import { usePWAInstall } from './install-context';

export default function InstallPrompt() {
  const { canInstall, isInstalled, isIOS, isDismissed, promptInstall, dismiss } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);

  if (isInstalled || isDismissed || !canInstall) return null;

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      if (isIOS) return;
      await promptInstall();
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4"
      >
        <div className="mx-auto max-w-lg">
          <div className="relative overflow-hidden rounded-2xl border border-islamic-green/20 bg-card/95 shadow-2xl shadow-islamic-green/10 backdrop-blur-xl">
            {/* Decorative gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-islamic-green/5 via-transparent to-gold/5 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-islamic-green/40 to-transparent" />

            <div className="relative flex items-center gap-3 p-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-islamic-green to-islamic-green/80 shadow-lg shadow-islamic-green/25">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Install DeenFlow
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {isIOS
                    ? 'Tap the share button then "Add to Home Screen"'
                    : 'Add to your home screen for quick access & offline use'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isIOS && (
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-islamic-green to-islamic-green/90 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-islamic-green/20 transition-all hover:shadow-lg hover:shadow-islamic-green/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {isInstalling ? 'Installing...' : 'Install'}
                  </button>
                )}
                {isIOS && (
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-islamic-green/10 px-4 py-2 text-xs font-semibold text-islamic-green">
                    <Share className="h-3.5 w-3.5" />
                    Share
                  </div>
                )}
                <button
                  onClick={dismiss}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Dismiss install prompt"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
