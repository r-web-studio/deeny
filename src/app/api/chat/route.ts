import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ status: "ok", route: "/api/chat" });
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SYSTEM_PROMPT =
  "You are a helpful Islamic AI companion named DeenFlow Assistant. You help users with daily check-ins, Islamic guidance, productivity tips, and spiritual growth. Be warm, supportive, and knowledgeable about Islam. Keep responses concise and actionable. Use markdown formatting when helpful.";

async function callOpenRouter(
  apiKey: string,
  messages: { role: string; content: string }[],
  model?: string
): Promise<
  | { ok: true; content: string }
  | { ok: false; status: number; retryAfter?: number }
> {
  const fullMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://deenflow.app",
      "X-Title": "DeenFlow",
    },
    body: JSON.stringify({
      model: model || "google/gemini-2.0-flash-001",
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : undefined;
    return { ok: false, status: 429, retryAfter: waitMs };
  }

  const responseText = await response.text();

  if (!response.ok) {
    console.error("OpenRouter API error:", response.status, responseText);
    return { ok: false, status: response.status };
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    return { ok: false, status: 500 };
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    return { ok: false, status: 500 };
  }

  return { ok: true, content };
}

export async function POST(request: NextRequest) {
  const { messages, model } = await request.json();
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        content:
          "AI service not configured. Please set OPENROUTER_API_KEY in your environment variables. Get a key at https://openrouter.ai/keys",
      },
      { status: 500 }
    );
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ content: "No messages provided." }, { status: 400 });
  }

  let lastError: { status: number; retryAfter?: number } = { status: 500 };

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const result = await callOpenRouter(apiKey, messages, model);

    if (result.ok) {
      return NextResponse.json({ content: result.content });
    }

    // After the early return above, result is narrowed to { ok: false; ... }
    const errResult = result as { ok: false; status: number; retryAfter?: number };
    lastError = { status: errResult.status, retryAfter: errResult.retryAfter };

    if (errResult.status === 429) {
      const delay = errResult.retryAfter || BASE_DELAY_MS * Math.pow(2, attempt);
      const cappedDelay = Math.min(delay, 30000);
      console.warn(
        `OpenRouter 429 rate limited. Attempt ${attempt + 1}/${MAX_RETRIES}. Retrying in ${cappedDelay}ms...`
      );
      await sleep(cappedDelay);
      continue;
    }

    if (errResult.status === 502 || errResult.status === 503) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      console.warn(
        `OpenRouter ${errResult.status} server error. Attempt ${attempt + 1}/${MAX_RETRIES}. Retrying in ${delay}ms...`
      );
      await sleep(delay);
      continue;
    }

    console.error("OpenRouter API error:", errResult.status);
    return NextResponse.json(
      { content: `AI service error (${errResult.status}). Please try again later.` },
      { status: errResult.status }
    );
  }

  if (lastError.status === 429) {
    return NextResponse.json(
      {
        content:
          "AI service is busy right now. Please wait a moment and try again.",
      },
      { status: 429 }
    );
  }

  return NextResponse.json(
    {
      content: `AI service temporarily unavailable (${lastError.status}). Please try again later.`,
    },
    { status: lastError.status }
  );
}
