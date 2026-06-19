export async function sendChatMessage(
  messages: { role: string; content: string }[],
  model: string = "meta-llama/llama-3.1-8b-instruct:free"
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return "AI service not configured. Please add OPENROUTER_API_KEY.";

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
    }),
  });

  if (!response.ok) return "Failed to get response. Please try again.";
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response generated.";
}
