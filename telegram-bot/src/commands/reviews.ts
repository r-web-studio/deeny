import TelegramBot from "node-telegram-bot-api";
import { getAllReviews } from "../services/review-service";
import { UserSession, BotState } from "../types";
import { reviewsPageKeyboard, emptyReviewsKeyboard } from "../keyboards";

const REVIEWS_PER_PAGE = 5;

export function registerReviewsCommand(
  bot: TelegramBot,
  sessions: Map<number, UserSession>
): void {
  bot.onText(/\/reviews/, (msg) => {
    const chatId = msg.chat.id;
    sessions.set(chatId, { state: BotState.IDLE, tempData: {} });
    showReviewsPage(bot, chatId, 0);
  });
}

export function showReviewsPage(bot: TelegramBot, chatId: number, page: number): void {
  const reviews = getAllReviews();
  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);

  if (reviews.length === 0) {
    const emptyMessage = [
      "📭 <b>No reviews yet.</b>",
      "",
      "Be the first to share your experience!",
    ].join("\n");

    bot.sendMessage(chatId, emptyMessage, {
      parse_mode: "HTML",
      reply_markup: emptyReviewsKeyboard(),
    });
    return;
  }

  const start = page * REVIEWS_PER_PAGE;
  const end = start + REVIEWS_PER_PAGE;
  const pageReviews = reviews.slice(start, end);

  const lines: string[] = [
    `📖 <b>Reviews</b> — Page ${page + 1}/${totalPages}`,
    "",
  ];

  pageReviews.forEach((review, i) => {
    const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
    const date = new Date(review.date).toLocaleDateString();
    const name = review.telegramUsername
      ? `@${review.telegramUsername}`
      : review.name;

    lines.push(`${start + i + 1}. <b>${escapeHtml(name)}</b> — ${stars}`);
    lines.push(`   ${escapeHtml(review.comment)}`);
    lines.push(`   📅 ${date}`);
    lines.push("");
  });

  bot.sendMessage(chatId, lines.join("\n"), {
    parse_mode: "HTML",
    reply_markup: reviewsPageKeyboard(page, totalPages),
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
