import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}

// TODO: Set up a free cron job at https://cron-job.org
// to GET https://sakinah-dfxm.onrender.com/api/health every 10 minutes
// This prevents Render.com cold starts by keeping the service alive.
