import { createBrowserClient } from "@supabase/ssr";

let cachedUrl = "";
let cachedKey = "";
let fetchedConfig = false;

function createSupabaseClient(url: string, key: string) {
  return createBrowserClient(url, key, {
    cookieOptions: {
      name: "sb",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    },
  });
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || cachedUrl;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || cachedKey;

  if (url && key) {
    return createSupabaseClient(url, key);
  }

  console.warn(
    "[Supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. " +
    "Make sure env vars are set and you triggered a Manual Deploy on Render."
  );

  return createSupabaseClient("", "");
}

export async function createClientAsync() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return createSupabaseClient(envUrl, envKey);
  }

  if (!fetchedConfig) {
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const config = await res.json();
        cachedUrl = config.url;
        cachedKey = config.key;
      }
    } catch (err) {
      console.error("[Supabase] Failed to fetch config from /api/config:", err);
    }
    fetchedConfig = true;
  }

  if (cachedUrl && cachedKey) {
    return createSupabaseClient(cachedUrl, cachedKey);
  }

  console.error(
    "[Supabase] No config available. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Render dashboard and do a Manual Deploy."
  );

  return createSupabaseClient("", "");
}
