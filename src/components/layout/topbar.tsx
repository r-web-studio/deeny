"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { useThemeStore, applyTheme } from "@/lib/stores/theme-store";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/language-switcher";

export function Topbar() {
  const { toggle } = useSidebarStore();
  const { theme, setTheme } = useThemeStore();
  const [themeKey, setThemeKey] = useState(0);

  const cycleTheme = () => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    applyTheme(next);
    setThemeKey((k) => k + 1);
  };

  const icons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };
  const Icon = icons[theme];

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
        <Button
          variant="ghost"
          size="icon"
          onClick={cycleTheme}
          className="h-9 w-9 rounded-full overflow-hidden"
          title={`Theme: ${theme}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={themeKey}
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center justify-center"
            >
              <Icon className="h-4 w-4" />
            </motion.div>
          </AnimatePresence>
        </Button>
      </div>
    </header>
  );
}
