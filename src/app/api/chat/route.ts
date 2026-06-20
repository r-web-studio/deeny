import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;

const MODELS = [
  "google/gemma-4-26b-a4b-it:free",
  "meta-llama/llama-3.1-8b-instruct:free",
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callOpenRouter(
  apiKey: string,
  messages: { role: string; content: string }[],
  modelIndex: number
): Promise<{ ok: true; content: string } | { ok: false; status: number; retryAfter?: number; modelIndex: number }> {
  const model = MODELS[modelIndex] || MODELS[0];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://deenflow.app",
      "X-Title": "DeenFlow AI Companion",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are a helpful Islamic AI companion named DeenFlow Assistant. You help users with daily check-ins, Islamic guidance, productivity tips, and spiritual growth. Be warm, supportive, and knowledgeable about Islam. Keep responses concise and actionable. Use markdown formatting when helpful.",
        },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : undefined;
    return { ok: false, status: 429, retryAfter: waitMs, modelIndex };
  }

  const responseText = await response.text();

  if (!response.ok) {
    return { ok: false, status: response.status, modelIndex };
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    return { ok: false, status: 500, modelIndex };
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    return { ok: false, status: 500, modelIndex };
  }

  return { ok: true, content };
}

export async function POST(request: NextRequest) {
  const { messages } = await request.json();
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { content: "AI service not configured. Please set OPENROUTER_API_KEY in your environment variables." },
      { status: 500 }
    );
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { content: "No messages provided." },
      { status: 400 }
    );
  }

  let lastError: { status: number; retryAfter?: number } = { status: 500 };

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const modelIdx = Math.min(Math.floor(attempt / 2), MODELS.length - 1);
    const result = await callOpenRouter(apiKey, messages, modelIdx);

    if (result.ok) {
      return NextResponse.json({ content: result.content });
    }

    lastError = { status: result.status, retryAfter: result.retryAfter };

    if (result.status === 429) {
      const delay = result.retryAfter || BASE_DELAY_MS * Math.pow(2, attempt);
      const cappedDelay = Math.min(delay, 30000);
      console.warn(`OpenRouter 429 rate limited. Attempt ${attempt + 1}/${MAX_RETRIES}. Retrying in ${cappedDelay}ms...`);
      await sleep(cappedDelay);
      continue;
    }

    if (result.status === 502 || result.status === 503) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      console.warn(`OpenRouter ${result.status} server error. Attempt ${attempt + 1}/${MAX_RETRIES}. Retrying in ${delay}ms...`);
      await sleep(delay);
      continue;
    }

    console.error("OpenRouter API error:", result.status);
    return NextResponse.json(
      { content: `AI service error (${result.status}). Please try again later.` },
      { status: result.status }
    );
  }

  if (lastError.status === 429) {
    return NextResponse.json(
      { content: "AI service is busy right now. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  return NextResponse.json(
    { content: `AI service temporarily unavailable (${lastError.status}). Please try again later.` },
    { status: lastError.status }
  );
}
