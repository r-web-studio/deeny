const SYSTEM_PROMPT = "You are a helpful Islamic AI companion named DeenFlow Assistant. You help users with daily check-ins, Islamic guidance, productivity tips, and spiritual growth. Be warm, supportive, and knowledgeable about Islam. Keep responses concise and actionable. Use markdown formatting when helpful.";

export async function sendChatMessage(
  messages: { role: string; content: string }[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "AI service not configured. Please add GEMINI_API_KEY.";

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) return "Failed to get response. Please try again.";
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
}
