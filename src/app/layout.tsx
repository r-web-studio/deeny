import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amiri = localFont({
  src: "../../public/fonts/Amiri-Regular.ttf",
  variable: "--font-arabic",
  display: "swap",
});

const poppins = localFont({
  src: "../../public/fonts/Poppins-Regular.ttf",
  variable: "--font-heading",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#059669",
};

export const metadata: Metadata = {
  title: {
    default: "DeenFlow - Islamic Productivity",
    template: "%s | DeenFlow",
  },
  description:
    "A premium Islamic productivity app for prayer tracking, dhikr, journaling, and spiritual growth.",
  keywords: ["islam", "prayer", "dhikr", "quran", "productivity", "deen"],
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} ${poppins.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('deenflow-theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
                const cp = localStorage.getItem('deenflow-colors');
                if (cp && cp !== 'madinah-green') {
                  const presets = ${JSON.stringify({
                    "ottoman-gold": { primary: "oklch(0.48 0.14 75)", islamicGreen: "oklch(0.52 0.14 75)", islamicGreenLight: "oklch(0.93 0.05 75)", gold: "oklch(0.68 0.18 65)", ring: "oklch(0.48 0.14 75)", secondary: "oklch(0.95 0.01 75)", accent: "oklch(0.95 0.01 75)", sidebarPrimary: "oklch(0.48 0.14 75)", sidebarAccent: "oklch(0.95 0.01 75)", sidebarRing: "oklch(0.48 0.14 75)", background: "oklch(0.97 0.008 75)", card: "oklch(0.99 0.004 75)", muted: "oklch(0.95 0.01 75)", sidebar: "oklch(0.98 0.006 75)" },
                    "desert-sand": { primary: "oklch(0.45 0.10 55)", islamicGreen: "oklch(0.48 0.10 55)", islamicGreenLight: "oklch(0.92 0.04 55)", gold: "oklch(0.70 0.14 80)", ring: "oklch(0.45 0.10 55)", secondary: "oklch(0.95 0.01 55)", accent: "oklch(0.95 0.01 55)", sidebarPrimary: "oklch(0.45 0.10 55)", sidebarAccent: "oklch(0.95 0.01 55)", sidebarRing: "oklch(0.45 0.10 55)", background: "oklch(0.97 0.006 55)", card: "oklch(0.99 0.003 55)", muted: "oklch(0.95 0.008 55)", sidebar: "oklch(0.98 0.005 55)" },
                    "mosque-blue": { primary: "oklch(0.35 0.12 240)", islamicGreen: "oklch(0.40 0.12 240)", islamicGreenLight: "oklch(0.92 0.04 240)", gold: "oklch(0.72 0.15 85)", ring: "oklch(0.35 0.12 240)", secondary: "oklch(0.95 0.01 240)", accent: "oklch(0.95 0.01 240)", sidebarPrimary: "oklch(0.35 0.12 240)", sidebarAccent: "oklch(0.95 0.01 240)", sidebarRing: "oklch(0.35 0.12 240)", background: "oklch(0.97 0.005 240)", card: "oklch(0.99 0.002 240)", muted: "oklch(0.95 0.008 240)", sidebar: "oklch(0.98 0.004 240)" },
                    "night-sky": { primary: "oklch(0.30 0.10 260)", islamicGreen: "oklch(0.35 0.10 260)", islamicGreenLight: "oklch(0.92 0.03 260)", gold: "oklch(0.74 0.14 85)", ring: "oklch(0.30 0.10 260)", secondary: "oklch(0.95 0.01 260)", accent: "oklch(0.95 0.01 260)", sidebarPrimary: "oklch(0.30 0.10 260)", sidebarAccent: "oklch(0.95 0.01 260)", sidebarRing: "oklch(0.30 0.10 260)", background: "oklch(0.97 0.004 260)", card: "oklch(0.99 0.002 260)", muted: "oklch(0.95 0.006 260)", sidebar: "oklch(0.98 0.003 260)" },
                    "jasmine-white": { primary: "oklch(0.40 0.08 140)", islamicGreen: "oklch(0.44 0.10 140)", islamicGreenLight: "oklch(0.94 0.03 140)", gold: "oklch(0.72 0.15 85)", ring: "oklch(0.40 0.08 140)", secondary: "oklch(0.96 0.01 140)", accent: "oklch(0.96 0.01 140)", sidebarPrimary: "oklch(0.40 0.08 140)", sidebarAccent: "oklch(0.96 0.01 140)", sidebarRing: "oklch(0.40 0.08 140)", background: "oklch(0.98 0.003 140)", card: "oklch(0.995 0.001 140)", muted: "oklch(0.96 0.005 140)", sidebar: "oklch(0.985 0.002 140)" },
                    "rose-garden": { primary: "oklch(0.42 0.14 350)", islamicGreen: "oklch(0.46 0.14 350)", islamicGreenLight: "oklch(0.92 0.04 350)", gold: "oklch(0.72 0.15 85)", ring: "oklch(0.42 0.14 350)", secondary: "oklch(0.95 0.01 350)", accent: "oklch(0.95 0.01 350)", sidebarPrimary: "oklch(0.42 0.14 350)", sidebarAccent: "oklch(0.95 0.01 350)", sidebarRing: "oklch(0.42 0.14 350)", background: "oklch(0.97 0.006 350)", card: "oklch(0.99 0.003 350)", muted: "oklch(0.95 0.008 350)", sidebar: "oklch(0.98 0.004 350)" },
                    "sahara-amber": { primary: "oklch(0.45 0.12 60)", islamicGreen: "oklch(0.50 0.12 60)", islamicGreenLight: "oklch(0.93 0.04 60)", gold: "oklch(0.68 0.16 50)", ring: "oklch(0.45 0.12 60)", secondary: "oklch(0.95 0.01 60)", accent: "oklch(0.95 0.01 60)", sidebarPrimary: "oklch(0.45 0.12 60)", sidebarAccent: "oklch(0.95 0.01 60)", sidebarRing: "oklch(0.45 0.12 60)", background: "oklch(0.97 0.006 60)", card: "oklch(0.99 0.003 60)", muted: "oklch(0.95 0.008 60)", sidebar: "oklch(0.98 0.005 60)" },
                  })};
                  const darkPresets = ${JSON.stringify({
                    "ottoman-gold": { primary: "oklch(0.62 0.16 75)", islamicGreen: "oklch(0.65 0.16 75)", islamicGreenLight: "oklch(0.24 0.05 75)", gold: "oklch(0.75 0.18 65)", ring: "oklch(0.62 0.16 75)", secondary: "oklch(0.22 0.03 75)", accent: "oklch(0.22 0.03 75)", sidebarPrimary: "oklch(0.65 0.16 75)", sidebarAccent: "oklch(0.22 0.03 75)", sidebarRing: "oklch(0.62 0.16 75)", background: "oklch(0.14 0.02 75)", card: "oklch(0.18 0.02 75)", muted: "oklch(0.22 0.02 75)", sidebar: "oklch(0.16 0.02 75)" },
                    "desert-sand": { primary: "oklch(0.60 0.12 55)", islamicGreen: "oklch(0.62 0.12 55)", islamicGreenLight: "oklch(0.24 0.04 55)", gold: "oklch(0.76 0.14 80)", ring: "oklch(0.60 0.12 55)", secondary: "oklch(0.22 0.03 55)", accent: "oklch(0.22 0.03 55)", sidebarPrimary: "oklch(0.62 0.12 55)", sidebarAccent: "oklch(0.22 0.03 55)", sidebarRing: "oklch(0.60 0.12 55)", background: "oklch(0.14 0.015 55)", card: "oklch(0.18 0.015 55)", muted: "oklch(0.22 0.02 55)", sidebar: "oklch(0.16 0.015 55)" },
                    "mosque-blue": { primary: "oklch(0.50 0.14 240)", islamicGreen: "oklch(0.54 0.14 240)", islamicGreenLight: "oklch(0.24 0.04 240)", gold: "oklch(0.78 0.15 85)", ring: "oklch(0.50 0.14 240)", secondary: "oklch(0.20 0.03 240)", accent: "oklch(0.20 0.03 240)", sidebarPrimary: "oklch(0.54 0.14 240)", sidebarAccent: "oklch(0.20 0.03 240)", sidebarRing: "oklch(0.50 0.14 240)", background: "oklch(0.14 0.02 240)", card: "oklch(0.18 0.02 240)", muted: "oklch(0.22 0.02 240)", sidebar: "oklch(0.16 0.02 240)" },
                    "night-sky": { primary: "oklch(0.48 0.12 260)", islamicGreen: "oklch(0.52 0.12 260)", islamicGreenLight: "oklch(0.22 0.04 260)", gold: "oklch(0.80 0.14 85)", ring: "oklch(0.48 0.12 260)", secondary: "oklch(0.18 0.03 260)", accent: "oklch(0.18 0.03 260)", sidebarPrimary: "oklch(0.52 0.12 260)", sidebarAccent: "oklch(0.18 0.03 260)", sidebarRing: "oklch(0.48 0.12 260)", background: "oklch(0.13 0.02 260)", card: "oklch(0.17 0.02 260)", muted: "oklch(0.21 0.02 260)", sidebar: "oklch(0.15 0.02 260)" },
                    "jasmine-white": { primary: "oklch(0.55 0.12 140)", islamicGreen: "oklch(0.58 0.12 140)", islamicGreenLight: "oklch(0.24 0.04 140)", gold: "oklch(0.78 0.15 85)", ring: "oklch(0.55 0.12 140)", secondary: "oklch(0.22 0.03 140)", accent: "oklch(0.22 0.03 140)", sidebarPrimary: "oklch(0.58 0.12 140)", sidebarAccent: "oklch(0.22 0.03 140)", sidebarRing: "oklch(0.55 0.12 140)", background: "oklch(0.14 0.015 140)", card: "oklch(0.18 0.015 140)", muted: "oklch(0.22 0.02 140)", sidebar: "oklch(0.16 0.015 140)" },
                    "rose-garden": { primary: "oklch(0.58 0.16 350)", islamicGreen: "oklch(0.60 0.16 350)", islamicGreenLight: "oklch(0.24 0.05 350)", gold: "oklch(0.78 0.15 85)", ring: "oklch(0.58 0.16 350)", secondary: "oklch(0.22 0.03 350)", accent: "oklch(0.22 0.03 350)", sidebarPrimary: "oklch(0.60 0.16 350)", sidebarAccent: "oklch(0.22 0.03 350)", sidebarRing: "oklch(0.58 0.16 350)", background: "oklch(0.14 0.015 350)", card: "oklch(0.18 0.015 350)", muted: "oklch(0.22 0.02 350)", sidebar: "oklch(0.16 0.015 350)" },
                    "sahara-amber": { primary: "oklch(0.60 0.14 60)", islamicGreen: "oklch(0.63 0.14 60)", islamicGreenLight: "oklch(0.24 0.04 60)", gold: "oklch(0.75 0.16 50)", ring: "oklch(0.60 0.14 60)", secondary: "oklch(0.22 0.03 60)", accent: "oklch(0.22 0.03 60)", sidebarPrimary: "oklch(0.63 0.14 60)", sidebarAccent: "oklch(0.22 0.03 60)", sidebarRing: "oklch(0.60 0.14 60)", background: "oklch(0.14 0.015 60)", card: "oklch(0.18 0.015 60)", muted: "oklch(0.22 0.02 60)", sidebar: "oklch(0.16 0.015 60)" },
                  })};
                  const isDark = document.documentElement.classList.contains('dark');
                  const c = isDark ? darkPresets[cp] : presets[cp];
                  if (c) {
                    const r = document.documentElement;
                    r.style.setProperty('--primary', c.primary);
                    r.style.setProperty('--islamic-green', c.islamicGreen);
                    r.style.setProperty('--islamic-green-light', c.islamicGreenLight);
                    r.style.setProperty('--gold', c.gold);
                    r.style.setProperty('--ring', c.ring);
                    r.style.setProperty('--secondary', c.secondary);
                    r.style.setProperty('--accent', c.accent);
                    r.style.setProperty('--sidebar-primary', c.sidebarPrimary);
                    r.style.setProperty('--sidebar-accent', c.sidebarAccent);
                    r.style.setProperty('--sidebar-ring', c.sidebarRing);
                    r.style.setProperty('--background', c.background);
                    r.style.setProperty('--card', c.card);
                    r.style.setProperty('--muted', c.muted);
                    r.style.setProperty('--sidebar', c.sidebar);
                  }
                }
                const fp = localStorage.getItem('deenflow-fonts');
                if (fp && fp !== 'amiri-classic') {
                  const fontMap = {
                    "noto-naskh": { heading: "'Noto Naskh Arabic', serif", arabic: "'Noto Naskh Arabic', serif", link: "" },
                    "scheherazade": { heading: "'Scheherazade New', serif", arabic: "'Scheherazade New', serif", link: "https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;500;600;700&display=swap" },
                    "sahel": { heading: "'Sahel', sans-serif", arabic: "'Sahel', sans-serif", link: "https://fonts.googleapis.com/css2?family=Sahel&display=swap" },
                    "cairo": { heading: "'Cairo', sans-serif", arabic: "'Cairo', sans-serif", link: "https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap" },
                    "tajawal": { heading: "'Tajawal', sans-serif", arabic: "'Tajawal', sans-serif", link: "https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap" },
                    "el-messiri": { heading: "'El Messiri', sans-serif", arabic: "'El Messiri', sans-serif", link: "https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&display=swap" },
                    "reem-kufi": { heading: "'Reem Kufi', sans-serif", arabic: "'Reem Kufi', sans-serif", link: "https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400;500;600;700&display=swap" },
                  };
                  const f = fontMap[fp];
                  if (f) {
                    document.documentElement.style.setProperty('--font-heading', f.heading);
                    document.documentElement.style.setProperty('--font-arabic', f.arabic);
                    if (f.link) {
                      var l = document.createElement('link');
                      l.rel = 'stylesheet';
                      l.href = f.link;
                      l.setAttribute('data-dynamic-font', fp);
                      document.head.appendChild(l);
                    }
                  }
                }
              } catch(e) {}
            `,
          }}
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Poppins:wght@300;400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </Providers>
      </body>
    </html>
  );
}
