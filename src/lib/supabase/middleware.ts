import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;

  const publicPaths = ["/login", "/register", "/forgot-password", "/"];
  const isPublicPath = publicPaths.some(p => pathname === p);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("[Middleware] Missing Supabase env vars - blocking all protected routes");
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    if (pathname.startsWith("/auth/callback")) {
      const code = request.nextUrl.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("Code exchange error in middleware:", error.message);
          const url = request.nextUrl.clone();
          url.pathname = "/login";
          url.searchParams.set("error", "Authentication failed. Please try again.");
          return NextResponse.redirect(url);
        }
      }
    }

    const { data: { user }, error: getUserError } = await supabase.auth.getUser();

    if (getUserError) {
      const errMsg = getUserError.message || "";
      if (errMsg.includes("Auth session missing")) {
        // No session — expected for unauthenticated visitors on public paths
      } else {
        console.error("[Middleware] getUser error:", errMsg);
      }
    }

    if (!user && !isPublicPath && !pathname.startsWith("/auth/callback")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (user && isPublicPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  } catch (e) {
    console.error("Middleware error:", e);
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("suspend") || msg.includes("pause") || msg.includes("503") || msg.includes("Service Unavailable")) {
      url.searchParams.set("error", "Our service is temporarily unavailable. Please try again later.");
    } else if (!isPublicPath && !pathname.startsWith("/auth/callback")) {
      url.searchParams.set("error", "Session expired. Please log in again.");
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
