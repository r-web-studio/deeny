import TelegramBot from "node-telegram-bot-api";
import { getReviewStats } from "../services/review-service";
import { UserSession, BotState } from "../types";
import { statsKeyboard } from "../keyboards";

export function showStats(bot: TelegramBot, chatId: number): void {
  const stats = getReviewStats();

  if (stats.total === 0) {
    const emptyMessage = [
      "📊 <b>No reviews yet.</b>",
      "",
      "Be the first to share your experience!",
    ].join("\n");

    bot.sendMessage(chatId, emptyMessage, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✍️ Write Review", callback_data: "start_review" },
            { text: "🏠 Main Menu", callback_data: "back_to_menu" },
          ],
        ],
      },
    });
    return;
  }

  const avgStars = "★".repeat(Math.round(stats.average)) + "☆".repeat(5 - Math.round(stats.average));

  const lines: string[] = [
    "📊 <b>Sakinah Review Statistics</b>",
    "",
    `📝 <b>Total Reviews:</b> ${stats.total}`,
    `⭐ <b>Average Rating:</b> ${stats.average.toFixed(1)}/5 ${avgStars}`,
    "",
    "<b>Rating Breakdown:</b>",
  ];

  for (let i = 5; i >= 1; i--) {
    const count = stats.breakdown[i] || 0;
    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
    const bar = "█".repeat(Math.round(pct / 10)) + "░".repeat(10 - Math.round(pct / 10));
    lines.push(`${"★".repeat(i)} ${bar} ${count} (${pct}%)`);
  }

  bot.sendMessage(chatId, lines.join("\n"), {
    parse_mode: "HTML",
    reply_markup: statsKeyboard(),
  });
}

export function registerStatsCommand(
  bot: TelegramBot,
  sessions: Map<number, UserSession>
): void {
  bot.onText(/\/stats/, (msg) => {
    const chatId = msg.chat.id;
    sessions.set(chatId, { state: BotState.IDLE, tempData: {} });
    showStats(bot, chatId);
  });
}
