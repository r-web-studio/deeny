import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const openrouterKey = !!process.env.OPENROUTER_API_KEY;

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey,
      OPENROUTER_API_KEY: openrouterKey,
    },
  });
}
