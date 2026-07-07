"use client";
import { usePWAInstall } from "@/components/pwa/install-context";

export default function LandingPageClient() {
  const { hasNativePrompt, triggerInstall } = usePWAInstall();

  const handleInstall = async () => {
    if (hasNativePrompt) {
      triggerInstall();
    } else {
      window.location.href = "/register";
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0f0a", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5" style={{ backgroundColor: "rgba(10, 15, 10, 0.8)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#059669" }}>
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-white font-semibold text-lg">Sakinah</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a>
              <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How it Works</a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</a>
              <a href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">Kirish</a>
              <a href="/register" className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90" style={{ backgroundColor: "#059669" }}>
                Bepul boshlash
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* SECTION 1 — Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Productivlik va Ma&apos;naviyat
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-4 max-w-2xl mx-auto">
            Track your prayers. Count your dhikr. Grow your deen.
          </p>
          <p className="text-base text-gray-500 mb-10 max-w-xl mx-auto">
            Sakinah — ваш личный исламский помощник для ежедневной духовной практики.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={handleInstall}
              className="px-8 py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
              style={{ backgroundColor: "#059669" }}
            >
              Ilovani o&apos;rnatish
            </button>
            <a
              href="/register"
              className="px-8 py-3.5 rounded-xl font-semibold text-base border border-white/10 text-white hover:bg-white/5 transition-all"
            >
              Bepul boshlash
            </a>
          </div>

          {/* App Screenshot Mockup */}
          <div className="max-w-md mx-auto rounded-2xl border p-1" style={{ borderColor: "#059669" }}>
            <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "#0f1a0f" }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#05966920" }}>
                <svg className="w-8 h-8" style={{ color: "#059669" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">App Screenshot</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            Sizning deen uchun barcha vositalar
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to build consistent spiritual habits
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="rounded-xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all" style={{ backgroundColor: "#0f1a0f" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "#05966920" }}>
                <span className="text-2xl">🕌</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Namoz Kuzatuvi</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Track all 5 daily prayers with streaks</p>
            </div>
            {/* Feature 2 */}
            <div className="rounded-xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all" style={{ backgroundColor: "#0f1a0f" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "#05966920" }}>
                <span className="text-2xl">📿</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Zikr Hisoblagich</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Digital tasbih with custom dhikr phrases</p>
            </div>
            {/* Feature 3 */}
            <div className="rounded-xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all" style={{ backgroundColor: "#0f1a0f" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "#05966920" }}>
                <span className="text-2xl">📓</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Ruhiy Kundalik</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Spiritual journaling and gratitude log</p>
            </div>
            {/* Feature 4 */}
            <div className="rounded-xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all" style={{ backgroundColor: "#0f1a0f" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "#05966920" }}>
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Progress Tahlili</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Streak analytics and weekly insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — How it Works */}
      <section id="how-it-works" className="py-20 px-4" style={{ backgroundColor: "#080d08" }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            Qanday ishlaydi?
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Three simple steps to transform your daily spiritual practice
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl" style={{ backgroundColor: "#059669" }}>
                1
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Ro&apos;yxatdan o&apos;tish</h3>
              <p className="text-gray-400 text-sm">Create a free account in 30 seconds</p>
            </div>
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl" style={{ backgroundColor: "#059669" }}>
                2
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Kundalik amallar</h3>
              <p className="text-gray-400 text-sm">Log prayers, dhikr, and journal entries</p>
            </div>
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl" style={{ backgroundColor: "#059669" }}>
                3
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">O&apos;sishingizni kuzating</h3>
              <p className="text-gray-400 text-sm">Watch your spiritual habits grow</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            Narxlarni tanlang
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Start free, upgrade when you&apos;re ready for more
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="rounded-2xl p-8 border border-white/10" style={{ backgroundColor: "#0f1a0f" }}>
              <h3 className="text-white font-semibold text-xl mb-2">Bepul</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">0</span>
                <span className="text-gray-400 ml-2">UZS</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: "#059669" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Basic prayer log
                </li>
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: "#059669" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Limited dhikr counter
                </li>
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: "#059669" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  1 journal entry per week
                </li>
              </ul>
              <a href="/register" className="block w-full py-3 rounded-xl text-center font-medium border border-white/10 text-white hover:bg-white/5 transition-all">
                Boshlash
              </a>
            </div>
            {/* Premium Tier */}
            <div className="rounded-2xl p-8 border-2 relative" style={{ borderColor: "#059669", backgroundColor: "#0f1a0f" }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: "#d4af37" }}>
                Eng mashhur
              </div>
              <h3 className="text-white font-semibold text-xl mb-2">Premium</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">19,900</span>
                <span className="text-gray-400 ml-2">UZS/oy</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: "#059669" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Unlimited everything
                </li>
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: "#059669" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Streak analytics
                </li>
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: "#059669" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Ramadan tools
                </li>
                <li className="flex items-center gap-3 text-gray-300 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: "#059669" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Priority support
                </li>
              </ul>
              <a href="/register" className="block w-full py-3 rounded-xl text-center font-medium text-white transition-all hover:opacity-90" style={{ backgroundColor: "#059669" }}>
                Premium ni sinab ko&apos;ring
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#059669" }}>
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-white font-semibold">Sakinah</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">Kirish</a>
              <a href="/register" className="text-gray-400 hover:text-white transition-colors text-sm">Ro&apos;yxat</a>
              <a href="mailto:support@sakinah.app" className="text-gray-400 hover:text-white transition-colors text-sm">Qo&apos;llab-quvvatlash</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-sm">
              &copy; 2026 Sakinah. Barcha huquqlar himoyalangan.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
