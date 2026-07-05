import TelegramBot from "node-telegram-bot-api";
import { UserSession, BotState } from "../types";
import { addReview } from "../services/review-service";
import { sendAdminNotification } from "../middleware/admin-guard";
import { reviewSubmittedKeyboard } from "../keyboards";

export function registerReviewCommand(
  bot: TelegramBot,
  sessions: Map<number, UserSession>,
  adminChatId: number
): void {
  bot.onText(/\/review/, (msg) => {
    const chatId = msg.chat.id;
    const session = sessions.get(chatId) || { state: BotState.IDLE, tempData: {} };

    session.state = BotState.AWAITING_REVIEW_NAME;
    session.tempData = {};
    sessions.set(chatId, session);

    bot.sendMessage(chatId, "👤 What's your name? (This will be shown publicly)");
  });

  bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const session = sessions.get(chatId);
    if (!session || session.state === BotState.IDLE) return;
    if (msg.text?.startsWith("/")) return;

    switch (session.state) {
      case BotState.AWAITING_REVIEW_NAME: {
        const name = msg.text?.trim();
        if (!name || name.length < 2) {
          bot.sendMessage(chatId, "⚠️ Please enter a valid name (at least 2 characters)");
          return;
        }
        session.tempData.name = name;
        session.state = BotState.AWAITING_REVIEW_RATING;

        const starButtons: TelegramBot.InlineKeyboardButton[] = [];
        for (let i = 1; i <= 5; i++) {
          starButtons.push({
            text: "★".repeat(i) + "☆".repeat(5 - i),
            callback_data: `rate_${i}`,
          });
        }

        bot.sendMessage(chatId, `Thanks, <b>${escapeHtml(name)}</b>! How would you rate DeenFlow?`, {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              starButtons,
              [{ text: "❌ Cancel", callback_data: "cancel_review" }],
            ],
          },
        });
        break;
      }

      case BotState.AWAITING_REVIEW_COMMENT: {
        const comment = msg.text?.trim();
        if (!comment || comment.length < 5) {
          bot.sendMessage(chatId, "⚠️ Please write at least 5 characters for your review");
          return;
        }
        session.tempData.comment = comment;
        session.state = BotState.AWAITING_REVIEW_CONFIRM;

        const stars = "★".repeat(session.tempData.rating as number) + "☆".repeat(5 - (session.tempData.rating as number));
        const preview = [
          "📋 <b>Review Preview:</b>",
          "",
          `👤 <b>Name:</b> ${escapeHtml(session.tempData.name as string)}`,
          `⭐ <b>Rating:</b> ${stars}`,
          `📝 <b>Comment:</b>`,
          escapeHtml(comment),
          "",
          "Submit this review?",
        ].join("\n");

        bot.sendMessage(chatId, preview, {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "✅ Submit", callback_data: "confirm_review" },
                { text: "✏️ Edit", callback_data: "edit_review" },
              ],
              [
                { text: "❌ Cancel", callback_data: "cancel_review" },
              ],
            ],
          },
        });
        break;
      }
    }
  });

  bot.on("callback_query", (query) => {
    const chatId = query.message?.chat.id;
    if (!chatId) return;

    const session = sessions.get(chatId);
    if (!session) return;

    if (query.data?.startsWith("rate_")) {
      const rating = parseInt(query.data.split("_")[1]);
      if (rating >= 1 && rating <= 5) {
        session.tempData.rating = rating;
        session.state = BotState.AWAITING_REVIEW_COMMENT;

        const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
        bot.sendMessage(chatId, `⭐ Rated: ${stars}\n\n📝 Now write your review (at least 5 characters):`);
      }
      bot.answerCallbackQuery(query.id);
    }

    if (query.data === "edit_review" && session.state === BotState.AWAITING_REVIEW_CONFIRM) {
      session.state = BotState.AWAITING_REVIEW_NAME;
      session.tempData = {};
      bot.sendMessage(chatId, "👤 Let's start over. What's your name?");
      bot.answerCallbackQuery(query.id);
    }

    if (query.data === "confirm_review" && session.state === BotState.AWAITING_REVIEW_CONFIRM) {
      const { name, rating, comment } = session.tempData;

      const review = addReview({
        name: name as string,
        telegramId: chatId,
        telegramUsername: undefined,
        rating: rating as number,
        comment: comment as string,
      });

      sendAdminNotification(bot, adminChatId, {
        name: review.name,
        rating: review.rating,
        comment: review.comment,
        date: review.date,
      });

      const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
      const successMessage = [
        "✅ <b>Review submitted!</b>",
        "",
        `Thank you, <b>${escapeHtml(review.name)}</b>!`,
        `Your ${stars} review has been saved.`,
        "",
        "JazakAllahu Khairan! 🌙",
      ].join("\n");

      bot.sendMessage(chatId, successMessage, {
        parse_mode: "HTML",
        reply_markup: reviewSubmittedKeyboard(),
      });

      session.state = BotState.IDLE;
      session.tempData = {};
      bot.answerCallbackQuery(query.id);
    }

    if (query.data === "cancel_review") {
      const stars = session.tempData.rating
        ? " " + "★".repeat(session.tempData.rating as number)
        : "";

      bot.sendMessage(chatId, `❌ Review${stars} cancelled.`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✍️ Try Again", callback_data: "start_review" },
              { text: "🏠 Main Menu", callback_data: "back_to_menu" },
            ],
          ],
        },
      });

      session.state = BotState.IDLE;
      session.tempData = {};
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
