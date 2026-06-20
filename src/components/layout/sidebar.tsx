"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, BookOpen, Clock, Target, ListTodo, MessageCircle,
  Shield, PenLine, Calendar, BookMarked, BarChart3, Trophy,
  Settings, LogOut, X, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/prayers", label: "Prayer Times", icon: Clock },
  { href: "/dhikr", label: "Dhikr Counter", icon: Target },
  { href: "/todos", label: "Tasks", icon: ListTodo },
  { href: "/ai", label: "AI Companion", icon: MessageCircle },
  { href: "/streak", label: "No-Porn Streak", icon: Shield },
  { href: "/journal", label: "Journal", icon: PenLine },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/quran", label: "Quran", icon: BookMarked },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebarStore();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-islamic-green to-islamic-green/70 flex items-center justify-center text-white text-base font-bold shadow-lg shadow-islamic-green/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-lg font-heading">{APP_NAME}</span>
            <p className="text-[10px] text-muted-foreground -mt-0.5 font-arabic">بِسْمِ ٱللَّٰهِ</p>
          </div>
        </Link>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={close}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-islamic-green/10 text-islamic-green shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 rounded-r-full bg-islamic-green"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="p-3 border-t border-border/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border/50 bg-card/50 backdrop-blur-xl">
        {content}
      </aside>
      {/* Mobile sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={close}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden bg-card border-r border-border/50"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
