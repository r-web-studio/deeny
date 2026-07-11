import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

function createSupabaseClient(url: string, key: string) {
  return createBrowserClient(url, key);
}

export function createClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error(
      "[Supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. " +
      "Make sure env vars are set."
    );
    throw new Error("Supabase configuration is missing. Please check environment variables.");
  }

  client = createSupabaseClient(url, key);
  return client;
}

export function createClientAsync() {
  return Promise.resolve(createClient());
}
