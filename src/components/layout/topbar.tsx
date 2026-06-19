"use client";
import { Menu, Search, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { useThemeStore, applyTheme } from "@/lib/stores/theme-store";
import { Input } from "@/components/ui/input";

export function Topbar() {
  const { toggle } = useSidebarStore();
  const { theme, setTheme } = useThemeStore();

  const cycleTheme = () => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    applyTheme(next);
  };

  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

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
        <Button
          variant="ghost"
          size="icon"
          onClick={cycleTheme}
          className="h-9 w-9 rounded-full"
          title={`Theme: ${theme}`}
        >
          <ThemeIcon className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
