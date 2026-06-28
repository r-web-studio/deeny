"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, Sun, Moon, Monitor, Download, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { useThemeStore, applyTheme } from "@/lib/stores/theme-store";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/language-switcher";
import { usePWAInstall } from "@/components/pwa/install-context";

const THEME_CONFIG = {
  light: { icon: Sun, label: "Light", gradient: "from-amber-400 to-orange-500", glow: "shadow-amber-500/25" },
  dark: { icon: Moon, label: "Dark", gradient: "from-indigo-400 to-purple-600", glow: "shadow-indigo-500/25" },
  system: { icon: Monitor, label: "System", gradient: "from-emerald-400 to-teal-500", glow: "shadow-emerald-500/25" },
} as const;

export function Topbar() {
  const { toggle } = useSidebarStore();
  const { theme, setTheme } = useThemeStore();
  const [themeKey, setThemeKey] = useState(0);
  const { canInstall, isInstalled, isIOS, hasNativePrompt, triggerInstall } = usePWAInstall();

  const cycleTheme = () => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    applyTheme(next);
    setThemeKey((k) => k + 1);
  };

  const config = THEME_CONFIG[theme];
  const Icon = config.icon;

  return (
    <header className="sticky top-0 z-30 flex items-center h-14 px-4 border-b border-border/50 bg-background/80 backdrop-blur-xl md:pl-64">
      <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={toggle}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 bg-muted/50" />
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <LanguageSwitcher />
        {!isInstalled && canInstall && (
          <div className="relative group">
            <Button
              variant="ghost"
              size="icon"
              onClick={isIOS ? undefined : triggerInstall}
              className="h-9 w-9 rounded-full bg-gradient-to-br from-islamic-green/10 to-islamic-green/5 border border-islamic-green/20 text-islamic-green hover:from-islamic-green/20 hover:to-islamic-green/10 hover:border-islamic-green/30 transition-all duration-300"
              title={isIOS ? "Share → Add to Home Screen" : "Install DeenFlow"}
            >
              {isIOS ? (
                <Share className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-medium bg-popover text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {isIOS ? "Share to install" : "Install App"}
            </div>
          </div>
        )}
        <div className="relative group">
          <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            className={`h-9 w-9 rounded-full bg-gradient-to-br ${config.gradient} text-white shadow-lg ${config.glow} hover:shadow-xl hover:scale-110 transition-all duration-300`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={themeKey}
                initial={{ rotate: -180, opacity: 0, scale: 0 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 180, opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex items-center justify-center"
              >
                <Icon className="h-4 w-4" />
              </motion.div>
            </AnimatePresence>
          </Button>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-medium bg-popover text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {config.label}
          </div>
        </div>
      </div>
    </header>
  );
}
