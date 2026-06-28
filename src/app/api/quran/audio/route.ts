import { NextRequest, NextResponse } from "next/server";

const QURAN_API_BASE = "https://api.quran.com/api/v4";
const QURAN_CDN = "https://verses.quran.foundation";

const RECITER_MAP: Record<number, string> = {
  7: "Alafasy",
  1: "AbdulBaset/Mujawwad",
  2: "AbdulBaset/Warsh",
  4: "AbuBakrShatri",
  5: "HaniRifai",
  9: "AhmadAjmi",
  11: "YasserAdDussary",
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const chapter = searchParams.get("chapter");
  const recitation = searchParams.get("recitation") || "7";

  if (!chapter) {
    return NextResponse.json({ error: "chapter parameter required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${QURAN_API_BASE}/recitations/${recitation}/by_chapter/${chapter}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      throw new Error(`Quran API returned ${res.status}`);
    }

    const data = await res.json();

    if (!data.audio_files || data.audio_files.length === 0) {
      return NextResponse.json({ error: "No audio files found" }, { status: 404 });
    }

    const audioPath = data.audio_files[0].url;
    const audioUrl = `${QURAN_CDN}/${audioPath}`;

    return NextResponse.json({
      audioUrl,
      reciter: data.meta?.reciter_name || "Unknown",
      chapter: Number(chapter),
      recitation: Number(recitation),
    });
  } catch (error) {
    console.error("Quran audio API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audio" },
      { status: 500 }
    );
  }
}
