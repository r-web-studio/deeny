'use client';

import { WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import RetryButton from '@/components/pwa/RetryButton';

const features = [
  { label: 'Dhikr counter (local counts)', available: true },
  { label: 'Journal (saved entries)', available: true },
  { label: 'Prayer times (needs internet)', available: false },
  { label: 'AI Companion (needs internet)', available: false },
  { label: 'Quran audio (needs internet)', available: false },
];

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F172A] px-6 py-12 text-center">
      {/* Geometric decoration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute top-12 left-1/2 -translate-x-1/2 opacity-[0.04]"
      >
        <div className="relative h-40 w-40">
          <div className="absolute inset-0 rotate-45 border-2 border-emerald-500" />
          <div className="absolute inset-0 rotate-0 border-2 border-emerald-500" />
          <div className="absolute inset-2 rotate-[22.5deg] border border-emerald-500" />
          <div className="absolute inset-2 rotate-[-22.5deg] border border-emerald-500" />
          <div className="absolute inset-5 rotate-45 border border-emerald-400" />
          <div className="absolute inset-5 rotate-0 border border-emerald-400" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        {/* Logo */}
        <img src="/icons/icon-192x192.png" alt="DeenFlow Logo" className="w-20 h-20 rounded-2xl shadow-lg" />

        {/* WiFi-off icon */}
        <div className="rounded-full bg-emerald-500/10 p-6">
          <WifiOff size={80} className="text-emerald-500" strokeWidth={1.5} />
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-bold text-white">You&apos;re offline</h2>

        {/* Subtext */}
        <p className="max-w-md text-base leading-relaxed text-slate-400">
          DeenFlow needs an internet connection for most features. Your locally
          saved dhikr counts and journal entries are still available.
        </p>

        {/* Retry button */}
        <RetryButton />

        {/* Features card */}
        <div className="mt-4 w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Available Offline
          </h3>
          <ul className="space-y-2 text-sm">
            {features.map((f) => (
              <li
                key={f.label}
                className={`flex items-center gap-2 ${
                  f.available ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                <span className="font-mono text-base">
                  {f.available ? '✓' : '✗'}
                </span>
                {f.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Bismillah footer */}
        <p className="mt-6 font-arabic text-base text-slate-600" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
        </p>
      </motion.div>
    </div>
  );
}
