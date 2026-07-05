import TelegramBot from "node-telegram-bot-api";

const adminSessions = new Set<number>();

export function setAdminSession(chatId: number): void {
  adminSessions.add(chatId);
}

export function clearAdminSession(chatId: number): void {
  adminSessions.delete(chatId);
}

export function isAdminSession(chatId: number): boolean {
  return adminSessions.has(chatId);
}

export function sendAdminNotification(
  bot: TelegramBot,
  adminChatId: number,
  review: { name: string; rating: number; comment: string; date: string }
): void {
  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
  const dateStr = new Date(review.date).toLocaleString();

  const message = [
    "🔔 <b>New Review Received!</b>",
    "",
    `👤 <b>Name:</b> ${escapeHtml(review.name)}`,
    `⭐ <b>Rating:</b> ${stars} (${review.rating}/5)`,
    `📝 <b>Review:</b>`,
    escapeHtml(review.comment),
    "",
    `🕐 <b>Date:</b> ${dateStr}`,
  ].join("\n");

  bot.sendMessage(adminChatId, message, { parse_mode: "HTML" });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
