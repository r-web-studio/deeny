'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share, Globe, Menu } from 'lucide-react';
import { usePWAInstall } from './install-context';

export default function InstallPrompt() {
  const { canInstall, isInstalled, isIOS, isDismissed, hasNativePrompt, promptInstall, dismiss } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  if (isInstalled || isDismissed || !canInstall) return null;

  const handleInstall = async () => {
    if (hasNativePrompt) {
      setIsInstalling(true);
      try {
        await promptInstall();
      } finally {
        setIsInstalling(false);
      }
    } else {
      setShowInstructions(!showInstructions);
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
                    : hasNativePrompt
                      ? 'Add to your home screen for quick access & offline use'
                      : 'Install as an app for quick access & offline use'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isIOS ? (
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-islamic-green/10 px-4 py-2 text-xs font-semibold text-islamic-green">
                    <Share className="h-3.5 w-3.5" />
                    Share
                  </div>
                ) : (
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-islamic-green to-islamic-green/90 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-islamic-green/20 transition-all hover:shadow-lg hover:shadow-islamic-green/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {isInstalling ? 'Installing...' : 'Install'}
                  </button>
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

            {/* Manual install instructions (when native prompt not available) */}
            {showInstructions && !isIOS && !hasNativePrompt && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-border/50"
              >
                <div className="p-4 space-y-3">
                  <p className="text-xs font-medium text-foreground">How to install:</p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Globe className="h-4 w-4 mt-0.5 text-islamic-green flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Chrome / Edge</p>
                        <p>Click the install icon <Download className="inline h-3 w-3" /> in the address bar, or use the menu <Menu className="inline h-3 w-3" /> → "Install app"</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="h-4 w-4 mt-0.5 text-islamic-green flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                      <div>
                        <p className="font-medium text-foreground">Firefox</p>
                        <p>Click the three-dot menu → "Install DeenFlow"</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="h-4 w-4 mt-0.5 text-islamic-green flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                      <div>
                        <p className="font-medium text-foreground">Safari (macOS)</p>
                        <p>Click the share button → "Add to Dock"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
