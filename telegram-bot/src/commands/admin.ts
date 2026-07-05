import TelegramBot from "node-telegram-bot-api";
import { UserSession, BotState } from "../types";
import { getAllReviews, deleteReview, getReviewStats } from "../services/review-service";
import { setAdminSession, clearAdminSession, isAdminSession } from "../middleware/admin-guard";
import {
  adminPanelKeyboard,
  adminDeleteKeyboard,
  adminAllReviewsKeyboard,
  adminStatsKeyboard,
  adminReplyKeyboard,
  mainMenuKeyboard,
} from "../keyboards";

export function showAdminLogin(
  bot: TelegramBot,
  chatId: number,
  sessions: Map<number, UserSession>
): void {
  if (isAdminSession(chatId)) {
    showAdminPanel(bot, chatId);
    return;
  }

  const session = sessions.get(chatId) || { state: BotState.IDLE, tempData: {} };
  session.state = BotState.AWAITING_ADMIN_PASSWORD;
  sessions.set(chatId, session);

  bot.sendMessage(chatId, "🔐 Enter admin password:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "❌ Cancel", callback_data: "back_to_menu" }],
      ],
    },
  });
}

export function showAdminPanel(bot: TelegramBot, chatId: number): void {
  if (!isAdminSession(chatId)) {
    showAdminLogin(bot, chatId, new Map());
    return;
  }

  const stats = getReviewStats();
  const message = [
    "🔐 <b>Admin Panel</b>",
    "",
    `📝 Total Reviews: <b>${stats.total}</b>`,
    `⭐ Average: <b>${stats.average.toFixed(1)}/5</b>`,
    "",
    "Choose an action:",
  ].join("\n");

  bot.sendMessage(chatId, message, {
    parse_mode: "HTML",
    reply_markup: adminPanelKeyboard(),
  });
}

export function registerAdminCommand(
  bot: TelegramBot,
  sessions: Map<number, UserSession>,
  adminPassword: string,
  adminChatId: number
): void {
  bot.onText(/\/admin/, (msg) => {
    const chatId = msg.chat.id;
    showAdminLogin(bot, chatId, sessions);
  });

  bot.onText(/\/logout/, (msg) => {
    const chatId = msg.chat.id;
    if (isAdminSession(chatId)) {
      clearAdminSession(chatId);
      bot.sendMessage(chatId, "✅ Admin session ended.", {
        reply_markup: mainMenuKeyboard,
      });
    } else {
      bot.sendMessage(chatId, "You are not logged in as admin.", {
        reply_markup: mainMenuKeyboard,
      });
    }
  });

  bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const session = sessions.get(chatId);
    if (!session || session.state !== BotState.AWAITING_ADMIN_PASSWORD) return;
    if (msg.text?.startsWith("/")) return;

    if (msg.text === adminPassword) {
      setAdminSession(chatId);
      session.state = BotState.IDLE;
      showAdminPanel(bot, chatId);
    } else {
      bot.sendMessage(chatId, "❌ Wrong password. Try again or cancel.", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "❌ Cancel", callback_data: "back_to_menu" }],
          ],
        },
      });
      session.state = BotState.IDLE;
    }
  });

  bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const session = sessions.get(chatId);
    if (!session || session.state !== BotState.AWAITING_ADMIN_REPLY) return;
    if (msg.text?.startsWith("/")) return;

    const replyText = msg.text?.trim();
    if (!replyText || replyText.length < 1) {
      bot.sendMessage(chatId, "⚠️ Please type a reply message (at least 1 character).");
      return;
    }

    const targetUserId = session.tempData.replyToId as number;
    const targetUserName = session.tempData.replyToName as string;

    const userMessage = [
      "📬 <b>Message from DeenFlow Admin:</b>",
      "",
      escapeHtml(replyText),
      "",
      "— <i>DeenFlow Team</i>",
    ].join("\n");

    bot.sendMessage(targetUserId, userMessage, { parse_mode: "HTML" })
      .then(() => {
        bot.sendMessage(chatId, `✅ Reply sent to <b>${escapeHtml(targetUserName)}</b>!`, {
          parse_mode: "HTML",
          reply_markup: adminPanelKeyboard(),
        });
      })
      .catch(() => {
        bot.sendMessage(chatId, `❌ Failed to send reply to <b>${escapeHtml(targetUserName)}</b>. They may have blocked the bot.`, {
          parse_mode: "HTML",
          reply_markup: adminPanelKeyboard(),
        });
      });

    session.state = BotState.IDLE;
    session.tempData = {};
  });

  bot.on("callback_query", (query) => {
    const chatId = query.message?.chat.id;
    if (!chatId) return;

    if (query.data === "admin_logout") {
      if (isAdminSession(chatId)) {
        clearAdminSession(chatId);
        bot.sendMessage(chatId, "✅ Admin session ended.", {
          reply_markup: mainMenuKeyboard,
        });
      }
      bot.answerCallbackQuery(query.id);
      return;
    }

    if (!isAdminSession(chatId)) return;

    if (query.data === "admin_all_reviews") {
      const reviews = getAllReviews();
      if (reviews.length === 0) {
        bot.sendMessage(chatId, "📭 No reviews yet.", {
          reply_markup: adminPanelKeyboard(),
        });
      } else {
        const lines: string[] = [`📋 <b>All Reviews (${reviews.length}):</b>`, ""];
        reviews.forEach((r, i) => {
          const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
          const date = new Date(r.date).toLocaleString();
          lines.push(`${i + 1}. <b>${escapeHtml(r.name)}</b> — ${stars}`);
          lines.push(`   ${escapeHtml(r.comment)}`);
          lines.push(`   📅 ${date} | ID: \`${r.id.slice(0, 8)}\``);
          lines.push("");
        });
        bot.sendMessage(chatId, lines.join("\n"), {
          parse_mode: "HTML",
          reply_markup: adminAllReviewsKeyboard(),
        });
      }
      bot.answerCallbackQuery(query.id);
    }

    if (query.data === "admin_stats") {
      const stats = getReviewStats();
      const msg = [
        "📊 <b>Admin Statistics:</b>",
        "",
        `📝 Total: <b>${stats.total}</b>`,
        `⭐ Average: <b>${stats.average.toFixed(1)}/5</b>`,
        "",
        `5★: ${stats.breakdown[5] || 0}`,
        `4★: ${stats.breakdown[4] || 0}`,
        `3★: ${stats.breakdown[3] || 0}`,
        `2★: ${stats.breakdown[2] || 0}`,
        `1★: ${stats.breakdown[1] || 0}`,
      ].join("\n");
      bot.sendMessage(chatId, msg, {
        parse_mode: "HTML",
        reply_markup: adminStatsKeyboard(),
      });
      bot.answerCallbackQuery(query.id);
    }

    if (query.data === "admin_delete_review") {
      const reviews = getAllReviews();
      if (reviews.length === 0) {
        bot.sendMessage(chatId, "📭 No reviews to delete.", {
          reply_markup: adminPanelKeyboard(),
        });
      } else {
        bot.sendMessage(chatId, "🗑️ Select a review to delete:", {
          reply_markup: adminDeleteKeyboard(reviews),
        });
      }
      bot.answerCallbackQuery(query.id);
    }

    if (query.data === "admin_reply_review") {
      const reviews = getAllReviews();
      if (reviews.length === 0) {
        bot.sendMessage(chatId, "📭 No reviews to reply to.", {
          reply_markup: adminPanelKeyboard(),
        });
      } else {
        bot.sendMessage(chatId, "💬 Select a review to reply to:", {
          reply_markup: adminReplyKeyboard(reviews),
        });
      }
      bot.answerCallbackQuery(query.id);
    }

    if (query.data?.startsWith("reply_review_")) {
      const reviewId = query.data.replace("reply_review_", "");
      const review = getAllReviews().find((r) => r.id === reviewId);
      if (!review) {
        bot.sendMessage(chatId, "❌ Review not found.", {
          reply_markup: adminPanelKeyboard(),
        });
      } else {
        const session = sessions.get(chatId) || { state: BotState.IDLE, tempData: {} };
        session.state = BotState.AWAITING_ADMIN_REPLY;
        session.tempData = { replyToId: review.telegramId, replyToName: review.name };
        sessions.set(chatId, session);

        const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
        const preview = [
          "💬 <b>Replying to:</b>",
          "",
          `👤 <b>${escapeHtml(review.name)}</b> — ${stars}`,
          `📝 ${escapeHtml(review.comment)}`,
          "",
          "✍️ Type your reply message:",
        ].join("\n");

        bot.sendMessage(chatId, preview, {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "❌ Cancel", callback_data: "cancel_reply" }],
            ],
          },
        });
      }
      bot.answerCallbackQuery(query.id);
    }

    if (query.data === "cancel_reply") {
      const session = sessions.get(chatId);
      if (session) {
        session.state = BotState.IDLE;
        session.tempData = {};
      }
      bot.sendMessage(chatId, "❌ Reply cancelled.", {
        reply_markup: adminPanelKeyboard(),
      });
      bot.answerCallbackQuery(query.id);
    }

    if (query.data?.startsWith("delete_review_")) {
      const reviewId = query.data.replace("delete_review_", "");
      const deleted = deleteReview(reviewId);
      if (deleted) {
        bot.sendMessage(chatId, "✅ Review deleted.", {
          reply_markup: adminPanelKeyboard(),
        });
      } else {
        bot.sendMessage(chatId, "❌ Review not found.", {
          reply_markup: adminPanelKeyboard(),
        });
      }
      bot.answerCallbackQuery(query.id);
    }
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
