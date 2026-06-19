import { NextRequest, NextResponse } from "next/server";

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

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://deenflow.app",
        "X-Title": "DeenFlow AI Companion",
      },
      body: JSON.stringify({
        model: "google/gemma-4-26b-a4b-it:free",
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

    const responseText = await response.text();

    if (!response.ok) {
      console.error("OpenRouter API error:", response.status, responseText);
      return NextResponse.json(
        { content: `AI service error (${response.status}). Please try again later.` },
        { status: response.status }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse OpenRouter response:", responseText);
      return NextResponse.json(
        { content: "Invalid response from AI service." },
        { status: 500 }
      );
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error("No content in OpenRouter response:", JSON.stringify(data));
      return NextResponse.json(
        { content: "AI generated an empty response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { content: `Network error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
