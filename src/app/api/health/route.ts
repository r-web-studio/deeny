import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const gemini = process.env.GEMINI_API_KEY;

  const config = {
    NEXT_PUBLIC_SUPABASE_URL: url ? "set" : "MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: key ? "set" : "MISSING",
    GEMINI_API_KEY: gemini ? "set" : "MISSING",
  };

  const allSet = !!url && !!key && !!gemini;

  return NextResponse.json({
    status: allSet ? "ok" : "error",
    message: allSet
      ? "All environment variables are configured."
      : "Some environment variables are missing! Go to Render Dashboard > Environment > add the missing vars, then trigger Manual Deploy.",
    env: config,
  });
}
