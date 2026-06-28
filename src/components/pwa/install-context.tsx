'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

interface PWAInstallContextType {
  canInstall: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isDismissed: boolean;
  hasNativePrompt: boolean;
  promptInstall: () => Promise<void>;
  dismiss: () => void;
  resetDismissed: () => void;
}

const PWAInstallContext = createContext<PWAInstallContextType | null>(null);

const DISMISS_KEY = 'pwa-install-dismissed';

function getIsIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function getIsInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
}

export function PWAInstallProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const isIOS = getIsIOS();

  useEffect(() => {
    setIsInstalled(getIsInstalled());
    setIsDismissed(localStorage.getItem(DISMISS_KEY) === 'true');

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setIsDismissed(true);
  }, []);

  const resetDismissed = useCallback(() => {
    localStorage.removeItem(DISMISS_KEY);
    setIsDismissed(false);
  }, []);

  // Always show install for non-installed users (iOS gets share instructions, others get manual or native)
  const canInstall = !isInstalled;

  return (
    <PWAInstallContext.Provider value={{ canInstall, isInstalled, isIOS, isDismissed, hasNativePrompt: !!deferredPrompt, promptInstall, dismiss, resetDismissed }}>
      {children}
    </PWAInstallContext.Provider>
  );
}

export function usePWAInstall() {
  const ctx = useContext(PWAInstallContext);
  if (!ctx) throw new Error('usePWAInstall must be used within PWAInstallProvider');
  return ctx;
}
