import TelegramBot from "node-telegram-bot-api";
import { UserSession, BotState } from "../types";
import { showReviewsPage } from "./reviews";
import { showStats } from "./stats";
import { showAdminPanel } from "./admin";
import { mainMenuKeyboard } from "../keyboards";

export function registerStartCommand(
  bot: TelegramBot,
  sessions: Map<number, UserSession>
): void {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from?.first_name || "there";

    sessions.set(chatId, { state: BotState.IDLE, tempData: {} });

    const welcomeMessage = [
      `Assalamu Alaikum, ${firstName}! 🌙`,
      "",
      "Welcome to <b>DeenFlow Reviews</b>.",
      "Share your experience and see what others say.",
      "",
      "Tap a button below to get started:",
    ].join("\n");

    bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: "HTML",
      reply_markup: mainMenuKeyboard,
    });
  });

  bot.on("callback_query", (query) => {
    const chatId = query.message?.chat.id;
    if (!chatId) return;

    if (query.data === "back_to_menu") {
      sessions.set(chatId, { state: BotState.IDLE, tempData: {} });

      const message = [
        "🏠 <b>Main Menu</b>",
        "",
        "What would you like to do?",
      ].join("\n");

      bot.sendMessage(chatId, message, {
        parse_mode: "HTML",
        reply_markup: mainMenuKeyboard,
      });
      bot.answerCallbackQuery(query.id);
      return;
    }

    if (query.data === "start_review") {
      const session = sessions.get(chatId) || { state: BotState.IDLE, tempData: {} };
      session.state = BotState.AWAITING_REVIEW_NAME;
      session.tempData = {};
      sessions.set(chatId, session);

      bot.sendMessage(chatId, "👤 What's your name? (This will be shown publicly)");
      bot.answerCallbackQuery(query.id);
      return;
    }

    if (query.data === "view_reviews") {
      showReviewsPage(bot, chatId, 0);
      bot.answerCallbackQuery(query.id);
      return;
    }

    if (query.data === "view_stats") {
      showStats(bot, chatId);
      bot.answerCallbackQuery(query.id);
      return;
    }

    if (query.data === "admin_panel") {
      showAdminPanel(bot, chatId);
      bot.answerCallbackQuery(query.id);
      return;
    }

    if (query.data === "noop") {
      bot.answerCallbackQuery(query.id);
    }
  });
}
