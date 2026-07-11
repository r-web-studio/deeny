"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, BookOpen, Clock, Target, ListTodo, MessageCircle,
  Shield, PenLine, Calendar, BarChart3, Trophy,
  Settings, LogOut, X, Star, Download, Share, Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { usePWAInstall } from "@/components/pwa/install-context";

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebarStore();
  const router = useRouter();
  const { t } = useI18n();
  const { canInstall, isInstalled, isIOS, isDismissed, hasNativePrompt, triggerInstall, dismiss } = usePWAInstall();

  const navItems = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: Home },
    { href: "/prayers", label: t("nav.prayers"), icon: Clock },
    { href: "/dhikr", label: t("nav.dhikr"), icon: Target },
    { href: "/todos", label: t("nav.tasks"), icon: ListTodo },
    { href: "/ai", label: t("nav.ai"), icon: MessageCircle },
    { href: "/streak", label: t("nav.streak"), icon: Shield },
    { href: "/journal", label: t("nav.journal"), icon: PenLine },
    { href: "/calendar", label: t("nav.calendar"), icon: Calendar },
    { href: "/analytics", label: t("nav.analytics"), icon: BarChart3 },
    { href: "/achievements", label: t("nav.achievements"), icon: Trophy },
    { href: "/reviews", label: t("nav.reviews"), icon: Star },
    { href: "/settings", label: t("nav.settings"), icon: Settings },
  ];

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
          <img src="/icons/icon-192x192.png" alt="Sakinah Logo" className="w-10 h-10 rounded-xl shadow-lg" />
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
      <div className="p-3 border-t border-border/50 space-y-2">
        {!isInstalled && !isDismissed && canInstall && (
          <div className="relative overflow-hidden rounded-xl border border-islamic-green/20 bg-gradient-to-br from-islamic-green/5 to-transparent p-3">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-islamic-green/30 to-transparent" />
            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-islamic-green/10">
                {isIOS ? (
                  <Share className="h-4 w-4 text-islamic-green" />
                ) : (
                  <Download className="h-4 w-4 text-islamic-green" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">Install App</p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {isIOS ? 'Share → Add to Home Screen' : 'Quick access & offline'}
                </p>
              </div>
            </div>
            {!isIOS && (
              <button
                onClick={triggerInstall}
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-islamic-green to-islamic-green/90 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-islamic-green/20 transition-all hover:shadow-md hover:shadow-islamic-green/30 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Smartphone className="h-3 w-3" />
                Install Now
              </button>
            )}
            <button
              onClick={dismiss}
              className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 transition-colors hover:text-muted-foreground"
              aria-label="Dismiss"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {t("nav.signOut")}
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
