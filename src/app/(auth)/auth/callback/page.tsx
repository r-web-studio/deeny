"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { useUserStore } from "@/lib/stores/user-store";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const saveUserFromSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const u = session.user;
        const metadata = u.user_metadata || {};
        useUserStore.getState().setUser({
          fullName: metadata.full_name || u.email?.split("@")[0] || "User",
          email: u.email || "",
          username: metadata.username || u.email?.split("@")[0] || "",
          avatarUrl: metadata.avatar_url || null,
          country: metadata.country || null,
          timezone: metadata.timezone || "UTC",
        });
      }
    };

    const handleAuth = async () => {
      const code = searchParams.get("code");

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("Code exchange error:", exchangeError);
          setError(exchangeError.message);
          setTimeout(() => router.push("/login"), 2000);
          return;
        }
        await saveUserFromSession();
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await saveUserFromSession();
        router.push("/dashboard");
        router.refresh();
      } else {
        router.push("/login");
      }
    };

    handleAuth();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-destructive text-sm">{error}</p>
          <p className="text-muted-foreground text-xs">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-islamic-green" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-islamic-green" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
