const SYSTEM_PROMPT =
  "You are a helpful Islamic AI companion named DeenFlow Assistant. You help users with daily check-ins, Islamic guidance, productivity tips, and spiritual growth. Be warm, supportive, and knowledgeable about Islam. Keep responses concise and actionable. Use markdown formatting when helpful.";

export async function sendChatMessage(
  messages: { role: string; content: string }[]
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return "AI service not configured. Please add OPENROUTER_API_KEY.";

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
      "X-Title": "DeenFlow",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) return "Failed to get response. Please try again.";
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response generated.";
}
